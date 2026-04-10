const { z } = require('zod');

class RequestValidationError extends Error {
  constructor(issues = []) {
    super(issues[0]?.message || 'Payload invalido.');
    this.name = 'RequestValidationError';
    this.issues = issues;
    this.statusCode = 400;
  }
}

const buildPathLabel = (path = []) => (
  path.reduce((label, segment) => {
    if (typeof segment === 'number') {
      return `${label}[${segment}]`;
    }

    return label ? `${label}.${segment}` : String(segment);
  }, '')
);

const formatZodIssues = (issues = [], prefix = []) => (
  issues.map((issue) => {
    const path = [...prefix, ...(Array.isArray(issue.path) ? issue.path : [])];
    const message = issue.code === 'unrecognized_keys'
      ? `Campos nao permitidos: ${(issue.keys || []).join(', ')}.`
      : issue.message;
    return {
      field: buildPathLabel(path),
      message
    };
  })
);

const throwValidationError = (issues) => {
  throw new RequestValidationError(issues);
};

const validateWithSchema = (schema, payload, prefix = []) => {
  const result = schema.safeParse(payload);

  if (!result.success) {
    throwValidationError(formatZodIssues(result.error.issues, prefix));
  }

  return result.data;
};

const parseJsonField = (value, schema, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return validateWithSchema(schema, undefined, [fieldName]);
  }

  let parsedValue = value;

  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value);
    } catch (error) {
      throwValidationError([{
        field: fieldName,
        message: `O campo ${fieldName} precisa conter um JSON valido.`
      }]);
    }
  }

  return validateWithSchema(schema, parsedValue, [fieldName]);
};

const sendValidationError = (res, error) => {
  if (!(error instanceof RequestValidationError)) {
    return false;
  }

  res.status(error.statusCode || 400).json({
    error: 'Payload invalido.',
    details: error.issues
  });

  return true;
};

const coerceTrimmedString = (value) => {
  if (typeof value === 'string') {
    return value.trim();
  }

  return value;
};

const stringField = (label, options = {}) => {
  const {
    minLength = 0,
    maxLength = 255,
    optional = false
  } = options;

  const schema = z.preprocess(
    coerceTrimmedString,
    z.string({
      required_error: `${label} e obrigatorio.`,
      invalid_type_error: `${label} precisa ser um texto.`
    })
      .min(minLength, `${label} e obrigatorio.`)
      .max(maxLength, `${label} deve ter no maximo ${maxLength} caracteres.`)
  );

  return optional ? schema.optional() : schema;
};

const booleanLike = (label, options = {}) => {
  const { optional = false } = options;

  const schema = z.preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      if (value === 1) return true;
      if (value === 0) return false;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();

      if (['true', '1', 'yes', 'sim', 'on'].includes(normalized)) {
        return true;
      }

      if (['false', '0', 'no', 'nao', 'off'].includes(normalized)) {
        return false;
      }
    }

    return value;
  }, z.boolean({
    invalid_type_error: `${label} precisa ser verdadeiro ou falso.`
  }));

  return optional ? schema.optional() : schema;
};

const integerLike = (label, options = {}) => {
  const {
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    optional = false
  } = options;

  const schema = z.preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : value;
    }

    return value;
  }, z.number({
    required_error: `${label} e obrigatorio.`,
    invalid_type_error: `${label} precisa ser um numero inteiro.`
  })
    .int(`${label} precisa ser um numero inteiro.`)
    .min(min, `${label} precisa ser maior ou igual a ${min}.`)
    .max(max, `${label} precisa ser menor ou igual a ${max}.`));

  return optional ? schema.optional() : schema;
};

module.exports = {
  RequestValidationError,
  booleanLike,
  formatZodIssues,
  integerLike,
  parseJsonField,
  sendValidationError,
  stringField,
  validateWithSchema
};
