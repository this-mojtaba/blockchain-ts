import { controller, post, use, validate } from '@decorators';
import { INodeProps, type INode } from '@models';
import { IStatus, type IRequest, type IResponseData, type ISignatureInput } from '@ServerTypes';
import { NodeService } from '@services';
import { CustomError, LoggerUtil, verifySignature } from '@utils';
import { verifySignatureBody } from '../middlewares/signatureVerifier';
import type { Logger } from 'winston';

interface IRegisterNodeInput {
  idOnNetwork: string;
  address: string;
  publicKey: string;
  signature: string;
}

interface IHeartBeatNodeInput extends ISignatureInput {
  idOnNetwork: string;
}

interface IDisconnectNodeInput extends ISignatureInput {
  idOnNetwork: string;
}

const logger: Logger = LoggerUtil.getLogger();
@controller('/node')
export class NodeController {
  @post('/register')
  @validate<IRegisterNodeInput>({
    type: 'object',
    properties: {
      idOnNetwork: { type: 'string' },
      address: { type: 'string' },
      publicKey: { type: 'string' },
      signature: { type: 'string' }
    },
    required: ['idOnNetwork', 'address', 'publicKey', 'signature'],
    additionalProperties: false
  })
  @use(verifySignatureBody)
  async register(req: IRequest): Promise<IResponseData<INode>> {
    const { idOnNetwork, address, publicKey } = req.bodyData as IRegisterNodeInput;

    const existingNode = await NodeService.getNodeByNetworkId(idOnNetwork);

    if (!existingNode) {
      await NodeService.setOtherNode({
        idOnNetwork,
        address,
        publicKey,
        isConnected: true,
        isMySelf: false,
        lastSeen: new Date()
      } as INode);

      logger.info(`📡 New node registered: ${address}`);
    } else {
      await NodeService.updateNodeWithNetworkId(existingNode._id!, {
        lastSeen: new Date(),
        isConnected: true
      });
      logger.info(`🔄 Node already exists. Updated lastSeen: ${address}`);
    }

    const myNode = await NodeService.getMyNode(INodeProps.onNetWork);

    if (!myNode) {
      throw CustomError('This node has not been initialized yet.');
    }

    return {
      data: myNode,
      status: IStatus.success
    };
  }

  @post('/heartbeat')
  @validate<IHeartBeatNodeInput>({
    type: 'object',
    properties: {
      idOnNetwork: { type: 'string' },
      signature: { type: 'string', nullable: true },
      publicKey: { type: 'string' }
    },
    required: ['idOnNetwork', 'publicKey'],
    additionalProperties: false
  })
  @use(verifySignatureBody)
  async heartbeat(req: IRequest): Promise<IResponseData<null>> {
    const { idOnNetwork } = req.bodyData as IHeartBeatNodeInput;

    const existingNode = await NodeService.getNodeByNetworkId(idOnNetwork);

    if (!existingNode) {
      throw CustomError('Node not found');
    }

    await NodeService.updateNodeWithNetworkId(existingNode._id!, {
      lastSeen: new Date(),
      isConnected: true
    });
    logger.info(`🔄 Node Updated lastSeen: ${existingNode.address}`);

    return {
      data: null,
      status: IStatus.success
    };
  }

  @post('/disconnect')
  @validate<IDisconnectNodeInput>({
    type: 'object',
    properties: {
      idOnNetwork: { type: 'string' },
      signature: { type: 'string', nullable: true },
      publicKey: { type: 'string' }
    },
    required: ['idOnNetwork', 'publicKey'],
    additionalProperties: false
  })
  @use(verifySignatureBody)
  async disconnect(req: IRequest): Promise<IResponseData<null>> {
    const { idOnNetwork, signature, publicKey } = req.bodyData as IHeartBeatNodeInput;

    const existingNode = await NodeService.getNodeByNetworkId(idOnNetwork);

    if (!existingNode) {
      throw CustomError('Node not found');
    }

    await NodeService.updateNodeWithNetworkId(existingNode._id!, {
      isConnected: false
    });
    logger.info(`🔌 Node ${idOnNetwork} marked as disconnected`);

    return {
      data: null,
      status: IStatus.success
    };
  }
}
