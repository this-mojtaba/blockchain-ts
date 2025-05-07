import { getContentType, getHeaders, IStatus } from '@ServerTypes';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { LoggerInitialized } from '@decorators';
import type { Logger } from 'winston';

export class FileHandler {
  @LoggerInitialized()
  private logger!: Logger;

  private publicDir = path.join(__dirname, '../../../', '/public');
  private headers = getHeaders();

  async serveStaticFile(pathname: string): Promise<Response> {
    try {
      const filePath = path.join(this.publicDir, pathname.replace('/public', ''));
      const fileData = await readFile(filePath);

      if (!fileData) {
        return this.fileNotFoundResponse();
      }

      return new Response(new Uint8Array(fileData), {
        headers: { 'Content-Type': getContentType(filePath) }
      });
    } catch (err) {
      this.logger.error(`Error reading file: ${err}`);
      return this.fileNotFoundResponse();
    }
  }

  private fileNotFoundResponse() {
    const notFoundData = JSON.stringify({
      data: null,
      status: IStatus.serverError,
      statusCode: 404,
      message: 'File not found'
    });

    return new Response(notFoundData, {
      headers: this.headers,
      status: 404
    });
  }
}
