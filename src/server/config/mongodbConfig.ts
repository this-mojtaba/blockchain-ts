import mongoose from 'mongoose';
import { ENV, IMessage, IStatus, type IConfig } from '@ServerTypes';
import { CustomError } from '@utils';

class MongoService implements IConfig {
  async start() {
    const { mongodbUri, mongodbUsername, mongodbPassword } = ENV;
    if (!mongodbUri) {
      throw CustomError(IMessage.internalServerError, 500, IStatus.serverError);
    }
    let option: mongoose.ConnectOptions = {};
    if (mongodbUsername) {
      option = {
        user: mongodbUsername,
        pass: mongodbPassword
      };
    }
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongodbUri, option);
  }

  async stop() {
    await mongoose.disconnect();
  }
}

export const MongoServiceConfig = new MongoService();
