import { IMessage, IStatus } from '@ServerTypes';

interface IError {
  statusCode: number;
  status: IStatus;
  errorMessage: IMessage | string;
}

export function CustomError(errorMessage: IMessage | string, statusCode = 400, status = IStatus.fail) {
  const error: IError = {
    statusCode,
    status: status,
    errorMessage
  };
  return new Error(JSON.stringify(error));
}

export function decodeCustomError(error: string): IError {
  try {
    const parsedError = JSON.parse(error) as IError;
    if (!parsedError.errorMessage) {
      parsedError.errorMessage = IMessage.defaultErrorMessage;
    }

    return parsedError;
  } catch (error) {
    return {
      status: IStatus.fail,
      statusCode: 400,
      errorMessage: IMessage.defaultErrorMessage
    };
  }
}
