/**
 * Adiciona a coluna session_version na tabela users.
 * Ela serve para invalidar JWTs antigos quando houver troca de senha
 * ou revogacao administrativa de sessao.
 */
const db = require('../../config/database');

async function run() {
  try {
    console.log('Garantindo coluna session_version na tabela users...');

    const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'session_version'");

    if (columns.length === 0) {
      await db.query(`
        ALTER TABLE users
        ADD COLUMN session_version INT NOT NULL DEFAULT 0 AFTER bloq_user
      `);
      console.log('Coluna session_version adicionada com sucesso!');
    } else {
      console.log('A coluna session_version ja existe. Ajustando padrao e valores...');
    }

    await db.query(`
      ALTER TABLE users
      MODIFY COLUMN session_version INT NOT NULL DEFAULT 0
    `);

    await db.query(`
      UPDATE users
      SET session_version = 0
      WHERE session_version IS NULL OR session_version < 0
    `);

    console.log('Campo session_version normalizado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao adicionar a coluna session_version:', error);
    process.exit(1);
  }
}

run();
