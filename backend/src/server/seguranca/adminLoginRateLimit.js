/**
 * Limita tentativas de login no painel administrativo para reduzir
 * ataques de forca bruta e dicionario.
 */
const rateLimit = require('express-rate-limit');
const db = require('../../config/database');

const { ipKeyGenerator } = rateLimit;

const DEFAULT_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_LOGIN_MAX_ATTEMPTS = 5;
const DEFAULT_BLOCK_MESSAGE = 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.';
const ADMIN_USER_FREE_FLAG_VALUE = 1;
const ADMIN_USER_TEMP_BLOCKED_FLAG_VALUE = 2;

let usersTableHasBloqUserColumn = null;

const parsePositiveInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isFinite(parsedValue) && parsedValue > 0) {
    return parsedValue;
  }

  return fallback;
};

const normalizeAdminUsername = (value) => (
  typeof value === 'string'
    ? value.trim().toLowerCase()
    : ''
);

const getAdminLoginRateLimitKeyForUsername = (username) => {
  const normalizedUsername = normalizeAdminUsername(username);
  return `admin-login:user:${normalizedUsername}`;
};

const getAdminLoginRateLimitKeyForIp = (ip) => `admin-login:ip:${ipKeyGenerator(ip)}`;

const getAdminLoginRateLimitKeyFromRequest = (req) => {
  const normalizedUsername = normalizeAdminUsername(req.body?.username);

  if (normalizedUsername) {
    return getAdminLoginRateLimitKeyForUsername(normalizedUsername);
  }

  return getAdminLoginRateLimitKeyForIp(req.ip);
};

const LOGIN_WINDOW_MS = parsePositiveInteger(
  process.env.ADMIN_LOGIN_RATE_LIMIT_WINDOW_MS,
  DEFAULT_LOGIN_WINDOW_MS
);
const LOGIN_MAX_ATTEMPTS = parsePositiveInteger(
  process.env.ADMIN_LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
  DEFAULT_LOGIN_MAX_ATTEMPTS
);
const LOGIN_RATE_LIMIT_REQUEST_CAP = Math.max(LOGIN_MAX_ATTEMPTS - 1, 1);

const usersTableSupportsBloqUser = async () => {
  if (typeof usersTableHasBloqUserColumn === 'boolean') {
    return usersTableHasBloqUserColumn;
  }

  const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'bloq_user'");
  usersTableHasBloqUserColumn = columns.length > 0;

  return usersTableHasBloqUserColumn;
};

const getAdminUserBlockStateByUsername = async (username) => {
  const normalizedUsername = normalizeAdminUsername(username);

  if (!normalizedUsername || !await usersTableSupportsBloqUser()) {
    return null;
  }

  const [users] = await db.query(
    'SELECT id, username, bloq_user FROM users WHERE LOWER(username) = ? LIMIT 1',
    [normalizedUsername]
  );

  return users[0] || null;
};

const getRetryAfterSecondsFromResetTime = (resetTime) => {
  if (resetTime instanceof Date) {
    return Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000));
  }

  return Math.ceil(LOGIN_WINDOW_MS / 1000);
};

const getRetryAfterSeconds = (req) => getRetryAfterSecondsFromResetTime(req.rateLimit?.resetTime);

const setAdminUserBlockStateByUsername = async (username, value) => {
  const normalizedUsername = normalizeAdminUsername(username);

  if (!normalizedUsername || !await usersTableSupportsBloqUser()) {
    return false;
  }

  await db.query(
    'UPDATE users SET bloq_user = ? WHERE LOWER(username) = ? LIMIT 1',
    [value, normalizedUsername]
  );

  return true;
};

const baseAdminLoginRateLimit = rateLimit({
  windowMs: LOGIN_WINDOW_MS,
  // O express-rate-limit bloqueia quando a contagem ultrapassa o limite.
  // Subtraimos 1 para que "5 tentativas" signifique bloquear ja na 5a falha.
  limit: LOGIN_RATE_LIMIT_REQUEST_CAP,
  keyGenerator: (req) => getAdminLoginRateLimitKeyFromRequest(req),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, _res, next, options) => {
    req.adminLoginRateLimitExceeded = true;
    req.adminLoginRateLimitOptions = options;
    next();
  }
});

const adminLoginRateLimit = (req, res, next) => {
  baseAdminLoginRateLimit(req, res, async (error) => {
    if (error) {
      return next(error);
    }

    if (!req.adminLoginRateLimitExceeded) {
      return next();
    }

    try {
      await setAdminUserBlockStateByUsername(req.body?.username, ADMIN_USER_TEMP_BLOCKED_FLAG_VALUE);
    } catch (writeError) {
      // Se a escrita no banco falhar, mantemos o bloqueio padrao em memoria.
    }

    return res.status(req.adminLoginRateLimitOptions?.statusCode || 429).json({
      error: DEFAULT_BLOCK_MESSAGE,
      retry_after_seconds: getRetryAfterSeconds(req)
    });
  });
};

adminLoginRateLimit.resetKey = (...args) => baseAdminLoginRateLimit.resetKey(...args);
adminLoginRateLimit.getKey = (...args) => baseAdminLoginRateLimit.getKey(...args);

const clearAdminLoginRateLimitByUsername = async (username) => {
  const normalizedUsername = normalizeAdminUsername(username);

  if (!normalizedUsername) {
    return false;
  }

  await adminLoginRateLimit.resetKey(getAdminLoginRateLimitKeyForUsername(normalizedUsername));
  return true;
};

const getAdminLoginRateLimitStateByUsername = async (username) => {
  const normalizedUsername = normalizeAdminUsername(username);

  if (!normalizedUsername) {
    return null;
  }

  return adminLoginRateLimit.getKey(getAdminLoginRateLimitKeyForUsername(normalizedUsername));
};

module.exports = {
  adminLoginRateLimit,
  clearAdminLoginRateLimitByUsername,
  getAdminLoginRateLimitStateByUsername,
  getAdminUserBlockStateByUsername,
  getRetryAfterSecondsFromResetTime,
  normalizeAdminUsername,
  setAdminUserBlockStateByUsername,
  ADMIN_USER_FREE_FLAG_VALUE,
  ADMIN_USER_TEMP_BLOCKED_FLAG_VALUE
};
