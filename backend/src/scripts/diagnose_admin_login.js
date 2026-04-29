/**
 * Diagnostica o cadastro usado no login admin sem expor senha/hash.
 *
 * Uso:
 * node src/scripts/diagnose_admin_login.js usuario-ou-email
 * node src/scripts/diagnose_admin_login.js usuario-ou-email senha-para-testar
 */
const db = require('../config/database');
const {
  isScryptPasswordHash,
  verifyAdminPassword
} = require('../server/auth/adminPassword');

const ADMIN_ALLOWED_ROLES = new Set(['master', 'editor']);

const normalizeIdentifier = (value) => (
  typeof value === 'string'
    ? value.trim().toLowerCase()
    : ''
);

const usersTableSupportsColumn = async (columnName) => {
  const [columns] = await db.query('SHOW COLUMNS FROM users LIKE ?', [columnName]);
  return columns.length > 0;
};

const tableExists = async (tableName) => {
  const [rows] = await db.query(`
    SELECT COUNT(*) AS total
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
  `, [tableName]);

  return Number(rows?.[0]?.total || 0) > 0;
};

const printStatus = (label, ok, detail = '') => {
  const status = ok ? 'OK' : 'FALHA';
  console.log(`${status} - ${label}${detail ? `: ${detail}` : ''}`);
};

const main = async () => {
  const identifier = normalizeIdentifier(process.argv[2]);
  const passwordToTest = process.argv[3];

  if (!identifier) {
    throw new Error('Uso: node src/scripts/diagnose_admin_login.js usuario-ou-email [senha]');
  }

  console.log('Diagnostico do login admin');
  console.log(`Identificador: ${identifier}`);
  console.log('');

  printStatus('ADMIN_JWT_SECRET configurado', Boolean(process.env.ADMIN_JWT_SECRET));

  const usersTableReady = await tableExists('users');
  printStatus('Tabela users existe', usersTableReady);

  if (!usersTableReady) {
    return;
  }

  const [supportsEmail, supportsRole, supportsBloqUser, supportsSessionVersion] = await Promise.all([
    usersTableSupportsColumn('email'),
    usersTableSupportsColumn('role'),
    usersTableSupportsColumn('bloq_user'),
    usersTableSupportsColumn('session_version')
  ]);

  printStatus('Coluna email existe', supportsEmail);
  printStatus('Coluna role existe', supportsRole);
  printStatus('Coluna bloq_user existe', supportsBloqUser);
  printStatus('Coluna session_version existe', supportsSessionVersion);

  const selectFields = [
    'id',
    'username',
    'password',
    supportsEmail ? 'email' : 'NULL AS email',
    supportsRole ? 'role' : 'NULL AS role',
    supportsBloqUser ? 'bloq_user' : '1 AS bloq_user'
  ];
  const lookupQuery = supportsEmail
    ? `SELECT ${selectFields.join(', ')} FROM users WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1`
    : `SELECT ${selectFields.join(', ')} FROM users WHERE LOWER(username) = ? LIMIT 1`;
  const lookupParams = supportsEmail
    ? [identifier, identifier]
    : [identifier];
  const [users] = await db.query(lookupQuery, lookupParams);
  const user = users[0];

  printStatus('Usuario encontrado', Boolean(user));

  if (!user) {
    return;
  }

  const normalizedRole = normalizeIdentifier(user.role);
  printStatus('Role permite acesso', ADMIN_ALLOWED_ROLES.has(normalizedRole), normalizedRole || 'sem role');
  printStatus('Usuario desbloqueado', Number(user.bloq_user || 1) === 1, `bloq_user=${user.bloq_user}`);
  printStatus('Senha esta em hash scrypt', isScryptPasswordHash(user.password));

  if (passwordToTest !== undefined) {
    printStatus('Senha informada confere', verifyAdminPassword(passwordToTest, user.password));
  }

  printStatus('Tabela admin_login_rate_limits existe', await tableExists('admin_login_rate_limits'));
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.message || 'Erro ao diagnosticar login admin.', error);
    process.exit(1);
  });
