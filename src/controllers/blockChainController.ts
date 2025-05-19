import { controller, get, post, use, validate } from '@decorators';
import { IStatus, type IRequest, type IResponseData } from '@ServerTypes';
import { CustomError, LoggerUtil } from '@utils';
import { verifySignatureBody } from '../middlewares/signatureVerifier';
import type { Logger } from 'winston';
import { BlockchainService } from '../services/blockchain/BlockChainService';
import type { IBlock } from '../models/block';
import { NodeService } from '@services';

interface IRegisterNodeInput {
  idOnNetwork: string;
  block: {
    index: number;
    previousHash: string;
    hash: string;
    nonce: number;
    difficulty: number;
    timestamp: number;
    transactions: {
      fromAddress: string;
      toAddress: string;
      amount: number;
      gasFee: number;
      txHash: string;
      signature: string;
    }[];
    totalFees: number;
    miner: string;
    miningTime: number;
  };
  signature: string;
  publicKey: string;
}

const logger: Logger = LoggerUtil.getLogger();

@controller('/blockchain')
export class BlockController {
  @post('/receive')
  @validate<IRegisterNodeInput>({
    type: 'object',
    properties: {
      idOnNetwork: { type: 'string' },
      signature: { type: 'string' },
      publicKey: { type: 'string' },
      block: {
        type: 'object',
        properties: {
          index: { type: 'number' },
          previousHash: { type: 'string' },
          hash: { type: 'string' },
          nonce: { type: 'number' },
          difficulty: { type: 'number' },
          timestamp: { type: 'number' },
          transactions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                fromAddress: { type: 'string' },
                toAddress: { type: 'string' },
                amount: { type: 'number' },
                gasFee: { type: 'number' },
                txHash: { type: 'string' },
                signature: { type: 'string' }
              },
              required: ['amount', 'fromAddress', 'toAddress', 'gasFee', 'txHash', 'signature']
            }
          },
          totalFees: { type: 'number' },
          miner: { type: 'string' },
          miningTime: { type: 'number' }
        },
        required: [
          'index',
          'previousHash',
          'hash',
          'nonce',
          'difficulty',
          'timestamp',
          'transactions',
          'totalFees',
          'miner',
          'miningTime'
        ]
      }
    },
    required: ['idOnNetwork', 'block', 'signature', 'publicKey']
  })
  @use(verifySignatureBody)
  async receive(req: IRequest): Promise<IResponseData<null>> {
    const { block, idOnNetwork } = req.bodyData as IRegisterNodeInput;

    logger.info(`✅ Block added to the chain: ${block.hash}`);
    const existingNode = await NodeService.getNodeByNetworkId(idOnNetwork);
    if (!existingNode) {
      throw CustomError('Node not found');
    }

    await BlockchainService.addBlockToChain(block as unknown as IBlock);

    await NodeService.updateNodeWithNetworkId(existingNode._id!, {
      lastSeen: new Date(),
      isConnected: true
    });
    logger.info(`🔄 Node Updated lastSeen: ${idOnNetwork}`);
    return {
      data: null,
      status: IStatus.success
    };
  }

  @get('/get-full-chain')
  async sync(req: IRequest): Promise<IResponseData<IBlock[]>> {
    const fullChain = await BlockchainService.getFullChain();
    return {
      documentCount: fullChain.length,
      data: fullChain,
      status: IStatus.success
    };
  }
}
