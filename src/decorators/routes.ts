import { IMetadataKeys, IMethodType, type ITypedHandlerDescriptor } from './TypeKeys';

function routeBinder(method: IMethodType) {
  return function (path: string) {
    return function (target: Object, key: string, desc: TypedPropertyDescriptor<any>): void {
      Reflect.defineMetadata(IMetadataKeys.path, path, target, key);
      Reflect.defineMetadata(IMetadataKeys.method, method, target, key);
    };
  };
}

export const get = routeBinder(IMethodType.get);
export const post = routeBinder(IMethodType.post);
export const put = routeBinder(IMethodType.put);
export const del = routeBinder(IMethodType.del);
