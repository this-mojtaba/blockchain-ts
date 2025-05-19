import { formatMessage, formatTransactions, LoggerUtil, verifySignature } from '@utils';
import { BlockchainRepository } from './BlockChainRepository';
import { ITransaction, ITransactionProps, ITransactionStatus, TransactionModel } from '@models';
import { BlockModel, type IBlock } from '../../models/block';
import { createHash } from 'crypto';
import { DIFFICULTY_PREFIX } from '../../blockChainActions/mine';
import type { Logger } from 'winston';

const logger: Logger = LoggerUtil.getLogger();

function removeExtraSlashes(obj: any) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].replaceAll('\\\\', '\\');
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      removeExtraSlashes(obj[key]);
    }
  }
  return obj;
}

export function verifyBlockHash(block: IBlock): boolean {
  const transactions = block.transactions as any;
  // TODO: format same as mine (use array for it, because objects hasen't ordered!)
  const formatedTransactions = formatTransactions(transactions);

  let dataToHash = block.previousHash + block.timestamp + formatedTransactions + block.nonce;

  const calculatedHash = createHash('sha256').update(dataToHash).digest('hex');

  if (calculatedHash.startsWith(DIFFICULTY_PREFIX) && calculatedHash === block.hash) {
    return true;
  }
  return false;
}

export class BlockchainServiceClass {
  async validateBlock(block: IBlock): Promise<boolean> {
    if (!verifyBlockHash(block)) return false;
    // TODO:
    const transactions = block.transactions as unknown as ITransaction[];
    if (!(await this.verifyTransactions(transactions))) return false;

    return true;
  }

  async validateTransaction(transaction: ITransaction): Promise<boolean> {
    // validate the signature
    let publicKey = transaction.fromAddress;
    if (transaction.fromAddress === 'COINBASE') {
      publicKey = transaction.toAddress;
    }

    const message = formatMessage({
      publicKey: publicKey!,
      fromAddress: transaction.fromAddress,
      toAddress: transaction.toAddress,
      amount: transaction.amount,
      gasFee: transaction.gasFee,
      timestamp: transaction.timestamp
    });

    const isValidSignature = await verifySignature(publicKey, message, transaction.signature!);

    if (!isValidSignature) {
      console.error('❌ Invalid transaction signature.');
      return false;
    }

    return true;
  }

  async verifyTransactions(transactions: ITransaction[]): Promise<boolean> {
    if (!transactions || transactions.length === 0) {
      return false;
    }
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];
      const isValid = await this.validateTransaction(transaction);

      if (isValid === false) {
        console.error(`❌ Transaction ${transaction.txHash} is invalid.`);
        return false;
      }

      const transactionTimestamp = transaction.timestamp! as number;
      if (transactionTimestamp > Date.now()) {
        console.error(`❌ Transaction ${transaction.txHash} has a future timestamp.`);
        return false;
      }

      // check if transaction not exists in our database, create it
      const transactionInDatabase = await TransactionModel.findOne({ txHash: transaction.txHash });
      if (!transactionInDatabase) {
        await TransactionModel.create({
          ...transaction,
          status: ITransactionStatus.confirmed
        });
      }

      // TODO: check sender balance
    }

    return true;
  }

  /**
   * Verify and add a new block to the blockchain
   */
  async addBlockToChain(block: IBlock): Promise<boolean> {
    // 1. Check if block already exists (avoid duplicate blocks)
    const existingBlock = await BlockModel.findOne({ hash: block.hash }).exec();
    if (existingBlock) {
      console.error('❌ Block already exists in the blockchain.');
      return false;
    }

    // 2. Validate the block's hash
    const isHashValid = verifyBlockHash(block);
    if (!isHashValid) {
      console.error('❌ Block hash verification failed.');
      return false;
    }

    // 3. Validate the block's transactions
    const transactions = block.transactions as unknown as ITransaction[];
    const areTransactionsValid = await this.verifyTransactions(transactions);
    if (!areTransactionsValid) {
      console.error('❌ Block transactions verification failed.');
      return false;
    }

    // 4. All good: Save the block
    await BlockModel.create(block);

    logger.info(`✅ Block added to blockchain! Hash: ${block.hash}`);

    return true;
  }

  async getFullChain(): Promise<IBlock[]> {
    const blocks = await BlockModel.find({})
      .sort({ index: 1 })
      .populate({
        path: 'transactions'
      })
      .exec();
    return blocks;
  }
}

export const BlockchainService = new BlockchainServiceClass();
