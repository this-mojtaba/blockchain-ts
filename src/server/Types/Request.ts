import type { INode } from '@models';
import type { DocumentType } from '@typegoose/typegoose';

export interface IRequest extends Request {
  bodyData?: Object | undefined;
  node: DocumentType<INode> | null;
  hasSession: boolean;
  hasUser: boolean;
  ip: string;
}

export type IRequestInput = { [key: string]: any };
