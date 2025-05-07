import { controller, get, post, use, validate } from '@decorators';
import { INodeProps, ITransaction, TransactionModel, ITransactionStatus, type INode } from '@models';
import { IStatus, type IRequest, type IResponseData, type ISignatureInput } from '@ServerTypes';
import { NodeService } from '@services';
import { CustomError, LoggerUtil, verifySignature } from '@utils';
import { verifySignatureBody } from '../middlewares/signatureVerifier';
import type { Logger } from 'winston';
import { calculateTxHash } from '../utils/cryptography/hash';

interface ISearchQuery {
  searchText: string;
}

const logger: Logger = LoggerUtil.getLogger();

@controller('/transaction')
export class TransactionController {
  @get('/search')
  @validate<ISearchQuery>({
    type: 'object',
    properties: {
      searchText: { type: 'string', default: '' }
    },
    required: [],
    additionalProperties: false
  })
  async searchTransactions(req: IRequest): Promise<IResponseData<ITransaction[]>> {
    const { searchText } = req.bodyData as ISearchQuery;
    const regex = new RegExp(searchText, 'i'); // i = case-insensitive

    const results = await TransactionModel.find({
      $or: [{ fromAddress: regex }, { toAddress: regex }, { txHash: regex }]
    }).sort({ createdAt: -1 }); // optional: latest first

    return {
      data: results,
      status: IStatus.success
    };
  }
}
