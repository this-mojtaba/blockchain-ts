import { ENV } from '@ServerTypes';
import { createLogger, format, transports, Logger } from 'winston';
import { threadId } from 'worker_threads';

/* Winston Logger */
export class LoggerUtil {
  private static instance: Logger;

  // Method to get the logger instance
  public static getLogger(): Logger {
    if (!LoggerUtil.instance) {
      LoggerUtil.instance = createLogger({
        level: 'info',
        format: format.combine(
          format.colorize(),
          format.timestamp(),
          format.printf(({ timestamp, level, message }) => {
            const montanaColor = '\x1b[30;49m'; // ANSI code to black color and default background
            const resetColor = '\x1b[0m'; // ANSI code to reset color
            return `${montanaColor}Thread ID: ${threadId}${resetColor} | ${timestamp} [${level}]: ${message}`;
          })
        ),
        transports: [new transports.Console(), new transports.File({ filename: ENV.appLogFile })]
      });
    }
    return LoggerUtil.instance;
  }
}
