import type { JSONSchemaType } from 'ajv';
import { IMetadataKeys, type ITypedHandlerDescriptor } from './TypeKeys';
import type { IUserRole } from '@models';

export function authorize<T>(role: IUserRole[]) {
  return function (target: Object, key: string, desc: TypedPropertyDescriptor<any>) {
    Reflect.defineMetadata(IMetadataKeys.authorize, role, target, key);
  };
}
