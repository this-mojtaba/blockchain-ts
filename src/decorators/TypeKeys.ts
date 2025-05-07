import type { IResponse } from '@ServerTypes';
import type { JSONSchemaType } from 'ajv';

export enum IMetadataKeys {
  ALL_ENDPOINT = 'ALL_ENDPOINT',
  path = 'path',
  method = 'method',
  customMiddleware = 'customMiddleware',
  validate = 'validate',
  authorize = 'authorize',
  authenticate = 'authenticate'
}

export enum IMethodType {
  get = 'GET',
  post = 'POST',
  put = 'PUT',
  del = 'DELETE'
}

export type ITypedHandlerDescriptor = (req: Request) => IResponse<any>;

export interface IEndPoint {
  handler: ITypedHandlerDescriptor;
  route: string;
  method: string;
  validate: JSONSchemaType<any>;
  customMiddleware: ITypedHandlerDescriptor[];
  authenticate: boolean;
}
