const mysql = require('mysql2');
require('dotenv').config();

/**
 * Configura a conexao com o banco.
 * As credenciais sensiveis devem vir do .env para evitar segredos hardcoded.
 */
if (!process.env.DB_PASSWORD) {
  throw new Error('A variavel DB_PASSWORD nao foi definida no ambiente.');
}

const dbPort = Number(process.env.DB_PORT || 3306);
const useDbSsl = ['1', 'true', 'yes'].includes(String(process.env.DB_SSL || '').toLowerCase());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number.isFinite(dbPort) ? dbPort : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'site-talmax',
  ssl: useDbSsl ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

const promisePool = pool.promise();

module.exports = promisePool;
