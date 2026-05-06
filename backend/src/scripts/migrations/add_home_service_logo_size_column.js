/**
 * Adiciona o campo de tamanho da logo aos cards/segmentos exibidos na Home.
 */
const db = require('../../config/database');

async function addHomeServiceLogoSizeColumn() {
  try {
    const [columns] = await db.query(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'home_services'
        AND COLUMN_NAME = 'logo_size'
    `);

    if (columns.length === 0) {
      await db.query(`
        ALTER TABLE home_services
        ADD COLUMN logo_size INT DEFAULT 72 AFTER logo_url
      `);
      console.log('Coluna logo_size adicionada em home_services.');
    } else {
      console.log('Coluna logo_size ja existe em home_services.');
    }
  } catch (err) {
    console.error('Erro ao adicionar logo_size em home_services:', err);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

addHomeServiceLogoSizeColumn();
