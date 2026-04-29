/**
 * Recria a tabela auxiliar de rate limit do login admin.
 *
 * Esta tabela guarda apenas bloqueios temporarios de login. Recria-la nao
 * remove usuarios, produtos, banners ou configuracoes do site.
 *
 * Uso:
 * node src/scripts/repair_admin_login_rate_limits.js
 */
const db = require('../config/database');

const ADMIN_LOGIN_RATE_LIMITS_TABLE_QUERY = `
  CREATE TABLE admin_login_rate_limits (
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
`;

const usersTableSupportsBloqUser = async () => {
  const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'bloq_user'");
  return columns.length > 0;
};

const main = async () => {
  await db.query('DROP TABLE IF EXISTS admin_login_rate_limits');
  await db.query(ADMIN_LOGIN_RATE_LIMITS_TABLE_QUERY);

  if (await usersTableSupportsBloqUser()) {
    await db.query('UPDATE users SET bloq_user = 1 WHERE bloq_user IS NULL OR bloq_user <> 1');
  }

  console.log('Tabela admin_login_rate_limits recriada e bloqueios admin liberados.');
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.message || 'Erro ao reparar admin_login_rate_limits.', error);
    process.exit(1);
  });
