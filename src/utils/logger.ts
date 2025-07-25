import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    }),
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/app.log', level: 'info' }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    // 可扩展文件日志等
  ],
});

export default logger;
