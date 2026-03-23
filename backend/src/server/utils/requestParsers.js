/**
 * Reune parsers usados pelas rotas.
 * Evita repetir conversoes de boolean, inteiro, JSON e listas de ids.
 */
const parseBooleanFlag = (value) => value === 'true' || value === true || value === 1 || value === '1';

const parseInteger = (value, fallback = 0) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseJsonObject = (value, fallback = {}) => {
  if (value === undefined || value === null || value === '') {
    return { ...fallback };
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : { ...fallback };
    } catch (error) {
      return { ...fallback };
    }
  }

  return value && typeof value === 'object' && !Array.isArray(value) ? value : { ...fallback };
};

const parseIdArray = (value) => {
  if (value === undefined || value === null || value === '') {
    return [];
  }

  let parsedValue = value;

  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value);
    } catch (error) {
      parsedValue = [value];
    }
  }

  const list = Array.isArray(parsedValue) ? parsedValue : [parsedValue];

  return Array.from(
    new Set(
      list
        .filter((item) => item !== null && item !== undefined && item !== '' && !Number.isNaN(Number(item)))
        .map(Number)
    )
  );
};

const getUploadedImagePaths = (files = []) => files.map((file) => `/img/${file.filename}`);

module.exports = {
  parseBooleanFlag,
  parseInteger,
  parseJsonObject,
  parseIdArray,
  getUploadedImagePaths
};
