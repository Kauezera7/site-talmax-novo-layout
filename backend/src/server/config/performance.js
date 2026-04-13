const compression = require('compression');

const ONE_SECOND_IN_MS = 1000;
const ONE_HOUR_IN_SECONDS = 60 * 60;
const ONE_DAY_IN_SECONDS = 24 * ONE_HOUR_IN_SECONDS;
const ONE_YEAR_IN_SECONDS = 365 * ONE_DAY_IN_SECONDS;

const normalizePositiveInteger = (value, fallbackValue) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallbackValue;
};

const PRIMARY_IMAGE_CACHE_SECONDS = normalizePositiveInteger(
  process.env.PRIMARY_IMAGE_CACHE_SECONDS,
  ONE_YEAR_IN_SECONDS
);
const STATIC_IMAGE_CACHE_SECONDS = normalizePositiveInteger(
  process.env.STATIC_IMAGE_CACHE_SECONDS,
  ONE_DAY_IN_SECONDS
);
const PLACEHOLDER_IMAGE_CACHE_SECONDS = normalizePositiveInteger(
  process.env.PLACEHOLDER_IMAGE_CACHE_SECONDS,
  ONE_HOUR_IN_SECONDS
);
const COMPRESSION_THRESHOLD_BYTES = normalizePositiveInteger(
  process.env.COMPRESSION_THRESHOLD_BYTES,
  1024
);

const createCompressionMiddleware = () => compression({
  threshold: COMPRESSION_THRESHOLD_BYTES,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }

    const contentType = String(res.getHeader('Content-Type') || '').toLowerCase();

    // JPG, PNG, WEBP e GIF ja chegam comprimidos.
    if (contentType.startsWith('image/') && contentType !== 'image/svg+xml') {
      return false;
    }

    return compression.filter(req, res);
  }
});

const buildImageStaticOptions = ({ isPrimaryDirectory = false } = {}) => {
  const maxAgeSeconds = isPrimaryDirectory ? PRIMARY_IMAGE_CACHE_SECONDS : STATIC_IMAGE_CACHE_SECONDS;

  return {
    maxAge: maxAgeSeconds * ONE_SECOND_IN_MS,
    immutable: isPrimaryDirectory,
    setHeaders: (res) => {
      const cacheDirectives = ['public', `max-age=${maxAgeSeconds}`];

      if (isPrimaryDirectory) {
        cacheDirectives.push('immutable');
      }

      res.setHeader('Cache-Control', cacheDirectives.join(', '));
    }
  };
};

const applyPlaceholderImageCache = (res) => {
  res.setHeader('Cache-Control', `public, max-age=${PLACEHOLDER_IMAGE_CACHE_SECONDS}`);
};

module.exports = {
  applyPlaceholderImageCache,
  buildImageStaticOptions,
  createCompressionMiddleware
};
