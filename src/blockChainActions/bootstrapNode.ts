import { NodeRepository, NodeService, TransactionRepository } from '@services';
import { INodeProps, type INode } from '@models';
import { ENV } from '@ServerTypes';
import { startHeartbeat } from './heartbeat';
import { formatMessage, LoggerUtil, signWithPrivateKey } from '@utils';
import { mineBlock } from './mine';
import { BlockchainRepository } from '../services/blockchain/BlockChainRepository';
import { BlockchainService, verifyBlockHash } from '../services/blockchain/BlockChainService';

const logger = LoggerUtil.getLogger();

export async function bootstrapNode(): Promise<void> {
  let myNode = await NodeService.getMyNode(INodeProps.self);

  // Set my node as connected
  await NodeRepository.updateOne(
    {
      isMySelf: true
    },
    {
      isConnected: true
    }
  );
  if (myNode) {
    logger.info('🔄 My Node already exists, skipping creation');
  } else {
    const idOnNetwork = crypto.randomUUID();

    const nodeData = {
      idOnNetwork,
      isMySelf: true,
      isConnected: true,
      address: ENV.nodeAddress
    } as INode;

    myNode = await NodeService.setMyNode(nodeData);
    logger.info('✅ Node created as myself: ', idOnNetwork);
  }

  const existingNodes = await NodeService.getAllNodes();
  const otherNodes = existingNodes.filter((n) => !n.isMySelf);

  const nodesToConnect = otherNodes.length > 0 ? otherNodes.map((n) => n.address) : ENV.defaultNodes;

  const formatedMessage = formatMessage({
    idOnNetwork: myNode.idOnNetwork,
    address: myNode.address!,
    publicKey: myNode.publicKey!
  });
  const signature = await signWithPrivateKey(myNode.privateKey!, formatedMessage);
  const myChainCount = await BlockchainRepository.countBlockChain();

  for (const nodeUrl of nodesToConnect) {
    try {
      if (nodeUrl === myNode.address) {
        logger.warn(`🔂  Skipping self node: ${nodeUrl}`);
        continue;
      }
      logger.info(`🌐 Trying to connect to node: ${nodeUrl}`);

      const res = await fetch(`${nodeUrl}/node/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idOnNetwork: myNode.idOnNetwork,
          address: myNode.address,
          publicKey: myNode.publicKey,
          signature
        })
      });

      if (!res.ok) {
        logger.warn(`⚠️ Failed to register to node: ${nodeUrl} (${res.status})`);
        continue;
      }

      const otherNodeData = (await res.json()) as any;
      const nodeData = otherNodeData.data as INode;
      await NodeService.setOtherNode(nodeData);

      logger.info(`✅ Successfully connected to: ${nodeUrl}`);

      // Get full chain list from node, if it grater than current full node list save them
      const fullChainRes = await fetch(`${nodeUrl}/blockchain/get-full-chain`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!fullChainRes.ok) {
        logger.warn(`⚠️ Failed to get full chain from node: ${nodeUrl} (${fullChainRes.status})`);
        continue;
      }

      const fullChain = (await fullChainRes.json()) as any;
      const { data: blocks, documentCount } = fullChain;
      if (documentCount > myChainCount) {
        logger.info(`🔄 Syncing with node: ${nodeUrl}`);
        const allTransactions = blocks.reduce((acc: any[], block: any) => {
          if (block.transactions && Array.isArray(block.transactions)) {
            return acc.concat(block.transactions);
          }
          return acc;
        }, []);
        // TODO: validate every block and transaction!
        try {
          for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const isVerifiedBlock = verifyBlockHash(block);
            if (!isVerifiedBlock) {
              logger.error(`❌ Invalid block hash: ${block.hash}`);
              throw new Error('Block validation failed');
            }
            const isTransactionsVerified = await BlockchainService.verifyTransactions(block.transactions);
            if (!isTransactionsVerified) {
              logger.error(`❌ Invalid transactions in block: ${block.hash}`);
              throw new Error('Transaction validation failed');
            }
          }
          // replace all transactions with the new ones
          await TransactionRepository.deleteAll({});
          // replcae all blocks with the new ones
          await BlockchainRepository.deleteAll({});

          await BlockchainRepository.insertMany(blocks);
          await TransactionRepository.insert(allTransactions);

          logger.info(`✅ Synced ${documentCount} blocks from node: ${nodeUrl}`);
        } catch (error) {
          logger.error('❌ Error validating blocks:', (error as Error).message);
          continue;
        }
      }
    } catch (err) {
      logger.warn(`⚠️ Failed to connect to ${nodeUrl}:`, (err as Error).message);
    }
  }

  // Start heartbeat to send periodic updates to other nodes
  logger.info('Starting heartbeat to send periodic updates to other nodes');
  startHeartbeat();

  setInterval(
    async () => {
      const myUpdatedNode = await NodeService.getMyNode(INodeProps.self);
      if (myUpdatedNode!.isMining) {
        logger.info('⏳ Node is already mining, skipping block creation');
      } else {
        await mineBlock(myNode);
      }
    },
    // 1000 * 60 * 2
    1000 * 30
  ); // every 2 minutes
}
