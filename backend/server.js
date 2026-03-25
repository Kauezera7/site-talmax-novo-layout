/**
 * Ponto de entrada do backend.
 * Carrega variaveis de ambiente de todas as formas possiveis.
 */
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

console.log('--- INICIANDO SERVIDOR ---');
console.log(`📂 Diretorio atual: ${process.cwd()}`);
console.log(`📂 Diretorio do script: ${__dirname}`);

// 1. Tenta carregar do arquivo .env na pasta backend
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('✅ Arquivo .env detectado e carregado.');
} else {
    console.log('ℹ️ Arquivo .env nao encontrado (comum em producao).');
}

// 2. Carrega variaveis do sistema (Render Dashboard)
dotenv.config(); 

const createApp = require('./src/server/app');
const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📦 Ambiente: ${process.env.NODE_ENV}`);
  
  console.log('🔍 STATUS CLOUDINARY:');
  console.log(`   - Cloud Name: ${cloudName ? 'OK (' + cloudName + ')' : '❌ FALTANDO'}`);
  console.log(`   - API Key: ${apiKey ? 'OK' : '❌ FALTANDO'}`);
  console.log(`   - API Secret: ${apiSecret ? 'OK' : '❌ FALTANDO'}`);

  if (cloudName && apiKey && apiSecret) {
    console.log(`✨ STORAGE CONFIGURADO: Cloudinary\n`);
  } else {
    console.log(`⚠️  STORAGE CONFIGURADO: LOCAL (Atenção: imagens nao serao salvas no Cloudinary!)\n`);
  }
});
