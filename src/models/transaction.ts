import { getModelForClass, modelOptions, prop, type Ref } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import { schemaToProps } from '../utils/model/schemaHelpers';

export const ARSHXCOIN_TO_ATOSHIS = 100_000_000;

export enum ITransactionStatus {
  pending = 'pending',
  confirmed = 'confirmed',
  dropped = 'dropped'
}

@modelOptions({
  schemaOptions: {
    timestamps: true
  },
  options: {
    customName: 'transactions'
  }
})
export class ITransaction {
  public _id?: mongoose.Types.ObjectId; // Explicitly declare _id

  @prop({ required: true })
  public fromAddress!: string;

  @prop({ required: true })
  public toAddress!: string;

  @prop({ required: true })
  public amount!: number; // in atoshis

  @prop({ required: true })
  public gasFee!: number; // in atoshis

  @prop({
    unique: true,
    sparse: true,
    indexOptions: {
      partialFilterExpression: { txHash: { $exists: true, $type: 'string' } }
    }
  })
  public txHash!: string;

  @prop()
  public signature?: string;

  @prop()
  public publicKeySender?: string;

  @prop({ type: Number })
  public timestamp?: Number;

  @prop({ type: String, enum: ITransactionStatus, default: ITransactionStatus })
  public status?: ITransactionStatus;

  toProps?(props: typeof ITransactionProps) {
    return schemaToProps<ITransaction, any>(this, props);
  }
}

type TransactionFieldNames = {
  [K in keyof ITransaction]: string;
};

export const Transaction: TransactionFieldNames = new Proxy<TransactionFieldNames>({} as TransactionFieldNames, {
  get: (_, property) => property.toString()
});

export const ITransactionProps = {
  self: [
    Transaction._id,
    Transaction.fromAddress,
    Transaction.toAddress,
    Transaction.amount,
    Transaction.gasFee,
    Transaction.status,
    Transaction.txHash,
    Transaction.signature,
    Transaction.timestamp,
    Transaction.publicKeySender
  ]
} as Record<string, string[]>;

export const TransactionModel = getModelForClass(ITransaction)<ITransaction>;
