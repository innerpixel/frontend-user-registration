import winston from 'winston';

export const createLogger = (module) => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { module },
    transports: [
      new winston.transports.File({
        filename: 'logs/error/error.log',
        level: 'error'
      }),
      new winston.transports.File({
        filename: 'logs/app/app.log'
      }),
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ]
  });
};
