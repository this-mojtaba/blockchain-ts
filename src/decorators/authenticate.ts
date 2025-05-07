import type { JSONSchemaType } from 'ajv';
import { IMetadataKeys } from './TypeKeys';

export function authenticate(target: Object, key: string, desc: TypedPropertyDescriptor<any>) {
  Reflect.defineMetadata(IMetadataKeys.authenticate, true, target, key);
}
