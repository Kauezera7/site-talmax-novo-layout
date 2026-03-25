/**
 * Ponto de entrada do backend.
 * Carrega variaveis de ambiente, cria a app e inicia o servidor HTTP.
 */
const path = require('path');
const fs = require('fs');

// Carrega o .env correto baseado no ambiente
const nodeEnv = process.env.NODE_ENV || 'development';
const envFiles = [
  `.env.${nodeEnv}`,
  '.env'
];

for (const file of envFiles) {
  const envPath = path.resolve(__dirname, file);
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    break;
  }
}

const createApp = require('./src/server/app');
...
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📦 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  
  // Log qual storage está sendo usado
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const hasCloudinary = Boolean(cloudName) && Boolean(process.env.CLOUDINARY_API_KEY);
  const hasSftp = Boolean(process.env.SFTP_HOST) && Boolean(process.env.SFTP_USER);
  
  if (hasCloudinary) {
    console.log(`☁️  Storage: Cloudinary (Cloud: ${cloudName})`);
    console.log(`📁 Pasta: ${process.env.CLOUDINARY_FOLDER || 'talmax'}\n`);
  } else if (hasSftp) {
    console.log(`📤 Storage: SFTP\n`);
  } else {
    console.log(`📁 Storage: Local (/storage/img)\n`);
  }
});
