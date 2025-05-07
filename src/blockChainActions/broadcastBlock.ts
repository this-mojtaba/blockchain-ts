import { NodeService } from '@services';
import type { IBlock } from '../models/block';
import { formatMessage, LoggerUtil, signWithPrivateKey } from '@utils';
import type { Logger } from 'winston';
import type { INode } from '@models';

const logger: Logger = LoggerUtil.getLogger();

export async function broadcastBlock(myNode: INode, block: IBlock) {
  const peers = await NodeService.getConnectedNodes();
  if (peers.length === 0) {
    logger.info('No peers to broadcast the block to.');
    return;
  }
  logger.info(`Broadcasting block to ${peers.length} peers...`);

  const formatedMessage = formatMessage({
    idOnNetwork: myNode.idOnNetwork,
    publicKey: myNode.publicKey!
  });
  const signature = await signWithPrivateKey(myNode.privateKey!, formatedMessage);

  const bodyData = {
    idOnNetwork: myNode.idOnNetwork,
    publicKey: myNode.publicKey,
    signature,
    block
  };

  for (const peer of peers) {
    try {
      const res = await fetch(`${peer.address}/blockchain/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      logger.info(`✅ Successfully broadcasted block to ${peer}`);
    } catch (err) {
      logger.warn(`❌ Failed to broadcast block to ${peer}:`, err);
    }
  }
}
