const crypto = require('crypto');
const multer = require('multer');
const { RequestValidationError } = require('../validation/requestValidation');
const logger = require('./logger');

const isProduction = process.env.NODE_ENV === 'production';
const GENERIC_PRODUCTION_ERROR_MESSAGE = 'Ocorreu um erro interno. Tente novamente mais tarde.';
const MAX_FILE_SIZE_MB = Number(process.env.UPLOAD_MAX_FILE_SIZE_MB || 15);

const normalizeStatusCode = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 400 && parsed < 600 ? parsed : 500;
};

class HttpError extends Error {
  constructor(message, options = {}) {
    super(message || 'Erro interno do servidor.');
    this.name = 'HttpError';
    this.statusCode = normalizeStatusCode(options.statusCode);
    this.publicMessage = options.publicMessage || message || 'Erro interno do servidor.';
    this.expose = typeof options.expose === 'boolean' ? options.expose : this.statusCode < 500;
    this.code = options.code || null;
    this.details = options.details;
    this.logLevel = options.logLevel || (this.statusCode >= 500 ? 'error' : 'warn');
    this.meta = options.meta || null;
    this.cause = options.cause;
  }
}

const createHttpError = (statusCode, publicMessage, options = {}) => (
  new HttpError(options.message || publicMessage, {
    ...options,
    statusCode,
    publicMessage
  })
);

const normalizeUploadError = (error) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return createHttpError(400, `O arquivo enviado excede o limite de ${MAX_FILE_SIZE_MB} MB.`, {
      message: error.message,
      code: error.code,
      expose: true,
      cause: error
    });
  }

  return createHttpError(400, error.message || 'Erro ao processar upload.', {
    message: error.message || 'Erro ao processar upload.',
    code: error.code,
    expose: true,
    cause: error
  });
};

const normalizeValidationError = (error) => (
  createHttpError(400, 'Payload invalido.', {
    message: error.message || 'Payload invalido.',
    code: error.name,
    details: error.issues,
    expose: true,
    cause: error
  })
);

const normalizeJsonBodyError = (error) => (
  createHttpError(400, 'JSON invalido no corpo da requisicao.', {
    message: error.message || 'JSON invalido no corpo da requisicao.',
    code: error.type || 'entity.parse.failed',
    expose: true,
    cause: error
  })
);

const normalizeError = (error) => {
  if (error instanceof HttpError) {
    return error;
  }

  if (error instanceof RequestValidationError) {
    return normalizeValidationError(error);
  }

  if (error instanceof multer.MulterError) {
    return normalizeUploadError(error);
  }

  if (error instanceof SyntaxError && error.type === 'entity.parse.failed') {
    return normalizeJsonBodyError(error);
  }

  if (error && typeof error === 'object') {
    return new HttpError(error.message || 'Erro interno do servidor.', {
      statusCode: error.statusCode || error.status,
      publicMessage: error.publicMessage || error.message || 'Erro interno do servidor.',
      expose: typeof error.expose === 'boolean' ? error.expose : normalizeStatusCode(error.statusCode || error.status) < 500,
      code: error.code,
      details: error.details,
      logLevel: error.logLevel,
      meta: error.meta,
      cause: error
    });
  }

  return createHttpError(500, 'Erro interno do servidor.', {
    message: 'Erro interno do servidor.'
  });
};

const wrapError = (error, options = {}) => {
  const baseError = normalizeError(error);
  const preserveClientError = baseError.statusCode < 500 && baseError.expose;

  if (!options || Object.keys(options).length === 0) {
    return baseError;
  }

  return new HttpError(baseError.message, {
    statusCode: preserveClientError ? baseError.statusCode : (options.statusCode || baseError.statusCode),
    publicMessage: preserveClientError ? baseError.publicMessage : (options.publicMessage || baseError.publicMessage),
    expose: typeof options.expose === 'boolean' ? options.expose : baseError.expose,
    code: options.code || baseError.code,
    details: preserveClientError
      ? baseError.details
      : (options.details !== undefined ? options.details : baseError.details),
    logLevel: options.logLevel || baseError.logLevel,
    meta: {
      ...(baseError.meta || {}),
      ...(options.meta || {})
    },
    cause: baseError.cause || error
  });
};

const summarizeFile = (file) => {
  if (!file || typeof file !== 'object') {
    return null;
  }

  return {
    fieldname: file.fieldname,
    originalname: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size
  };
};

const summarizeFiles = (files) => {
  if (!files) {
    return undefined;
  }

  if (Array.isArray(files)) {
    return files.map(summarizeFile).filter(Boolean);
  }

  return Object.entries(files).reduce((accumulator, [fieldName, value]) => {
    const items = Array.isArray(value) ? value.map(summarizeFile).filter(Boolean) : [];

    if (items.length > 0) {
      accumulator[fieldName] = items;
    }

    return accumulator;
  }, {});
};

const extractRequestContext = (req) => {
  const context = {
    id: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  };

  if (req.params && Object.keys(req.params).length > 0) {
    context.params = req.params;
  }

  if (req.query && Object.keys(req.query).length > 0) {
    context.query = req.query;
  }

  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    context.body = req.body;
  }

  if (req.file) {
    context.file = summarizeFile(req.file);
  }

  const files = summarizeFiles(req.files);
  if (files && ((Array.isArray(files) && files.length > 0) || (!Array.isArray(files) && Object.keys(files).length > 0))) {
    context.files = files;
  }

  return context;
};

const attachRequestId = (req, res, next) => {
  const incomingRequestId = typeof req.headers['x-request-id'] === 'string'
    ? req.headers['x-request-id'].trim()
    : '';

  req.requestId = incomingRequestId || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
};

const apiNotFoundHandler = (req, res, next) => {
  next(createHttpError(404, 'Rota da API nao encontrada.', {
    code: 'API_ROUTE_NOT_FOUND',
    expose: true,
    logLevel: 'warn'
  }));
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const normalizedError = normalizeError(error);
  const originalError = normalizedError.cause || error;
  const responseMessage = normalizedError.statusCode >= 500 && isProduction && !normalizedError.expose
    ? GENERIC_PRODUCTION_ERROR_MESSAGE
    : normalizedError.publicMessage || normalizedError.message || GENERIC_PRODUCTION_ERROR_MESSAGE;

  logger[normalizedError.logLevel || (normalizedError.statusCode >= 500 ? 'error' : 'warn')]({
    err: originalError,
    statusCode: normalizedError.statusCode,
    code: normalizedError.code,
    details: normalizedError.details,
    meta: normalizedError.meta,
    request: extractRequestContext(req)
  }, normalizedError.message || normalizedError.publicMessage || 'Erro ao processar requisicao');

  const payload = {
    error: responseMessage,
    request_id: req.requestId
  };

  if (normalizedError.details && (normalizedError.expose || normalizedError.statusCode < 500)) {
    payload.details = normalizedError.details;
  }

  return res.status(normalizedError.statusCode).json(payload);
};

module.exports = {
  HttpError,
  attachRequestId,
  apiNotFoundHandler,
  createHttpError,
  errorHandler,
  wrapError
};
