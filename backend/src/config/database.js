const mysql = require('mysql2');
require('dotenv').config();

/**
 * Configura a conexao com o banco.
 * As credenciais sensiveis devem vir do .env para evitar segredos hardcoded.
 */
if (!process.env.DB_PASSWORD) {
  throw new Error('A variavel DB_PASSWORD nao foi definida no ambiente.');
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'site-talmax',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

module.exports = promisePool;
