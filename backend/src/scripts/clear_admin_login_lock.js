/**
 * Libera a flag bloq_user do login admin quando ela existir no banco.
 *
 * Uso:
 * node src/scripts/clear_admin_login_lock.js usuario-ou-email
 * node src/scripts/clear_admin_login_lock.js --all
 */
const db = require('../config/database');

const ADMIN_USER_FREE_FLAG_VALUE = 1;

const normalizeAdminIdentifier = (value) => (
  typeof value === 'string'
    ? value.trim().toLowerCase()
    : ''
);

const usersTableSupportsEmail = async () => {
  const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'email'");
  return columns.length > 0;
};

const usersTableSupportsBloqUser = async () => {
  const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'bloq_user'");
  return columns.length > 0;
};

const clearAllLocks = async () => {
  if (await usersTableSupportsBloqUser()) {
    await db.query('UPDATE users SET bloq_user = ?', [ADMIN_USER_FREE_FLAG_VALUE]);
    console.log('Todos os usuarios admin foram liberados em bloq_user.');
    return;
  }

  console.log('Coluna bloq_user nao existe. Nada para liberar.');
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
    throw new Error(`Usuario admin nao encontrado para: ${identifier}`);
  }

  if (user?.id && await usersTableSupportsBloqUser()) {
    await db.query('UPDATE users SET bloq_user = ? WHERE id = ? LIMIT 1', [ADMIN_USER_FREE_FLAG_VALUE, user.id]);
    console.log(`Usuario liberado em bloq_user: ${user.username || identifier}`);
    return;
  }

  console.log('Coluna bloq_user nao existe. Nada para liberar.');
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
