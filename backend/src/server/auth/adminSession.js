/**
 * Centraliza a autenticacao do painel administrativo.
 * Aqui ficam login, logout, leitura do cookie de sessao e o middleware de protecao.
 */
const crypto = require('crypto');
const db = require('../../config/database');
const {
  clearAdminLoginRateLimitByUsername,
  getAdminLoginRateLimitStateByUsername,
  getRetryAfterSecondsFromResetTime,
  normalizeAdminUsername
} = require('../seguranca/adminLoginRateLimit');
const { createHttpError, wrapError } = require('../utils/errorHandling');

const ADMIN_SESSION_COOKIE = 'talmax-admin-session';
const ADMIN_USER_FREE_FLAG_VALUE = 1;
const ADMIN_USER_TEMP_BLOCKED_FLAG_VALUE = 2;
const ADMIN_AUTHORIZATION_SCHEME = 'bearer';

if (!process.env.ADMIN_JWT_SECRET) {
  throw new Error('A variavel ADMIN_JWT_SECRET nao foi definida no ambiente.');
}

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
const ADMIN_JWT_EXPIRES_IN_SECONDS = Number(process.env.ADMIN_JWT_EXPIRES_IN_SECONDS || 60 * 60 * 8);
const isProduction = process.env.NODE_ENV === 'production';
const ADMIN_COOKIE_SAME_SITE = String(process.env.ADMIN_COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax')).toLowerCase();

let usersTableHasBloqUserColumn = null;

const safeEqual = (valueA, valueB) => {
  const bufferA = Buffer.from(String(valueA));
  const bufferB = Buffer.from(String(valueB));

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
};

const verifyAdminPassword = (password, storedPassword) => {
  if (!storedPassword) {
    return false;
  }

  if (storedPassword.startsWith('scrypt$')) {
    const [, salt, hash] = storedPassword.split('$');
    if (!salt || !hash) {
      return false;
    }

    const candidateHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return safeEqual(candidateHash, hash);
  }

  return safeEqual(password, storedPassword);
};

const parseCookies = (req) => {
  const cookieHeader = req.headers.cookie || '';

  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf('=');

      if (separatorIndex === -1) {
        return cookies;
      }

      const name = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();

      cookies[name] = decodeURIComponent(value);
      return cookies;
    }, {});
};

const base64UrlEncode = (value) => Buffer.from(value).toString('base64url');

const base64UrlDecode = (value) => Buffer.from(value, 'base64url').toString('utf8');

const createJwtToken = (payload) => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: nowInSeconds,
    exp: nowInSeconds + ADMIN_JWT_EXPIRES_IN_SECONDS
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac('sha256', ADMIN_JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const verifyJwtToken = (token) => {
  if (!token) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', ADMIN_JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (!payload.exp || payload.exp <= nowInSeconds) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
};

const getAdminSessionToken = (req) => {
  const authorizationHeader = req.headers.authorization;

  if (typeof authorizationHeader === 'string' && authorizationHeader.trim()) {
    const [scheme, ...tokenParts] = authorizationHeader.trim().split(/\s+/);

    if (scheme && scheme.toLowerCase() === ADMIN_AUTHORIZATION_SCHEME) {
      const bearerToken = tokenParts.join(' ').trim();

      if (bearerToken) {
        return bearerToken;
      }
    }
  }

  const cookies = parseCookies(req);
  return cookies[ADMIN_SESSION_COOKIE] || null;
};

const getAdminCookieOptions = () => ({
  httpOnly: true,
  sameSite: ADMIN_COOKIE_SAME_SITE,
  secure: isProduction || ADMIN_COOKIE_SAME_SITE === 'none',
  path: '/',
  maxAge: ADMIN_JWT_EXPIRES_IN_SECONDS * 1000
});

const usersTableSupportsBloqUser = async () => {
  if (typeof usersTableHasBloqUserColumn === 'boolean') {
    return usersTableHasBloqUserColumn;
  }

  const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'bloq_user'");
  usersTableHasBloqUserColumn = columns.length > 0;

  return usersTableHasBloqUserColumn;
};

const getAdminUserByUsername = async (username) => {
  const normalizedUsername = normalizeAdminUsername(username);

  if (!normalizedUsername) {
    return null;
  }

  const selectQuery = (await usersTableSupportsBloqUser())
    ? 'SELECT id, username, password, full_name, bloq_user FROM users WHERE LOWER(username) = ? LIMIT 1'
    : 'SELECT id, username, password, full_name, 1 AS bloq_user FROM users WHERE LOWER(username) = ? LIMIT 1';

  const [users] = await db.query(selectQuery, [normalizedUsername]);
  return users[0] || null;
};

const setAdminBlockState = async (adminUserId, value) => {
  if (!await usersTableSupportsBloqUser()) {
    const error = new Error('A coluna bloq_user nao existe na tabela users. Execute a migration antes de usar o desbloqueio manual.');
    error.code = 'BLOQ_USER_COLUMN_MISSING';
    throw error;
  }

  await db.query(
    'UPDATE users SET bloq_user = ? WHERE id = ? LIMIT 1',
    [value, adminUserId]
  );
};

const ensureAdminUserIsNotTemporarilyBlocked = async (adminUser, res) => {
  if (!adminUser || Number(adminUser.bloq_user || ADMIN_USER_FREE_FLAG_VALUE) !== ADMIN_USER_TEMP_BLOCKED_FLAG_VALUE) {
    return true;
  }

  const rateLimitState = await getAdminLoginRateLimitStateByUsername(adminUser.username);
  const resetTime = rateLimitState?.resetTime instanceof Date ? rateLimitState.resetTime : null;

  if (!resetTime || resetTime.getTime() <= Date.now()) {
    await setAdminBlockState(adminUser.id, ADMIN_USER_FREE_FLAG_VALUE);
    adminUser.bloq_user = ADMIN_USER_FREE_FLAG_VALUE;
    return true;
  }

  res.status(429).json({
    error: 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.',
    retry_after_seconds: getRetryAfterSecondsFromResetTime(resetTime)
  });

  return false;
};

const requireAdminSession = (req, res, next) => {
  const token = getAdminSessionToken(req);
  const session = verifyJwtToken(token);

  if (!session) {
    res.clearCookie(ADMIN_SESSION_COOKIE, getAdminCookieOptions());
    return res.status(401).json({ error: 'Sessao invalida ou expirada.' });
  }

  req.adminSession = session;
  return next();
};

const loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Informe usuario e senha.' });
    }

    const adminUser = await getAdminUserByUsername(username);

    if (!adminUser) {
      return res.status(401).json({ error: 'Credenciais invalidas.' });
    }

    const canContinueLogin = await ensureAdminUserIsNotTemporarilyBlocked(adminUser, res);

    if (!canContinueLogin) {
      return undefined;
    }

    if (!verifyAdminPassword(password, adminUser.password)) {
      return res.status(401).json({ error: 'Credenciais invalidas.' });
    }

    await clearAdminLoginRateLimitByUsername(adminUser.username);
    await setAdminBlockState(adminUser.id, ADMIN_USER_FREE_FLAG_VALUE).catch(() => null);

    const sessionPayload = {
      id: adminUser.id,
      username: adminUser.username,
      full_name: adminUser.full_name,
      created_at: new Date().toISOString()
    };
    const token = createJwtToken(sessionPayload);

    res.cookie(ADMIN_SESSION_COOKIE, token, getAdminCookieOptions());

    return res.json({
      user: sessionPayload,
      session_token: token
    });
  } catch (err) {
    return next(wrapError(err, { publicMessage: 'Erro ao processar login do admin.' }));
  }
};

const unlockAdminLoginByUser = async (req, res, next) => {
  try {
    const { username } = req.body || {};

    if (!normalizeAdminUsername(username)) {
      return res.status(400).json({ error: 'Informe o usuario que deve ser liberado.' });
    }

    const adminUser = await getAdminUserByUsername(username);

    if (!adminUser) {
      return res.status(404).json({ error: 'Usuario admin nao encontrado.' });
    }

    await setAdminBlockState(adminUser.id, ADMIN_USER_FREE_FLAG_VALUE);
    await clearAdminLoginRateLimitByUsername(adminUser.username);

    return res.json({
      message: 'Usuario desbloqueado com sucesso. Oriente a pessoa a recarregar a pagina e tentar de novo.',
      user: {
        id: adminUser.id,
        username: adminUser.username,
        full_name: adminUser.full_name,
        bloq_user: ADMIN_USER_FREE_FLAG_VALUE
      }
    });
  } catch (error) {
    if (error.code === 'BLOQ_USER_COLUMN_MISSING') {
      return next(createHttpError(503, error.message, {
        code: error.code,
        expose: true,
        cause: error
      }));
    }

    return next(wrapError(error, { publicMessage: 'Erro ao desbloquear login do admin.' }));
  }
};

const getAdminSession = (req, res) => {
  res.json({ user: req.adminSession });
};

const logoutAdmin = (req, res) => {
  res.clearCookie(ADMIN_SESSION_COOKIE, getAdminCookieOptions());
  res.json({ message: 'Logout realizado com sucesso.' });
};

module.exports = {
  requireAdminSession,
  loginAdmin,
  unlockAdminLoginByUser,
  getAdminSession,
  logoutAdmin
};
