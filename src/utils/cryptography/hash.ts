import { createHash } from 'crypto';

export function calculateTxHash(tx: {
  fromAddress: string;
  toAddress: string;
  amount: number;
  gasFee: number;
  timestamp: number;
  signature?: string;
}): string {
  const data = `${tx.fromAddress}|${tx.toAddress}|${tx.amount}|${tx.gasFee}|${tx.timestamp}|${tx.signature || ''}`;
  return createHash('sha256').update(data).digest('hex');
}
