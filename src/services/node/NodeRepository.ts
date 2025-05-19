import { INodeProps, NodeModel, type INode, type ObjectIDType } from '@models';
import type { FilterQuery, UpdateQuery } from 'mongoose';

class NodeRepositoryClass {
  async create(node: Partial<INode>): Promise<INode> {
    return await NodeModel.create(node);
  }

  async findAll(filter: FilterQuery<INode> = {}): Promise<INode[]> {
    return await NodeModel.find(filter);
  }

  async findById(id: ObjectIDType<INode>): Promise<INode | null> {
    return await NodeModel.findById(id);
  }

  async findByNetworkId(networkId: string): Promise<INode | null> {
    return await NodeModel.findOne({
      idOnNetwork: networkId
    });
  }

  async findOne(filter: FilterQuery<INode>, props: string[]): Promise<INode | null> {
    return await NodeModel.findOne(filter, props);
  }

  async update(id: ObjectIDType<INode>, update: UpdateQuery<INode>): Promise<INode | null> {
    return await NodeModel.findByIdAndUpdate(id, update, { new: true });
  }

  async updateOne(query: FilterQuery<INode>, update: UpdateQuery<INode>): Promise<INode | null> {
    return await NodeModel.findOneAndUpdate(query, update, { new: true });
  }

  async delete(id: ObjectIDType<INode>): Promise<boolean> {
    const result = await NodeModel.findByIdAndDelete(id);
    return result !== null;
  }
}

export const NodeRepository = new NodeRepositoryClass();
