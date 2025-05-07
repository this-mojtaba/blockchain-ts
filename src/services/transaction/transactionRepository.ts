import type { FilterQuery, UpdateQuery } from 'mongoose';
import { BlockModel, type IBlock } from '../../models/block';
import { ITransaction, ITransactionStatus, TransactionModel, type ObjectIDType } from '@models';

class TransactionRepositoryClass {
  /**
   * Calculates the balance of a given address based on confirmed transactions.
   * @param address Public address to calculate the balance for.
   * @returns The balance in atoshis.
   */
  async getAddressBalance(address: string): Promise<number> {
    const receivedAgg = await TransactionModel.aggregate([
      {
        $match: {
          toAddress: address,
          status: ITransactionStatus.confirmed
        }
      },
      {
        $group: {
          _id: null,
          totalReceived: { $sum: '$amount' }
        }
      }
    ]);

    const totalReceived = receivedAgg[0]?.totalReceived || 0;

    const sentAgg = await TransactionModel.aggregate([
      {
        $match: {
          fromAddress: address,
          status: ITransactionStatus.confirmed
        }
      },
      {
        $group: {
          _id: null,
          totalSent: { $sum: { $add: ['$amount', '$gasFee'] } }
        }
      }
    ]);

    const totalSent = sentAgg[0]?.totalSent || 0;

    return totalReceived - totalSent;
  }

  async deleteAll(filters: FilterQuery<ITransaction>): Promise<void> {
    await TransactionModel.deleteMany(filters);
  }
  async insert(transactions: Partial<IBlock>[]): Promise<void> {
    await TransactionModel.insertMany(transactions);
  }
}

export const TransactionRepository = new TransactionRepositoryClass();
