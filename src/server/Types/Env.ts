import path from 'node:path';
import fs from 'node:fs';

export enum IValidMode {
  development = 'development',
  test = 'test',
  production = 'production'
}

async function checkFileExists(fileAddress: string = ''): Promise<boolean> {
  const file = Bun.file(fileAddress);

  return file.exists();
}

const modeEnv = process.env.MODE as IValidMode | undefined;

const defaultPort = 1400;
const httpPortEnv = process.env.HTTP_PORT as number | undefined;
let appLogFile = process.env.APP_LOG_FILE as string;

const mongodbUri = process.env.MONGODB_URI as string;
const mongodbUsername = process.env.MONGODB_USERNAME as string;
const mongodbPassword = process.env.MONGODB_PASSWORD as string;
let defaultNodes = process.env.DEFAULT_NODES_TO_CONNECT?.split(',') ?? [];
defaultNodes = defaultNodes.map((node) => node.trim());
const isAppLogFileExist = await checkFileExists(appLogFile);
if (!isAppLogFileExist) {
  // create file log path string
  const logDirectoryName = 'logs';
  const logDirectoryPath = path.join(__dirname, '../../../', `${logDirectoryName}`);

  const logFileName = 'log.txt';
  const logFilePath = logDirectoryPath + '/' + logFileName;

  const logFileExists = await checkFileExists(logFilePath);

  if (!logFileExists) {
    if (fs.existsSync(logDirectoryPath)) {
      fs.writeFileSync(logFilePath, 'Log file create automaticly\n');
    } else {
      fs.mkdirSync(logDirectoryPath);
      fs.writeFileSync(logFilePath, 'Log file create automaticly\n');
    }
  }
  appLogFile = logFilePath;
}
export const ENV = {
  mode: modeEnv ? modeEnv : IValidMode.development,
  port: httpPortEnv ? httpPortEnv : defaultPort,
  appLogFile: appLogFile,
  mongodbUri,
  mongodbUsername,
  mongodbPassword,
  defaultNodes,
  nodeAddress: process.env.NODE_ADDRESS as string
};
