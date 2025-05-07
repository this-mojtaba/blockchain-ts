import { IStatus, type IHeadersTypes } from '@ServerTypes';

export class ErrorHandler {
  static handleError(error: any, startDate: number, headers: IHeadersTypes): Response {
    error = JSON.parse(error.message);
    const errorMessage = error.errorMessage ?? 'Server error';
    const statusCode = error.statusCode ?? 500;
    const status = error.status ?? IStatus.serverError;

    return new Response(
      JSON.stringify({
        data: null,
        status: status,
        statusCode: statusCode,
        message: errorMessage,
        timeToResponse: `~ ${Date.now() - startDate}ms`
      }),
      {
        headers: headers,
        status: statusCode
      }
    );
  }
}
