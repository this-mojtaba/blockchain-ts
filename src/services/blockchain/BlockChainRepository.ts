import type { FilterQuery, UpdateQuery } from 'mongoose';
import { BlockModel, type IBlock } from '../../models/block';
import { ITransactionProps, type ObjectIDType } from '@models';

class BlockChainRepositoryClass {
  async create(block: Partial<IBlock>): Promise<IBlock> {
    return await BlockModel.create(block);
  }

  async insertMany(blocks: Partial<IBlock>[]): Promise<void> {
    await BlockModel.insertMany(blocks);
  }

  async findAll(filter: FilterQuery<IBlock> = {}): Promise<IBlock[]> {
    return await BlockModel.find(filter);
  }

  async findById(id: ObjectIDType<IBlock>): Promise<IBlock | null> {
    return await BlockModel.findById(id);
  }

  async findByNetworkId(networkId: string): Promise<IBlock | null> {
    return await BlockModel.findOne({
      idOnNetwork: networkId
    });
  }

  async findOne(filter: FilterQuery<IBlock>, props: string[]): Promise<IBlock | null> {
    return await BlockModel.findOne(filter, props)
      .populate([
        {
          path: 'transactions',
          select: ITransactionProps.self
        }
      ])
      .lean();
  }

  async update(id: ObjectIDType<IBlock>, update: UpdateQuery<IBlock>): Promise<IBlock | null> {
    return await BlockModel.findByIdAndUpdate(id, update, { new: true });
  }

  async updateOne(query: FilterQuery<IBlock>, update: UpdateQuery<IBlock>): Promise<IBlock | null> {
    return await BlockModel.findByIdAndUpdate(query, update, { new: true });
  }

  async delete(id: ObjectIDType<IBlock>): Promise<boolean> {
    const result = await BlockModel.findByIdAndDelete(id);
    return result !== null;
  }

  async deleteAll(filters: FilterQuery<IBlock>): Promise<void> {
    await BlockModel.deleteMany(filters);
  }

  async getLastBlock(): Promise<IBlock | null> {
    const lastBlock = await BlockModel.findOne().sort({ index: -1 }).limit(1);
    return lastBlock;
  }

  async countBlockChain(): Promise<number> {
    const count = await BlockModel.countDocuments({});
    return count;
  }
}

export const BlockchainRepository = new BlockChainRepositoryClass();
