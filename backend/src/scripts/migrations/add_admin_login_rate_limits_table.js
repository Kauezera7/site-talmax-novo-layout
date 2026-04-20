/**
 * Cria a tabela persistente usada para controlar tentativas de login admin.
 * Isso evita que o bloqueio se perca em restart do processo ou em varias instancias.
 */
const db = require('../../config/database');

async function run() {
  try {
    console.log('Garantindo tabela admin_login_rate_limits...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_login_rate_limits (
        key_name VARCHAR(255) NOT NULL,
        failed_attempts INT NOT NULL DEFAULT 0,
        window_started_at BIGINT NOT NULL,
        blocked_until BIGINT DEFAULT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (key_name),
        KEY idx_admin_login_rate_limits_updated_at (updated_at),
        KEY idx_admin_login_rate_limits_blocked_until (blocked_until)
      )
    `);

    console.log('Tabela admin_login_rate_limits garantida com sucesso.');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar a tabela admin_login_rate_limits:', error);
    process.exit(1);
  }
}

run();
