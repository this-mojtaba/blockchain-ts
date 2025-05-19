import { generateKeyPair } from '@utils';
import { NodeRepository } from './NodeRepository';
import { INodeProps, type INode, type ObjectIDType } from '@models';
import { hash } from 'node:crypto';

export class NodeServiceClass {
  async getMyNode(props: string[]): Promise<INode | null> {
    return await NodeRepository.findOne({ isMySelf: true }, props);
  }

  async setMyNode(data: INode): Promise<INode> {
    const existing = await this.getMyNode(INodeProps.self);

    if (existing) {
      return (await NodeRepository.update(existing._id!, data)) as INode;
    } else {
      const { publicKeyPem: publicKey, privateKeyPem: privateKey } = await generateKeyPair();

      const hashedAddress = hash('sha256', publicKey);

      return await NodeRepository.create({ ...data, isMySelf: true, publicKey, privateKey, hashedAddress });
    }
  }

  async setOtherNode(data: INode): Promise<INode> {
    const existing = await NodeRepository.findOne({ idOnNetwork: data.idOnNetwork }, INodeProps.self);

    if (existing) {
      return (await NodeRepository.update(existing._id!, {
        address: data.address,
        publicKey: data.publicKey,
        lastSeen: new Date(),
        isConnected: true
      }))!;
    }

    return await NodeRepository.create({
      ...data,
      isMySelf: false,
      publicKey: data.publicKey,
      isConnected: true,
      address: data.address,
      lastSeen: new Date()
    });
  }

  async getAllNodes(): Promise<INode[]> {
    return await NodeRepository.findAll();
  }

  async getNodeByNetworkId(networkId: string): Promise<INode | null> {
    return await NodeRepository.findByNetworkId(networkId);
  }

  async updateNodeWithNetworkId(id: ObjectIDType<INode>, data: Partial<INode>): Promise<INode | null> {
    return await NodeRepository.update(id, data);
  }

  async getConnectedNodes(): Promise<INode[]> {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    return await NodeRepository.findAll({
      isConnected: true,
      isMySelf: false,
      updatedAt: { $gte: tenMinutesAgo }
    });
  }
}

export const NodeService = new NodeServiceClass();
