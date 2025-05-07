import { getAllEndPoints, type IEndPoint } from '@decorators';
import {
  IMessage,
  IStatus,
  type IHeadersTypes,
  type IRequest,
  type IRequestInput,
  type IRequestIP,
  type IResponseData
} from '@ServerTypes';
import { CustomError, matchDynamicRoute } from '@utils';
import type { JSONSchemaType } from 'ajv';
import type Ajv from 'ajv';
import { ErrorHandler } from './errorHandler';

export class RequestHandler {
  constructor(
    private ajv: Ajv,
    private headers: IHeadersTypes
  ) {}

  async handleAPIRequest(req: IRequest, url: URL, startDate: number, ip: IRequestIP): Promise<Response> {
    const endpoints = getAllEndPoints();

    // Static route handling
    const staticEnd = endpoints.find((end) => url.pathname === end.route && req.method === end.method);
    if (staticEnd) {
      return await this.processEndpoint(staticEnd, req, url, startDate, ip);
    }

    // Dynamic route handling
    for (let end of endpoints) {
      const params = matchDynamicRoute(url.pathname, end.route);
      if (params && req.method === end.method) {
        return await this.processEndpoint(end, req, url, startDate, ip, params);
      }
    }

    return this.notFoundResponse();
  }

  private async processEndpoint(
    end: IEndPoint,
    req: IRequest,
    url: URL,
    startDate: number,
    ip: IRequestIP,
    params?: { [key: string]: string }
  ): Promise<Response> {
    try {
      // first of all we authenticate then authorize the request
      const token = req.headers.get('token');
      req.hasSession = false;
      req.hasUser = false;

      let inputData: IRequestInput = {};
      if (end.method === 'POST') {
        inputData = (await req.json()) as IRequestInput;
      } else if (end.method === 'GET') {
        url.searchParams.forEach((value, key) => {
          inputData[key] = value;
        });
        inputData = { ...inputData, ...params };
      }

      req.bodyData = inputData;

      req.ip = ip.address;

      // Schema validation
      const validateSchema: JSONSchemaType<any> = end.validate || {};
      const validate = this.ajv.compile(validateSchema);
      const isValid = validate(inputData);
      if (!isValid) {
        const errors = validate.errors!.map((e) => e.message).join(', ');
        throw CustomError(errors);
      }

      // Middleware execution
      for (let middleware of end.customMiddleware || []) {
        await middleware(req);
      }

      const response = (await end.handler(req)) as IResponseData<any>;
      return new Response(JSON.stringify(response), {
        status: response.statusCode ?? 200,
        headers: this.headers
      });
    } catch (error) {
      return ErrorHandler.handleError(error, startDate, this.headers);
    }
  }

  private notFoundResponse(): Response {
    const notFoundData = JSON.stringify({
      data: null,
      status: IStatus.serverError,
      statusCode: 404,
      message: 'Route not found'
    });

    return new Response(notFoundData, {
      headers: this.headers,
      status: 404
    });
  }
}
