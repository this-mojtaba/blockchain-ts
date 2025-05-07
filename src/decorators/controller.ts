import type { IUserRole } from '@models';
import { IMetadataKeys, IMethodType, type IEndPoint, type ITypedHandlerDescriptor } from './TypeKeys';
import { convertToPathPrefixSafty } from './helpers';

const allEndpoint: IEndPoint[] = [];

export function controller(pathPrefix: string) {
  return function (target: Function): void {
    let controllerFunctionNames = Object.getOwnPropertyNames(target.prototype);
    controllerFunctionNames = controllerFunctionNames.filter((cfm) => cfm !== 'constructor');

    for (let controllerFunctionName of controllerFunctionNames) {
      const handler = target.prototype[controllerFunctionName];
      const route = Reflect.getMetadata(IMetadataKeys.path, target.prototype, controllerFunctionName);
      const method = Reflect.getMetadata(IMetadataKeys.method, target.prototype, controllerFunctionName) as IMethodType;
      const authorize = Reflect.getMetadata(
        IMetadataKeys.authorize,
        target.prototype,
        controllerFunctionName
      ) as IUserRole[];
      const authenticate = Reflect.getMetadata(
        IMetadataKeys.authenticate,
        target.prototype,
        controllerFunctionName
      ) as boolean;
      const validate = Reflect.getMetadata(IMetadataKeys.validate, target.prototype, controllerFunctionName);
      const customMiddleware: ITypedHandlerDescriptor[] = Reflect.getMetadata(
        IMetadataKeys.customMiddleware,
        target.prototype,
        controllerFunctionName
      );

      const safePathPrefix = convertToPathPrefixSafty(pathPrefix, route);

      allEndpoint.push({
        handler,
        route: safePathPrefix,
        method,
        customMiddleware: customMiddleware || [],
        validate,
        authorize,
        authenticate: authenticate ? true : false
      });
    }
  };
}

export function getAllEndPoints() {
  return allEndpoint;
}
