/**
 * Limpa o bloqueio de login admin persistido no banco.
 *
 * Uso:
 * node src/scripts/clear_admin_login_lock.js usuario-ou-email
 * node src/scripts/clear_admin_login_lock.js --all
 */
const crypto = require('crypto');
const db = require('../config/database');

const ADMIN_USER_FREE_FLAG_VALUE = 1;

const normalizeAdminIdentifier = (value) => (
  typeof value === 'string'
    ? value.trim().toLowerCase()
    : ''
);

const buildRateLimitHash = (value) => crypto
  .createHash('sha256')
  .update(String(value || ''))
  .digest('hex');

const getRateLimitKeyForIdentifier = (identifier) => {
  const normalizedIdentifier = normalizeAdminIdentifier(identifier);

  if (!normalizedIdentifier) {
    return '';
  }

  return `admin-login:user:${buildRateLimitHash(normalizedIdentifier)}`;
};

const usersTableSupportsEmail = async () => {
  const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'email'");
  return columns.length > 0;
};

const usersTableSupportsBloqUser = async () => {
  const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'bloq_user'");
  return columns.length > 0;
};

const rateLimitTableExists = async () => {
  const [rows] = await db.query(`
    SELECT COUNT(*) AS total
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'admin_login_rate_limits'
  `);

  return Number(rows?.[0]?.total || 0) > 0;
};

const clearAllLocks = async () => {
  const hasRateLimitTable = await rateLimitTableExists();

  if (hasRateLimitTable) {
    await db.query('DELETE FROM admin_login_rate_limits');
  }

  if (await usersTableSupportsBloqUser()) {
    await db.query('UPDATE users SET bloq_user = ?', [ADMIN_USER_FREE_FLAG_VALUE]);
  }

  console.log('Todos os bloqueios de login admin foram limpos.');
};

const clearUserLock = async (identifier) => {
  const normalizedIdentifier = normalizeAdminIdentifier(identifier);

  if (!normalizedIdentifier) {
    throw new Error('Informe um usuario ou e-mail valido.');
  }

  const supportsEmail = await usersTableSupportsEmail();
  const [users] = await db.query(
    supportsEmail
      ? 'SELECT id, username, email FROM users WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1'
      : 'SELECT id, username, NULL AS email FROM users WHERE LOWER(username) = ? LIMIT 1',
    supportsEmail
      ? [normalizedIdentifier, normalizedIdentifier]
      : [normalizedIdentifier]
  );

  const user = users[0];

  if (!user) {
    console.log('Usuario nao encontrado. Limpando apenas o identificador informado no rate limit.');
  }

  const identifiers = [
    normalizedIdentifier,
    user?.username,
    user?.email
  ]
    .map((value) => normalizeAdminIdentifier(value))
    .filter((value, index, values) => value && values.indexOf(value) === index);

  if (await rateLimitTableExists()) {
    const keys = identifiers
      .map((value) => getRateLimitKeyForIdentifier(value))
      .filter(Boolean);

    if (keys.length > 0) {
      await db.query(`DELETE FROM admin_login_rate_limits WHERE key_name IN (${keys.map(() => '?').join(', ')})`, keys);
    }
  }

  if (user?.id && await usersTableSupportsBloqUser()) {
    await db.query('UPDATE users SET bloq_user = ? WHERE id = ? LIMIT 1', [ADMIN_USER_FREE_FLAG_VALUE, user.id]);
  }

  console.log(`Bloqueio limpo para: ${identifier}`);
};

const main = async () => {
  try {
    const rawArg = process.argv[2];

    if (!rawArg) {
      throw new Error('Uso: node src/scripts/clear_admin_login_lock.js usuario-ou-email | --all');
    }

    if (rawArg === '--all') {
      await clearAllLocks();
    } else {
      await clearUserLock(rawArg);
    }

    process.exit(0);
  } catch (error) {
    console.error(error.message || 'Erro ao limpar bloqueio de login admin.', error);
    process.exit(1);
  }
};

main();
