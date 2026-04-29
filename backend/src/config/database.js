const fs = require('fs');
const path = require('path');
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
const backendRootDir = path.resolve(__dirname, '../../');

const normalizeMultilineEnvValue = (value) => (
  typeof value === 'string' && value.trim()
    ? value.replace(/\\n/g, '\n').trim()
    : ''
);

const resolveConfigFilePath = (filePath) => (
  path.isAbsolute(filePath)
    ? filePath
    : path.resolve(backendRootDir, filePath)
);

const readOptionalTlsMaterial = (inlineValue, filePathValue, label) => {
  const normalizedInlineValue = normalizeMultilineEnvValue(inlineValue);

  if (normalizedInlineValue) {
    return normalizedInlineValue;
  }

  const normalizedFilePath = typeof filePathValue === 'string' ? filePathValue.trim() : '';

  if (!normalizedFilePath) {
    return undefined;
  }

  const resolvedFilePath = resolveConfigFilePath(normalizedFilePath);

  try {
    return fs.readFileSync(resolvedFilePath, 'utf8');
  } catch (error) {
    throw new Error(`Nao foi possivel ler ${label} em ${resolvedFilePath}: ${error.message}`);
  }
};

const buildDbSslConfig = () => {
  if (!useDbSsl) {
    return undefined;
  }

  const sslConfig = {
    rejectUnauthorized: true
  };

  const ca = readOptionalTlsMaterial(process.env.DB_SSL_CA, process.env.DB_SSL_CA_PATH, 'DB_SSL_CA');
  const cert = readOptionalTlsMaterial(process.env.DB_SSL_CERT, process.env.DB_SSL_CERT_PATH, 'DB_SSL_CERT');
  const key = readOptionalTlsMaterial(process.env.DB_SSL_KEY, process.env.DB_SSL_KEY_PATH, 'DB_SSL_KEY');
  const servername = typeof process.env.DB_SSL_SERVERNAME === 'string'
    ? process.env.DB_SSL_SERVERNAME.trim()
    : '';

  if (ca) {
    sslConfig.ca = ca;
  }

  if (cert) {
    sslConfig.cert = cert;
  }

  if (key) {
    sslConfig.key = key;
  }

  if (servername) {
    sslConfig.servername = servername;
  }

  return sslConfig;
};

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number.isFinite(dbPort) ? dbPort : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'site-talmax',
  ssl: buildDbSslConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

const promisePool = pool.promise();

module.exports = promisePool;
