/**
 * Adiciona o campo logo_url aos cards/segmentos exibidos na Home.
 */
const db = require('../../config/database');

async function addLogoColumn() {
  try {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS total
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'home_services'
        AND COLUMN_NAME = 'logo_url'
    `);

    if (Number(rows?.[0]?.total || 0) === 0) {
      await db.query(`
        ALTER TABLE home_services
        ADD COLUMN logo_url VARCHAR(255) DEFAULT NULL AFTER image_url
      `);
      console.log('Coluna logo_url adicionada em home_services.');
    } else {
      console.log('Coluna logo_url ja existe em home_services.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Erro ao adicionar logo_url em home_services:', err);
    process.exit(1);
  }
}

addLogoColumn();
