import 'reflect-metadata';
import '@controllers';
import { LoggerInitialized } from '@decorators';
import { ENV, getHeaders, IValidMode } from '@ServerTypes';
import dotenv from 'dotenv';
import type { IRequest, IRequestIP } from '@ServerTypes';
import Ajv from 'ajv';

import path from 'node:path';
import { MongoServiceConfig } from '@serverConfigs';
import type { Logger } from 'winston';
import { FileHandler } from './fileHandler';
import { RequestHandler } from './requestHandler';
import { bootstrapNode } from '../../blockChainActions/bootstrapNode';
import { broadcastDisconnectionNotice } from '../../blockChainActions/disconnect';

dotenv.config();

class Server {
  @LoggerInitialized()
  private logger!: Logger;

  private headers = getHeaders();
  private ajv = new Ajv();
  private fileHandler = new FileHandler();
  private requestHandler = new RequestHandler(this.ajv, this.headers);
  public server: any;

  constructor() {
    this.start();

    process.on('SIGTERM', this.shutdown);
    process.on('SIGINT', this.shutdown);
  }

  async start() {
    this.server = Bun.serve({
      fetch: this.handleRequest.bind(this),
      development: ENV.mode === IValidMode.development,
      hostname: '0.0.0.0',
      port: ENV.port,
      reusePort: true
    });

    this.logger.info(`Server Running On Port ${ENV.port} \ Mode: ${ENV.mode}`);

    try {
      this.logger.info(`Database Connecting...`);
      await MongoServiceConfig.start();
      this.logger.info(`Database Connected`);
      /*
        initially, we need to create a node for ourself and connect to other nodes
        if we are not connected to any node, we will connect to default nodes
        and if we are connected to other nodes, we will send heartbeat to them
        */
      await bootstrapNode();
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(`Error reading file: ${err.message}`);
      } else {
        this.logger.error(`Unknown error occurred: ${JSON.stringify(err)}`);
      }
      await this.shutdown();
    }
  }

  // Handle shutdown signals
  async shutdown() {
    this.logger.info('Shutting down server...');
    await broadcastDisconnectionNotice();
    const highestId = setInterval(() => {}, 1000) as unknown as number;
    for (let i = 0; i <= highestId; i++) {
      clearInterval(i);
    }
    process.exit(0);
  }

  private async handleRequest(req: Request) {
    const url = new URL(req.url) as URL;
    const startDate = Date.now();

    // Handle static file requests
    if (url.pathname.startsWith('/public')) {
      return await this.fileHandler.serveStaticFile(path.resolve(__dirname, '../../', url.pathname));
    }

    // Handle API requests (both static and dynamic routes)
    const ip = this.server.requestIP(req) as IRequestIP;
    return await this.requestHandler.handleAPIRequest(req as IRequest, url, startDate, ip);
  }
}

// Initialize server
new Server();
