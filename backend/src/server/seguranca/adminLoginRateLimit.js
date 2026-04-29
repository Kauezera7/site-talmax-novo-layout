/**
 * Limita tentativas de login no painel administrativo para reduzir
 * ataques de forca bruta e dicionario.
 *
 * O estado do bloqueio fica persistido no banco para sobreviver a restart
 * do processo e funcionar corretamente em ambientes com varias instancias.
 */
const crypto = require('crypto');
const db = require('../../config/database');

const DEFAULT_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_LOGIN_MAX_ATTEMPTS = 5;
const ADMIN_LOGIN_RATE_LIMIT_MESSAGE = 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.';
const ADMIN_USER_FREE_FLAG_VALUE = 1;
const ADMIN_USER_TEMP_BLOCKED_FLAG_VALUE = 2;
const ADMIN_LOGIN_RATE_LIMITS_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS admin_login_rate_limits (
    key_name VARCHAR(255) NOT NULL,
    failed_attempts INT NOT NULL DEFAULT 0,
    window_started_at BIGINT NOT NULL,
    blocked_until BIGINT DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (key_name),
    KEY idx_admin_login_rate_limits_updated_at (updated_at),
    KEY idx_admin_login_rate_limits_blocked_until (blocked_until)
  )
`;

let adminLoginRateLimitTableReady = false;
let usersTableHasBloqUserColumn = null;
let usersTableHasEmailColumn = null;

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

const buildRateLimitHash = (value) => crypto
  .createHash('sha256')
  .update(String(value || ''))
  .digest('hex');

const getAdminLoginRateLimitKeyForUsername = (username) => {
  const normalizedUsername = normalizeAdminUsername(username);

  if (!normalizedUsername) {
    return '';
  }

  return `admin-login:user:${buildRateLimitHash(normalizedUsername)}`;
};

const getAdminLoginRateLimitKeyForIp = (ip) => {
  const normalizedIp = String(ip || '').trim() || 'unknown';
  return `admin-login:ip:${buildRateLimitHash(normalizedIp)}`;
};

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

const ensureAdminLoginRateLimitTable = async () => {
  if (adminLoginRateLimitTableReady) {
    return;
  }

  await db.query(ADMIN_LOGIN_RATE_LIMITS_TABLE_QUERY);
  adminLoginRateLimitTableReady = true;
};

const usersTableSupportsBloqUser = async () => {
  if (typeof usersTableHasBloqUserColumn === 'boolean') {
    return usersTableHasBloqUserColumn;
  }

  const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'bloq_user'");
  usersTableHasBloqUserColumn = columns.length > 0;

  return usersTableHasBloqUserColumn;
};

const usersTableSupportsEmail = async () => {
  if (typeof usersTableHasEmailColumn === 'boolean') {
    return usersTableHasEmailColumn;
  }

  const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'email'");
  usersTableHasEmailColumn = columns.length > 0;

  return usersTableHasEmailColumn;
};

const getAdminUserBlockStateByUsername = async (username) => {
  const normalizedUsername = normalizeAdminUsername(username);

  if (!normalizedUsername || !await usersTableSupportsBloqUser()) {
    return null;
  }

  const supportsEmail = await usersTableSupportsEmail();
  const [users] = await db.query(
    supportsEmail
      ? 'SELECT id, username, bloq_user FROM users WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1'
      : 'SELECT id, username, bloq_user FROM users WHERE LOWER(username) = ? LIMIT 1',
    supportsEmail
      ? [normalizedUsername, normalizedUsername]
      : [normalizedUsername]
  );

  return users[0] || null;
};

const buildResetTimeFromTimestamp = (value) => {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return new Date(parsedValue);
};

const getRetryAfterSecondsFromResetTime = (resetTime) => {
  if (resetTime instanceof Date) {
    return Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000));
  }

  return Math.ceil(LOGIN_WINDOW_MS / 1000);
};

const normalizeRateLimitState = (row) => {
  if (!row) {
    return null;
  }

  const failedAttempts = Number.parseInt(row.failed_attempts, 10);
  const windowStartedAt = Number.parseInt(row.window_started_at, 10);
  const blockedUntil = Number.parseInt(row.blocked_until, 10);

  return {
    keyName: row.key_name,
    failedAttempts: Number.isFinite(failedAttempts) && failedAttempts > 0 ? failedAttempts : 0,
    windowStartedAt: Number.isFinite(windowStartedAt) && windowStartedAt > 0 ? windowStartedAt : 0,
    blockedUntil: Number.isFinite(blockedUntil) && blockedUntil > 0 ? blockedUntil : null,
    resetTime: buildResetTimeFromTimestamp(blockedUntil)
  };
};

const clearAdminLoginRateLimitByKey = async (keyName) => {
  if (!keyName) {
    return false;
  }

  await ensureAdminLoginRateLimitTable();
  await db.query('DELETE FROM admin_login_rate_limits WHERE key_name = ?', [keyName]);
  return true;
};

const getAdminLoginRateLimitStateByKey = async (keyName) => {
  if (!keyName) {
    return null;
  }

  await ensureAdminLoginRateLimitTable();

  const [rows] = await db.query(
    `
      SELECT key_name, failed_attempts, window_started_at, blocked_until
      FROM admin_login_rate_limits
      WHERE key_name = ?
      LIMIT 1
    `,
    [keyName]
  );

  const state = normalizeRateLimitState(rows[0]);

  if (!state) {
    return null;
  }

  const currentTime = Date.now();
  const windowExpired = state.windowStartedAt > 0 && (state.windowStartedAt + LOGIN_WINDOW_MS) <= currentTime;
  const blockExpired = state.blockedUntil !== null && state.blockedUntil <= currentTime;

  if (windowExpired || blockExpired) {
    await clearAdminLoginRateLimitByKey(keyName);
    return null;
  }

  return state;
};

const persistAdminLoginRateLimitState = async (connection, keyName, state) => {
  if (!state) {
    await connection.query('DELETE FROM admin_login_rate_limits WHERE key_name = ?', [keyName]);
    return;
  }

  await connection.query(
    `
      INSERT INTO admin_login_rate_limits (key_name, failed_attempts, window_started_at, blocked_until)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        failed_attempts = VALUES(failed_attempts),
        window_started_at = VALUES(window_started_at),
        blocked_until = VALUES(blocked_until)
    `,
    [
      keyName,
      state.failedAttempts,
      state.windowStartedAt,
      state.blockedUntil
    ]
  );
};

const recordFailedAttemptForKey = async (connection, keyName, currentTime) => {
  const [rows] = await connection.query(
    `
      SELECT key_name, failed_attempts, window_started_at, blocked_until
      FROM admin_login_rate_limits
      WHERE key_name = ?
      LIMIT 1
      FOR UPDATE
    `,
    [keyName]
  );

  const currentState = normalizeRateLimitState(rows[0]);

  if (currentState?.blockedUntil && currentState.blockedUntil > currentTime) {
    return currentState;
  }

  let nextState = null;

  if (!currentState || !currentState.windowStartedAt || (currentState.windowStartedAt + LOGIN_WINDOW_MS) <= currentTime) {
    nextState = {
      failedAttempts: 1,
      windowStartedAt: currentTime,
      blockedUntil: null
    };
  } else {
    const failedAttempts = currentState.failedAttempts + 1;
    const blockedUntil = failedAttempts >= LOGIN_MAX_ATTEMPTS
      ? currentTime + LOGIN_WINDOW_MS
      : null;

    nextState = {
      failedAttempts,
      windowStartedAt: currentState.windowStartedAt,
      blockedUntil
    };
  }

  await persistAdminLoginRateLimitState(connection, keyName, nextState);
  return {
    keyName,
    ...nextState,
    resetTime: buildResetTimeFromTimestamp(nextState.blockedUntil)
  };
};

const buildRateLimitKeysForIdentifiers = (identifiers = []) => {
  const uniqueKeys = [];

  identifiers.forEach((identifier) => {
    const keyName = getAdminLoginRateLimitKeyForUsername(identifier);

    if (keyName && !uniqueKeys.includes(keyName)) {
      uniqueKeys.push(keyName);
    }
  });

  return uniqueKeys;
};

const registerFailedAdminLoginAttemptByIdentifiers = async (identifiers = []) => {
  const keyNames = buildRateLimitKeysForIdentifiers(identifiers);

  if (keyNames.length === 0) {
    return {
      isBlocked: false,
      resetTime: null
    };
  }

  await ensureAdminLoginRateLimitTable();

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const currentTime = Date.now();
    let latestResetTime = null;

    for (const keyName of keyNames) {
      const state = await recordFailedAttemptForKey(connection, keyName, currentTime);
      const resetTime = state?.resetTime instanceof Date ? state.resetTime : null;

      if (resetTime && (!latestResetTime || resetTime.getTime() > latestResetTime.getTime())) {
        latestResetTime = resetTime;
      }
    }

    await connection.commit();

    return {
      isBlocked: latestResetTime instanceof Date && latestResetTime.getTime() > Date.now(),
      resetTime: latestResetTime
    };
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    connection.release();
  }
};

const adminLoginRateLimit = async (req, res, next) => {
  try {
    const keyName = getAdminLoginRateLimitKeyFromRequest(req);
    const state = await getAdminLoginRateLimitStateByKey(keyName);
    const resetTime = state?.resetTime instanceof Date ? state.resetTime : null;

    if (resetTime && resetTime.getTime() > Date.now()) {
      return res.status(429).json({
        error: ADMIN_LOGIN_RATE_LIMIT_MESSAGE,
        retry_after_seconds: getRetryAfterSecondsFromResetTime(resetTime)
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

const clearAdminLoginRateLimitByUsername = async (username) => {
  const keyName = getAdminLoginRateLimitKeyForUsername(username);

  if (!keyName) {
    return false;
  }

  return clearAdminLoginRateLimitByKey(keyName);
};

const getAdminLoginRateLimitStateByUsername = async (username) => {
  const keyName = getAdminLoginRateLimitKeyForUsername(username);

  if (!keyName) {
    return null;
  }

  return getAdminLoginRateLimitStateByKey(keyName);
};

module.exports = {
  ADMIN_LOGIN_RATE_LIMIT_MESSAGE,
  adminLoginRateLimit,
  clearAdminLoginRateLimitByUsername,
  getAdminLoginRateLimitStateByUsername,
  getAdminUserBlockStateByUsername,
  getRetryAfterSecondsFromResetTime,
  normalizeAdminUsername,
  registerFailedAdminLoginAttemptByIdentifiers,
  ADMIN_USER_FREE_FLAG_VALUE,
  ADMIN_USER_TEMP_BLOCKED_FLAG_VALUE
};
