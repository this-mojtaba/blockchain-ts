import { NodeService } from '@services';
import { INodeProps } from '@models';
import { formatMessage, LoggerUtil, signWithPrivateKey } from '@utils';

const logger = LoggerUtil.getLogger();
export async function sendHeartbeatToAllNodes(): Promise<void> {
  const myNode = await NodeService.getMyNode(INodeProps.self);
  if (!myNode) return;

  if (!myNode.privateKey) {
    logger.warn('No PRIVATE_KEY provided');
    return;
  }

  const allOtherNodes = await NodeService.getConnectedNodes();

  for (const node of allOtherNodes) {
    try {
      const message = formatMessage({
        publicKey: myNode.publicKey!,
        idOnNetwork: myNode.idOnNetwork
      });
      const signature = await signWithPrivateKey(myNode.privateKey, message);

      const res = await fetch(`${node.address}/node/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idOnNetwork: myNode.idOnNetwork,
          publicKey: myNode.publicKey,
          signature
        })
      });

      if (!res.ok) {
        logger.warn(`⚠️ Heartbeat to ${node.address} failed: ${res.status}`);
      }
    } catch (error) {
      logger.warn(`❌ Error sending heartbeat to ${node.address}`, (error as Error).message);
    }
  }
}

export function startHeartbeat() {
  setInterval(async () => {
    await sendHeartbeatToAllNodes();
  }, 30_000);
}
