import { getModelForClass, modelOptions, prop, type Ref } from '@typegoose/typegoose';
import { schemaToProps } from '../utils/model/schemaHelpers';
import mongoose from 'mongoose';
import { ITransaction } from './transaction';

export enum MempoolTransactionStatus {
  Pending = 'pending',
  Broadcasted = 'broadcasted',
  Dropped = 'dropped'
}

@modelOptions({
  schemaOptions: {
    timestamps: true
  },
  options: {
    customName: 'mempool_transactions'
  }
})
// TODO add all propeties to it
export class IMempoolTransaction {
  public _id?: mongoose.Types.ObjectId; // Explicitly declare _id

  @prop({ required: true })
  public fromAddress!: string;

  @prop({ required: true })
  public publicKeySender!: string;

  @prop({ required: true })
  public toAddress!: string;

  @prop({ required: true })
  public amount!: number; // in atoshis

  @prop({ required: true })
  public gasFee!: number; // in atoshis

  @prop({})
  public txHash!: string;

  @prop()
  public signature?: string;

  @prop({ type: Number })
  public timestamp?: Number;

  @prop({ type: Boolean, default: false })
  public isMining: boolean = false;

  @prop({ type: Date })
  public expiresAt?: Date;

  @prop({ type: String, enum: MempoolTransactionStatus, default: MempoolTransactionStatus.Pending })
  public status?: MempoolTransactionStatus;

  toProps?(props: typeof IMempoolTransactionProps) {
    return schemaToProps<IMempoolTransaction, any>(this, props);
  }
}

type MempoolTransactionFieldNames = {
  [K in keyof IMempoolTransaction]: string;
};

export const MempoolTransaction: MempoolTransactionFieldNames = new Proxy<MempoolTransactionFieldNames>(
  {} as MempoolTransactionFieldNames,
  {
    get: (_, property) => property.toString
  }
);

export const IMempoolTransactionProps = {
  self: [MempoolTransaction._id, MempoolTransaction.isMining] // TODO:
} as Record<string, string[]>;

export const MempoolTransactionModel = getModelForClass(IMempoolTransaction)<IMempoolTransaction>;
