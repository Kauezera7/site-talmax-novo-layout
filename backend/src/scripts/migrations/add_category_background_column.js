/**
 * Adiciona uma imagem de fundo opcional para os cards de categorias.
 */
const db = require('../../config/database');

async function addCategoryBackgroundColumn() {
  try {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS total
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'categorias'
        AND COLUMN_NAME = 'background_url'
    `);

    if (Number(rows?.[0]?.total || 0) === 0) {
      await db.query(`
        ALTER TABLE categorias
        ADD COLUMN background_url VARCHAR(500) DEFAULT NULL AFTER icon_url
      `);
      console.log('Coluna background_url adicionada em categorias.');
    } else {
      console.log('Coluna background_url ja existe em categorias.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Erro ao adicionar background_url em categorias:', err);
    process.exit(1);
  }
}

addCategoryBackgroundColumn();
