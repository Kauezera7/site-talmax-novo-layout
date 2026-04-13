const pino = require('pino');

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'request.headers.authorization',
      'request.headers.cookie',
      'request.body.password',
      'request.body.senha',
      'request.body.currentPassword',
      'request.body.newPassword',
      'request.body.confirmPassword'
    ],
    censor: '[REDACTED]'
  }
});

module.exports = logger;
