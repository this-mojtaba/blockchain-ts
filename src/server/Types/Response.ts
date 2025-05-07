export enum IStatus {
  success = 'success',
  fail = 'fail',
  notFound = 'notFound',
  serverError = 'serverError'
}

// TODO move it to best location and handle multi language
export enum IMessage {
  itemCreated = 'item successfuly created!',
  itemNotFound = 'sorry! item not found',
  defaultErrorMessage = 'Default Error Message',
  internalServerError = 'Internal Error',
  userNotFound = 'User not found',
  incorrectPassword = 'incorrect password',
  tokenNotFound = 'first, you must start a session',
  sessionNotFound = 'session not found',
  accessDenied = 'access denied!'
}

export interface IResponseData<T> {
  data: T;
  documentCount?: number;
  timeToResponse?: string;
  status: IStatus;
  statusCode?: number;
  message?: IMessage | string;
}

export type IResponse<T> = IResponseData<T> | Error;
