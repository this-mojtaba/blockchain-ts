import { NodeService } from '@services';
import { LoggerUtil } from '@utils';
import type { Logger } from 'winston';
import type { ITransactionMempoolInput } from '@controllers';

const logger: Logger = LoggerUtil.getLogger();

export async function broadcastMempoolTransaction(
  mempoolTransaction: Partial<ITransactionMempoolInput>,
  expiresAt: Date,
  txHash: string
) {
  const peers = await NodeService.getConnectedNodes();
  if (peers.length === 0) {
    logger.info('No peers to broadcast the transaction to.');
    return;
  }
  logger.info(`Broadcasting transaction to ${peers.length} peers...`);

  const bodyData = {
    fromAddress: mempoolTransaction.fromAddress,
    toAddress: mempoolTransaction.toAddress,
    amount: mempoolTransaction.amount,
    gasFee: mempoolTransaction.gasFee,
    timestamp: mempoolTransaction.timestamp,
    signature: mempoolTransaction.signature,
    txHash: txHash,
    expiresAt: expiresAt
  };

  for (const peer of peers) {
    try {
      const res = await fetch(`${peer.address}/mempool-transaction/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      logger.info(`✅ Successfully broadcasted transaction to ${peer}`);
    } catch (err) {
      logger.warn(`❌ Failed to broadcast transaction to ${peer}:`, err);
    }
  }
}
