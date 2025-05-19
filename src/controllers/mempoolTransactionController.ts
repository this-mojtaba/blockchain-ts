import { controller, post, use, validate } from '@decorators';
import { MempoolTransactionModel, IMempoolTransaction, ARSHXCOIN_TO_ATOSHIS, MempoolTransactionStatus } from '@models';
import { IStatus, type IRequest, type IResponseData } from '@ServerTypes';
import { CustomError, LoggerUtil } from '@utils';
import { verifySignatureBody } from '../middlewares/signatureVerifier';
import type { Logger } from 'winston';
import { calculateTxHash } from '../utils/cryptography/hash';
import { TransactionRepository } from '@services';
import { broadcastMempoolTransaction } from '../blockChainActions/broadcastMempoolTransaction';

export interface ITransactionMempoolInput {
  publicKey: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  gasFee: number;
  timestamp: number;
  signature: string;
}

const logger: Logger = LoggerUtil.getLogger();

@controller('/mempool-transaction')
export class MempoolTransactionController {
  @post('/send')
  @validate<ITransactionMempoolInput>({
    type: 'object',
    properties: {
      publicKey: { type: 'string' },
      fromAddress: { type: 'string' },
      toAddress: { type: 'string' },
      amount: { type: 'number' },
      gasFee: { type: 'number' },
      timestamp: { type: 'number' },
      signature: { type: 'string' }
    },
    required: ['publicKey', 'fromAddress', 'toAddress', 'amount', 'gasFee', 'timestamp', 'signature'],
    additionalProperties: false
  })
  @use(verifySignatureBody)
  async sendTransactionToMempool(req: IRequest): Promise<IResponseData<IMempoolTransaction>> {
    const { fromAddress, toAddress, amount, gasFee, timestamp, signature, publicKey } =
      req.bodyData as ITransactionMempoolInput;

    const totalAmount = (amount + gasFee) / ARSHXCOIN_TO_ATOSHIS;

    const senderBalance = await TransactionRepository.getAddressBalance(fromAddress);
    if (senderBalance < totalAmount) {
      throw CustomError('🤑 No enough balance');
    }

    const txHash = calculateTxHash({
      fromAddress,
      toAddress,
      amount,
      gasFee,
      timestamp,
      signature
    });

    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 min expirely

    const newTransaction = await MempoolTransactionModel.create({
      fromAddress,
      toAddress,
      amount,
      gasFee,
      timestamp,
      signature,
      txHash,
      expiresAt,
      publicKeySender: publicKey,
      status: MempoolTransactionStatus.Pending
    });

    logger.info(`📥 New transaction received from ${fromAddress} to ${toAddress}`);

    // broadcast to other nodes | send to /mempool-transaction/send of other nodes
    await broadcastMempoolTransaction(
      {
        fromAddress,
        toAddress,
        amount,
        gasFee,
        timestamp,
        signature
      },
      expiresAt,
      txHash
    ).catch((err) => {
      logger.error('Error broadcasting transaction:', err);
    });

    return {
      data: newTransaction,
      status: IStatus.success
    };
  }
}
