/**
 * Ponto de entrada do backend.
 * Carrega variaveis de ambiente, cria a app e inicia o servidor HTTP.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const createApp = require('./src/server/app');

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📦 NODE_ENV: ${process.env.NODE_ENV}`);
  
  // Log qual storage está sendo usado
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const hasCloudinary = Boolean(cloudName) && Boolean(process.env.CLOUDINARY_API_KEY);
  const hasSftp = Boolean(process.env.SFTP_HOST) && Boolean(process.env.SFTP_USER);
  
  if (hasCloudinary) {
    console.log(`☁️  Storage: Cloudinary (Cloud: ${cloudName})\n`);
  } else if (hasSftp) {
    console.log(`📤 Storage: SFTP\n`);
  } else {
    console.log(`📁 Storage: Local (/storage/img)\n`);
  }
});
