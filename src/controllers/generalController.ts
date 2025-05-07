import { controller, get } from '@decorators';
import { IStatus, type IRequest } from '@ServerTypes';

@controller('/')
export class General {
  @get('/ping')
  ping(req: IRequest) {
    return {
      data: 'pong',
      status: IStatus.success
    };
  }
}
