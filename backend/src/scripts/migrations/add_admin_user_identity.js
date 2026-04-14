/**
 * Adiciona os campos de identidade do admin:
 * - email
 * - role
 *
 * Tambem garante que exista um admin master para gerenciar outros usuarios.
 */
const db = require('../../config/database');

const ADMIN_ROLE_MASTER = 'master';
const ADMIN_ROLE_EDITOR = 'editor';

async function ensureEmailColumn() {
  const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'email'");

  if (columns.length === 0) {
    console.log('Adicionando coluna email na tabela users...');
    await db.query(`
      ALTER TABLE users
      ADD COLUMN email VARCHAR(160) DEFAULT NULL AFTER full_name
    `);
  } else {
    console.log('A coluna email ja existe.');
  }

  await db.query(`
    UPDATE users
    SET email = NULL
    WHERE email IS NOT NULL AND TRIM(email) = ''
  `);
}

async function ensureRoleColumn() {
  const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'role'");

  if (columns.length === 0) {
    console.log('Adicionando coluna role na tabela users...');
    await db.query(`
      ALTER TABLE users
      ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT '${ADMIN_ROLE_EDITOR}' AFTER email
    `);
  } else {
    console.log('A coluna role ja existe.');
  }

  await db.query(`
    ALTER TABLE users
    MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT '${ADMIN_ROLE_EDITOR}'
  `);
}

async function ensureEmailUniqueIndex() {
  const [indexes] = await db.query("SHOW INDEX FROM users WHERE Key_name = 'uk_users_email'");

  if (indexes.length === 0) {
    console.log('Criando indice unico para email...');
    await db.query(`
      ALTER TABLE users
      ADD UNIQUE KEY uk_users_email (email)
    `);
  } else {
    console.log('O indice unico de email ja existe.');
  }
}

async function ensureMasterAdmin() {
  await db.query(`
    UPDATE users
    SET role = '${ADMIN_ROLE_EDITOR}'
    WHERE role IS NULL OR TRIM(role) = ''
  `);

  const [masterCandidateRows] = await db.query(`
    SELECT id
    FROM users
    ORDER BY
      CASE WHEN LOWER(username) = 'admin' THEN 0 ELSE 1 END,
      id ASC
    LIMIT 1
  `);

  const masterCandidate = masterCandidateRows[0];

  if (!masterCandidate) {
    console.log('Nenhum usuario encontrado na tabela users para promover como master.');
    return;
  }

  await db.query(
    'UPDATE users SET role = ? WHERE id = ? LIMIT 1',
    [ADMIN_ROLE_MASTER, masterCandidate.id]
  );

  console.log(`Usuario ${masterCandidate.id} definido como admin master.`);
}

async function run() {
  try {
    console.log('Garantindo identidade de usuarios admin...');
    await ensureEmailColumn();
    await ensureRoleColumn();
    await ensureEmailUniqueIndex();
    await ensureMasterAdmin();
    console.log('Campos de identidade do admin garantidos com sucesso.');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao preparar identidade dos usuarios admin:', error);
    process.exit(1);
  }
}

run();
