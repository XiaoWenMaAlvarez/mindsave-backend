import winston from 'winston';
const { combine, json } = winston.format;

const timezoned = winston.format((info) => {
  info.timestamp = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });
  return info;
});

const createLogger = (level: string) => {
  return winston.createLogger({
    level,
    format: combine(
      timezoned(),
      json()
    ),
    transports: [
      new winston.transports.File({ filename: `logs/${level}.log`, level }),
    ],
  });
};

const loggerInfoOptions = createLogger('info');
const loggerWarnOptions = createLogger('warn');
const loggerErrorOptions = createLogger('error');

// Si no estamos en producción, mostrar también en consola 
if (process.env.NODE_ENV !== 'production') {
  loggerInfoOptions.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
  loggerWarnOptions.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
  loggerErrorOptions.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

const combinedLogger = winston.createLogger({
  format: combine(
    timezoned(),
    json()
  ),
  transports: [
    new winston.transports.File({ filename: `logs/combined.log`}),
  ],
});

export class Logger {

  static info(message: string) {
    loggerInfoOptions.info(message);
    combinedLogger.info(message);
  }

  static warn(message: string) {
    loggerWarnOptions.warn(message);
    combinedLogger.warn(message);
  }

  static error(message: string){
    loggerErrorOptions.error(message);
    combinedLogger.error(message);
  }
}

