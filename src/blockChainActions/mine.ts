import { BlockModel, IBlock, IBlockProps } from '../models/block';
import { ITransactionStatus, TransactionModel } from '../models/transaction';
import { MempoolTransactionModel } from '../models/mempoolTransaction';
import { createHash } from 'crypto';
import { broadcastBlock } from './broadcastBlock';
import { NodeRepository } from '@services';
import { formatMessage, LoggerUtil, signWithPrivateKey } from '@utils';
import type { Logger } from 'winston';
import { BlockchainRepository } from '../services/blockchain/BlockChainRepository';
import type { INode } from '@models';
import { calculateTxHash } from '../utils/cryptography/hash';
import type mongoose from 'mongoose';

const MAX_TRANSACTIONS_PER_BLOCK = 7;
export const DIFFICULTY_PREFIX = '00000'; // Number of zeros in block hash at the beginning

export interface IBaseTransaction {
  _id?: mongoose.Types.ObjectId;
  fromAddress: string;
  toAddress: string;
  amount: number;
  gasFee: number;
  txHash: string;
  signature?: string;
  timestamp?: Number;
}

const logger: Logger = LoggerUtil.getLogger();

async function createRewardTransaction(myNode: INode, timestamp: number) {
  const rewardAmount = 50_000_000; // Example: 50 coins (in atoshis) + total gas fees
  const fromAdderess = 'COINBASE'; // Special address for reward transaction
  const formatedMessage = formatMessage({
    publicKey: myNode.publicKey!,
    fromAddress: fromAdderess,
    toAddress: myNode.publicKey!,
    amount: rewardAmount,
    gasFee: 0,
    timestamp
  });

  const signature = await signWithPrivateKey(myNode.privateKey!, formatedMessage);
  const txHash = calculateTxHash({
    fromAddress: fromAdderess,
    toAddress: myNode.publicKey!,
    amount: rewardAmount,
    gasFee: 0,
    timestamp: timestamp
  });
  const rewardTransaction = await TransactionModel.create({
    fromAddress: fromAdderess, // Special address
    toAddress: myNode.publicKey,
    amount: rewardAmount,
    gasFee: 0,
    timestamp,
    signature: signature,
    txHash: txHash,
    status: ITransactionStatus.confirmed
  });

  return { rewardTransaction, rewardAmount };
}

export async function mineBlock(myNode: INode) {
  const { publicKey: minerAddress } = myNode;
  // Step 0: Set the node as mining
  await NodeRepository.update(myNode._id!, {
    isMining: true
  }).catch((err) => {
    logger.error('Error updating node mining status:', err);
  });
  // Step 1: Pick pending transactions from the mempool
  const mempoolTransactions = await MempoolTransactionModel.find({ status: 'pending', expiresAt: { $gte: Date.now() } })
    .limit(MAX_TRANSACTIONS_PER_BLOCK)
    .lean();
  if (mempoolTransactions.length === 0) {
    logger.info('No transactions to mine. Creating a reward-only block...');
  }

  const transactions: IBaseTransaction[] = [];
  let totalFees = 0;

  for (const mempoolTx of mempoolTransactions) {
    if (mempoolTx && '_id' in mempoolTx) {
      totalFees += mempoolTx.gasFee || 0;
      const mempoolTransactionData = {
        _id: mempoolTx._id,
        fromAddress: mempoolTx.fromAddress,
        toAddress: mempoolTx.toAddress,
        amount: mempoolTx.amount,
        gasFee: mempoolTx.gasFee,
        txHash: mempoolTx.txHash,
        signature: mempoolTx.signature,
        timestamp: mempoolTx.timestamp,
        status: ITransactionStatus.confirmed
      };
      const createdNewTransaction = await TransactionModel.create(mempoolTransactionData);
      transactions.push(createdNewTransaction);
    }
  }

  // Step 2: Create reward transaction
  const timestamp = Date.now();
  const { rewardTransaction, rewardAmount } = await createRewardTransaction(myNode, timestamp);

  transactions.unshift(rewardTransaction); // Reward transaction comes first

  // Step 3: Create new block
  const previousBlock = await BlockModel.findOne().sort({ createdAt: -1 }).exec();
  const previousHash = previousBlock ? previousBlock.hash : 'GENESIS';

  let nonce = 0;
  let hash = '';

  // Step 4: Mining - Proof of Work
  const startMiningTime = Date.now();
  logger.info(`⛏️  Mining block...`);
  while (true) {
    const dataToHash = previousHash + timestamp + JSON.stringify(transactions) + nonce;
    hash = createHash('sha256').update(dataToHash).digest('hex');

    if (hash.startsWith(DIFFICULTY_PREFIX)) {
      break;
    }
    nonce++;
  }
  const miningTime = Date.now() - startMiningTime;

  // Step 5: Get last transaction and increment block index
  const lastBlock = await BlockchainRepository.getLastBlock();
  const blockIndex = lastBlock ? lastBlock.index + 1 : 0;

  // Step 6: Save the block
  const newBlock: IBlock = await BlockModel.create({
    previousHash,
    totalFees,
    miner: minerAddress,
    hash,
    nonce,
    timestamp,
    transactions: transactions,
    rewardAddress: minerAddress,
    rewardAmount,
    index: blockIndex,
    miningTime,
    difficulty: DIFFICULTY_PREFIX.length
  });

  // Step 7: Mark mined transactions as broadcasted or remove them
  const minedTxIds = mempoolTransactions.map((tx) => tx._id);
  await MempoolTransactionModel.deleteMany({ _id: { $in: minedTxIds } });

  logger.info(`✅ Mined new block! Hash: ${hash} | Nonce: ${nonce}`);

  // Step 8: assign the falsy value to the node isMining
  await NodeRepository.update(myNode._id!, {
    isMining: false
  }).catch((err) => {
    logger.error('Error updating node mining status:', err);
  });

  const newBlockToBroadCast = await BlockchainRepository.findOne({ hash }, IBlockProps.self);

  // Step 9: Broadcast the new block to other nodes
  await broadcastBlock(myNode, newBlock);

  return newBlock;
}
