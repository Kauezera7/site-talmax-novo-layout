/**
 * Configura o CORS do backend.
 * Permite chamadas do frontend local com envio de cookies/sessao.
 */
const cors = require('cors');

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
]);

const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true
});

module.exports = corsMiddleware;
