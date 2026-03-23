/**
 * Centraliza a autenticacao do painel administrativo.
 * Aqui ficam login, logout, leitura do cookie de sessao e o middleware de protecao.
 */
const crypto = require('crypto');
const db = require('../../config/database');

const ADMIN_SESSION_COOKIE = 'talmax-admin-session';
if (!process.env.ADMIN_JWT_SECRET) {
  throw new Error('A variavel ADMIN_JWT_SECRET nao foi definida no ambiente.');
}

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
const ADMIN_JWT_EXPIRES_IN_SECONDS = Number(process.env.ADMIN_JWT_EXPIRES_IN_SECONDS || 60 * 60 * 8);

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
  const cookies = parseCookies(req);
  return cookies[ADMIN_SESSION_COOKIE] || null;
};

const getAdminCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: ADMIN_JWT_EXPIRES_IN_SECONDS * 1000
});

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

const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Informe usuario e senha.' });
    }

    const [users] = await db.query(
      'SELECT id, username, password, full_name FROM users WHERE username = ? LIMIT 1',
      [username]
    );

    const adminUser = users[0];

    if (!adminUser || !verifyAdminPassword(password, adminUser.password)) {
      return res.status(401).json({ error: 'Credenciais invalidas.' });
    }

    const sessionPayload = {
      id: adminUser.id,
      username: adminUser.username,
      full_name: adminUser.full_name,
      created_at: new Date().toISOString()
    };
    const token = createJwtToken(sessionPayload);

    res.cookie(ADMIN_SESSION_COOKIE, token, getAdminCookieOptions());

    return res.json({
      user: sessionPayload
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
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
  getAdminSession,
  logoutAdmin
};
