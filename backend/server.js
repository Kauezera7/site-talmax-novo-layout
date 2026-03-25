/**
 * Ponto de entrada do backend.
 * Carrega variaveis de ambiente, cria a app e inicia o servidor HTTP.
 */
require('dotenv').config();

const createApp = require('./src/server/app');

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📦 NODE_ENV: ${process.env.NODE_ENV}`);
  
  // Log qual storage está sendo usado
  const hasCloudinary = Boolean(process.env.CLOUDINARY_CLOUD_NAME) && process.env.NODE_ENV === 'production';
  const hasSftp = Boolean(process.env.SFTP_HOST) && process.env.NODE_ENV === 'production';
  
  if (hasCloudinary) {
    console.log(`☁️  Storage: Cloudinary\n`);
  } else if (hasSftp) {
    console.log(`📤 Storage: SFTP\n`);
  } else {
    console.log(`📁 Storage: Local (/storage/img)\n`);
  }
});
