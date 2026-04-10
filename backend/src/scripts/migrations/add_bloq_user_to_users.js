/**
 * Adiciona a coluna bloq_user na tabela users.
 * Regra:
 * 1 = usuario livre para acessar o painel
 * 2 = usuario bloqueado temporariamente
 */
const db = require('../../config/database');

async function addColumn() {
  try {
    console.log('Garantindo coluna bloq_user na tabela users...');

    const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'bloq_user'");

    if (columns.length === 0) {
      await db.query(`
        ALTER TABLE users
        ADD COLUMN bloq_user TINYINT NOT NULL DEFAULT 1 AFTER full_name
      `);
      console.log('Coluna bloq_user adicionada com sucesso!');
    } else {
      console.log('A coluna bloq_user ja existe. Ajustando padrao e valores...');
    }

    await db.query(`
      ALTER TABLE users
      MODIFY COLUMN bloq_user TINYINT NOT NULL DEFAULT 1
    `);

    await db.query(`
      UPDATE users
      SET bloq_user = 1
      WHERE bloq_user IS NULL OR bloq_user = 0
    `);

    console.log('Campo bloq_user normalizado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao adicionar a coluna bloq_user:', error);
    process.exit(1);
  }
}

addColumn();
