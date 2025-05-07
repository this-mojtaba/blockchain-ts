import { IMethodType } from '@decorators';

export type IHeadersTypes = {
  'Content-Type': string;
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Methods': string;
  'Access-Control-Allow-Headers': string;
};

enum IValidAllowOrigin {
  allSites = '*'
}

enum IValidContentTypes {
  json = 'application/json'
}

// TODO: add another headers (from postman or other application)
enum IValidHeaderTypes {
  ContentType = 'Content-Type',
  Authorization = 'Authorization',
  loginToken = 'lt',
  language = 'lang'
}

enum IFileExtention {
  html = '.html',
  css = '.css',
  js = '.js',
  png = '.png',
  jpg = '.jpg',
  jpeg = '.jpeg',
  svg = '.svg'
}

export interface IRequestIP {
  address: string;
  family: string; // IPv4 | IPv6
  port: number;
}

const validHeaderValues: IValidHeaderTypes[] = [
  IValidHeaderTypes.ContentType,
  IValidHeaderTypes.Authorization,
  IValidHeaderTypes.loginToken,
  IValidHeaderTypes.language
];

const validMethodValues: IMethodType[] = [IMethodType.get, IMethodType.post, IMethodType.put, IMethodType.del];

export function getHeaders(): IHeadersTypes {
  return {
    'Content-Type': IValidContentTypes.json,
    'Access-Control-Allow-Headers': validHeaderValues.join(', '),
    'Access-Control-Allow-Methods': validMethodValues.join(', '),
    'Access-Control-Allow-Origin': IValidAllowOrigin.allSites
  };
}

// Helper function to set Content-Type based on file extension
export function getContentType(filePath: string) {
  if (filePath.endsWith(IFileExtention.html)) return 'text/html';
  if (filePath.endsWith(IFileExtention.css)) return 'text/css';
  if (filePath.endsWith(IFileExtention.js)) return 'application/javascript';
  if (filePath.endsWith(IFileExtention.png)) return 'image/png';
  if (filePath.endsWith(IFileExtention.jpg) || filePath.endsWith(IFileExtention.jpeg)) return 'image/jpeg';
  if (filePath.endsWith(IFileExtention.svg)) return 'image/svg+xml';
  return 'text/plain';
}
