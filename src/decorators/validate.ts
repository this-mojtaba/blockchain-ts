import type { JSONSchemaType } from 'ajv';
import { IMetadataKeys, type ITypedHandlerDescriptor } from './TypeKeys';

export function validate<T>(conditions: JSONSchemaType<T>) {
  return function (target: Object, key: string, desc: TypedPropertyDescriptor<any>) {
    Reflect.defineMetadata(IMetadataKeys.validate, conditions, target, key);
  };
}
