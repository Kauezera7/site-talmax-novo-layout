/**
 * Redefine a senha de um usuario admin usando o hash aceito pelo backend.
 *
 * Uso:
 * node src/scripts/reset_admin_password.js usuario-ou-email nova-senha
 */
const db = require('../config/database');
const { hashAdminPassword } = require('../server/auth/adminPassword');
const crypto = require('crypto');

const ADMIN_USER_FREE_FLAG_VALUE = 1;
const ADMIN_ROLE_MASTER = 'master';

const normalizeIdentifier = (value) => (
  typeof value === 'string'
    ? value.trim().toLowerCase()
    : ''
);

const usersTableSupportsColumn = async (columnName) => {
  const [columns] = await db.query(`SHOW COLUMNS FROM users LIKE ?`, [columnName]);
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

const buildRateLimitHash = (value) => crypto
  .createHash('sha256')
  .update(String(value || ''))
  .digest('hex');

const getRateLimitKeyForIdentifier = (identifier) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  return normalizedIdentifier
    ? `admin-login:user:${buildRateLimitHash(normalizedIdentifier)}`
    : '';
};

const clearRateLimitsForUser = async (identifiers) => {
  if (!await rateLimitTableExists()) {
    return;
  }

  const keys = identifiers
    .map((value) => getRateLimitKeyForIdentifier(value))
    .filter((value, index, values) => value && values.indexOf(value) === index);

  if (keys.length === 0) {
    return;
  }

  await db.query(
    `DELETE FROM admin_login_rate_limits WHERE key_name IN (${keys.map(() => '?').join(', ')})`,
    keys
  );
};

const main = async () => {
  const identifier = normalizeIdentifier(process.argv[2]);
  const newPassword = process.argv[3];

  if (!identifier || !newPassword) {
    throw new Error('Uso: node src/scripts/reset_admin_password.js usuario-ou-email nova-senha');
  }

  const [supportsEmail, supportsRole, supportsBloqUser] = await Promise.all([
    usersTableSupportsColumn('email'),
    usersTableSupportsColumn('role'),
    usersTableSupportsColumn('bloq_user')
  ]);

  const roleSelect = supportsRole ? 'role' : 'NULL AS role';
  const lookupQuery = supportsEmail
    ? `SELECT id, username, email, ${roleSelect} FROM users WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1`
    : `SELECT id, username, NULL AS email, ${roleSelect} FROM users WHERE LOWER(username) = ? LIMIT 1`;
  const lookupParams = supportsEmail
    ? [identifier, identifier]
    : [identifier];
  const [users] = await db.query(lookupQuery, lookupParams);
  const user = users[0];

  if (!user) {
    throw new Error(`Usuario admin nao encontrado para: ${identifier}`);
  }

  const updates = ['password = ?'];
  const params = [hashAdminPassword(newPassword)];

  if (supportsRole) {
    updates.push('role = ?');
    params.push(ADMIN_ROLE_MASTER);
  }

  if (supportsBloqUser) {
    updates.push('bloq_user = ?');
    params.push(ADMIN_USER_FREE_FLAG_VALUE);
  }

  params.push(user.id);

  await db.query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ? LIMIT 1`,
    params
  );

  await clearRateLimitsForUser([identifier, user.username, user.email]);

  console.log(`Senha redefinida e usuario liberado: ${user.username || identifier}`);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.message || 'Erro ao redefinir senha admin.', error);
    process.exit(1);
  });
