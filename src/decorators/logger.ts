import { LoggerUtil } from '@utils';

export function LoggerInitialized(): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    Object.defineProperty(target, propertyKey, {
      get: function () {
        if (!this.__logger) {
          this.__logger = LoggerUtil.getLogger();
        }
        return this.__logger;
      },
      set: function () {
        throw new Error('Cannot set logger directly');
      },
      configurable: true
    });
  };
}
