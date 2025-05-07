import { NodeService } from '@services';
import { INodeProps, type INode } from '@models';
import { LoggerUtil, signWithPrivateKey } from '@utils';
import type { Logger } from 'winston';

const logger: Logger = LoggerUtil.getLogger();

export async function broadcastDisconnectionNotice(): Promise<void> {
  const myNode = await NodeService.getMyNode(INodeProps.self);
  if (!myNode || !myNode.privateKey) {
    logger.warn('⚠️ My node or private key not found.');
    return;
  }

  const connectedNodes = await NodeService.getConnectedNodes();

  const signature = await signWithPrivateKey(myNode.privateKey, myNode.idOnNetwork);

  for (const node of connectedNodes) {
    if (node.isMySelf) continue;

    try {
      logger.info(`📡 Sending disconnect notice to ${node.address}...`);

      const res = await fetch(`${node.address}/node/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idOnNetwork: myNode.idOnNetwork,
          signature,
          publicKey: myNode.publicKey
        })
      });

      if (!res.ok) {
        logger.warn(`⚠️ Could not notify ${node.address}: ${res.status}`);
      }
    } catch (err) {
      logger.warn(`⚠️ Error notifying ${node.address}:`, (err as Error).message);
    }
  }
}
