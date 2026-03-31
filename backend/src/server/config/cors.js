/**
 * Configura o CORS do backend.
 * Permite chamadas do frontend local com envio de cookies/sessao.
 */
const cors = require('cors');

const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '');

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

const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);

    if (allowedOrigins.has(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true
});

module.exports = corsMiddleware;
