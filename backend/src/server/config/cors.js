/**
 * Configura o CORS do backend.
 * Permite chamadas do frontend local com envio de cookies/sessao.
 */
const cors = require('cors');

const isProduction = process.env.NODE_ENV === 'production';
const developmentPorts = new Set(['3000', '4173', '5173']);
const privateNetworkHostnamePattern = /^(10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})$/;

const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '');

const isAllowedDevelopmentOrigin = (origin) => {
  if (isProduction) {
    return false;
  }

  try {
    const parsedOrigin = new URL(origin);
    const normalizedHostname = parsedOrigin.hostname.toLowerCase();
    const normalizedPort = parsedOrigin.port || (parsedOrigin.protocol === 'https:' ? '443' : '80');
    const isLoopbackHost = normalizedHostname === 'localhost' || normalizedHostname === '127.0.0.1' || normalizedHostname === '[::1]';
    const isPrivateNetworkHost = privateNetworkHostnamePattern.test(normalizedHostname) || normalizedHostname.endsWith('.local');

    return developmentPorts.has(normalizedPort) && (isLoopbackHost || isPrivateNetworkHost);
  } catch (error) {
    return false;
  }
};

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'https://talmax.com.br',
  'https://www.talmax.com.br',
  'https://talmax-ti.com.br',
  'https://www.talmax-ti.com.br',
  'https://site-talmax.onrender.com'
].map(normalizeOrigin);

const envAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const allowedOrigins = new Set([
  ...defaultAllowedOrigins,
  ...envAllowedOrigins
]);

const allowedHeaders = [
  'Content-Type',
  'Authorization'
];

const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);

    if (allowedOrigins.has(normalizedOrigin) || isAllowedDevelopmentOrigin(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  allowedHeaders,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
});

module.exports = corsMiddleware;
