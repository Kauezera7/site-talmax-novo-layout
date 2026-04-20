const db = require('../../config/database');
const logger = require('../utils/logger');
const { hashAdminPassword } = require('./adminPassword');

const ADMIN_ROLE_MASTER = 'master';
const ADMIN_ROLE_EDITOR = 'editor';
const ADMIN_USER_FREE_FLAG_VALUE = 1;

const normalizeEnvValue = (value) => (
  typeof value === 'string' ? value.trim() : ''
);

const getBootstrapConfig = () => ({
  username: normalizeEnvValue(process.env.ADMIN_BOOTSTRAP_USERNAME),
  password: normalizeEnvValue(process.env.ADMIN_BOOTSTRAP_PASSWORD),
  email: normalizeEnvValue(process.env.ADMIN_BOOTSTRAP_EMAIL),
  fullName: normalizeEnvValue(process.env.ADMIN_BOOTSTRAP_FULL_NAME) || 'Administrador Talmax'
});

const usersTableExists = async () => {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
    `
  );

  return Number(rows?.[0]?.total || 0) > 0;
};

const getUsersTableColumns = async () => {
  const [rows] = await db.query(
    `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
    `
  );

  return new Set(rows.map((row) => row.COLUMN_NAME));
};

const countAdminUsers = async () => {
  const columns = await getUsersTableColumns();

  const query = columns.has('role')
    ? 'SELECT COUNT(*) AS total FROM users WHERE LOWER(role) IN (?, ?)'
    : 'SELECT COUNT(*) AS total FROM users';
  const params = columns.has('role')
    ? [ADMIN_ROLE_MASTER, ADMIN_ROLE_EDITOR]
    : [];
  const [rows] = await db.query(query, params);

  return Number(rows?.[0]?.total || 0);
};

const buildBootstrapInsert = (columns, config) => {
  const fields = ['username', 'password'];
  const values = [config.username, hashAdminPassword(config.password)];

  if (columns.has('full_name')) {
    fields.push('full_name');
    values.push(config.fullName);
  }

  if (columns.has('email')) {
    fields.push('email');
    values.push(config.email || null);
  }

  if (columns.has('role')) {
    fields.push('role');
    values.push(ADMIN_ROLE_MASTER);
  }

  if (columns.has('bloq_user')) {
    fields.push('bloq_user');
    values.push(ADMIN_USER_FREE_FLAG_VALUE);
  }

  if (columns.has('session_version')) {
    fields.push('session_version');
    values.push(0);
  }

  return { fields, values };
};

const ensureBootstrapAdmin = async () => {
  const bootstrapConfig = getBootstrapConfig();

  try {
    if (!await usersTableExists()) {
      return false;
    }

    if (await countAdminUsers() > 0) {
      return false;
    }

    if (!bootstrapConfig.username || !bootstrapConfig.password) {
      logger.warn(
        'A tabela users esta vazia. Defina ADMIN_BOOTSTRAP_USERNAME e ADMIN_BOOTSTRAP_PASSWORD para criar o primeiro admin com hash seguro.'
      );
      return false;
    }

    const usersTableColumns = await getUsersTableColumns();
    const { fields, values } = buildBootstrapInsert(usersTableColumns, bootstrapConfig);
    const placeholders = fields.map(() => '?').join(', ');

    await db.query(
      `INSERT INTO users (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    logger.warn({
      username: bootstrapConfig.username,
      emailConfigured: Boolean(bootstrapConfig.email)
    }, 'Primeiro admin bootstrap criado com sucesso. Remova ADMIN_BOOTSTRAP_* do ambiente apos o primeiro login.');

    return true;
  } catch (error) {
    logger.error({ err: error }, 'Falha ao verificar/criar o admin bootstrap.');
    return false;
  }
};

module.exports = {
  ensureBootstrapAdmin
};
