/**
 * Ponto de entrada do backend.
 * Carrega variaveis de ambiente de todas as formas possiveis.
 */
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '.env');
const envFileLoaded = fs.existsSync(envPath);

if (envFileLoaded) {
  dotenv.config({ path: envPath });
}

dotenv.config();

const logger = require('./src/server/utils/logger');
const { ensureBootstrapAdmin } = require('./src/server/auth/adminBootstrap');
const {
  buildFrontendDist,
  frontendDistIndex
} = require('./src/scripts/build_frontend_dist');

logger.info({
  cwd: process.cwd(),
  scriptDir: __dirname,
  envFileLoaded
}, 'Iniciando servidor');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  buildFrontendDist();

  const createApp = require('./src/server/app');
  const app = createApp();

  await ensureBootstrapAdmin();

  app.listen(PORT, '0.0.0.0', () => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    logger.info({
      port: PORT,
      host: '0.0.0.0',
      environment: process.env.NODE_ENV || 'development',
      cloudinary: {
        cloudName: cloudName || null,
        apiKeyConfigured: !!apiKey,
        apiSecretConfigured: !!apiSecret,
        storageMode: cloudName && apiKey && apiSecret ? 'cloudinary' : 'local'
      },
      frontendDistIndex
    }, 'Servidor rodando');
  });
};

startServer().catch((error) => {
  logger.error({ err: error }, 'Falha ao iniciar o servidor.');
  process.exit(1);
});
