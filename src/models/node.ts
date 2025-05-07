import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { schemaToProps } from '../utils/model/schemaHelpers';
import mongoose from 'mongoose';

@modelOptions({
  schemaOptions: {
    timestamps: true
  },
  options: {
    customName: 'nodes'
  }
})
export class INode {
  public _id?: mongoose.Types.ObjectId; // Explicitly declare _id

  @prop()
  public address?: string; // domain of node (starts with http(s)://)

  @prop()
  public lastSeen?: Date;

  @prop()
  public publicKey?: string;

  @prop()
  public privateKey?: string;

  @prop({ required: true, unique: true })
  public idOnNetwork!: string;

  // if mySelf is false, it means that the node is node friend that connected to me
  @prop({ type: Boolean, default: false })
  public isMySelf: boolean = false;

  @prop({ type: Boolean, default: false })
  public isMining: boolean = false;

  @prop({ type: Boolean, default: false })
  public isConnected: boolean = true;

  toProps?(props: typeof INodeProps) {
    return schemaToProps<INode, any>(this, props);
  }
}

type NodeFieldNames = {
  [K in keyof INode]: string;
};

export const NodeFields: NodeFieldNames = new Proxy<NodeFieldNames>({} as NodeFieldNames, {
  get: (_, property) => property.toString()
});

export const INodeProps = {
  self: [
    NodeFields._id,
    NodeFields.idOnNetwork,
    NodeFields.isConnected,
    NodeFields.isMySelf,
    NodeFields.publicKey,
    NodeFields.privateKey,
    NodeFields.isMining,
    NodeFields.address
  ],
  onNetWork: [NodeFields._id, NodeFields.idOnNetwork, NodeFields.isConnected, NodeFields.publicKey, NodeFields.address]
} as Record<string, string[]>;

export const NodeModel = getModelForClass(INode)<INode>;
