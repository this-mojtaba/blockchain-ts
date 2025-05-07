import { getModelForClass, modelOptions, prop, type Ref } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import { schemaToProps } from '../utils/model/schemaHelpers';
import { ITransaction } from './transaction';

@modelOptions({
  schemaOptions: {
    timestamps: true
  },
  options: {
    customName: 'blocks'
  }
})
export class IBlock {
  public _id?: mongoose.Types.ObjectId;

  @prop({ type: Number, required: true })
  public index!: number; // Block height

  @prop({ type: String, required: true })
  public previousHash!: string; // Hash of previous block

  @prop({ type: String, required: true })
  public hash!: string; // Current block hash

  @prop({ type: Number, required: true })
  public nonce!: number; // Nonce for Proof of Work

  @prop({ type: Number, required: true })
  public difficulty!: number; // Difficulty level at the time of mining

  @prop({ type: Number, required: true })
  public timestamp!: Number; // When the block was mined

  @prop({ ref: () => ITransaction, required: true, type: [mongoose.Schema.Types.ObjectId] })
  public transactions!: Ref<ITransaction>[]; // List of transactions in this block

  @prop({ type: Number, required: true, default: 0 })
  public totalFees!: number; // Sum of all transaction fees

  @prop({ type: String, required: true })
  public miner!: string; // Public key (address) of the miner who mined this block

  @prop({ type: Number, required: true, default: 0 })
  public miningTime!: number;

  toProps?(props: typeof IBlockProps) {
    return schemaToProps<IBlock, any>(this, props);
  }
}

type BlockFieldNames = {
  [K in keyof IBlock]: string;
};

export const Block: BlockFieldNames = new Proxy<BlockFieldNames>({} as BlockFieldNames, {
  get: (_, property) => property.toString
});

export const IBlockProps = {
  self: [
    Block._id,
    Block.index,
    Block.previousHash,
    Block.hash,
    Block.nonce,
    Block.difficulty,
    Block.timestamp,
    Block.transactions,
    Block.totalFees,
    Block.miner
  ]
} as Record<string, string[]>;

export const BlockModel = getModelForClass(IBlock)<IBlock>;
