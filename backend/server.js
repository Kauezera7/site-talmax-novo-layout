/**
 * Ponto de entrada do backend.
 * Carrega variaveis de ambiente, cria a app e inicia o servidor HTTP.
 */
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// 1. Carrega o .env padrão
const defaultEnvPath = path.resolve(__dirname, '.env');
if (fs.existsSync(defaultEnvPath)) {
  dotenv.config({ path: defaultEnvPath });
}

// 2. Carrega .env específico do ambiente (ex: .env.production) para sobrescrever, se existir
const nodeEnv = process.env.NODE_ENV || 'development';
const specificEnvPath = path.resolve(__dirname, `.env.${nodeEnv}`);
if (fs.existsSync(specificEnvPath)) {
  dotenv.config({ path: specificEnvPath, override: true });
}

const createApp = require('./src/server/app');

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📦 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  
  // Log de diagnóstico das variáveis (sem mostrar segredos)
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  console.log('🔍 Verificação de Configuração:');
  console.log(`   Cloudinary Name: ${cloudName ? 'Definido (' + cloudName + ')' : 'NÃO DEFINIDO'}`);
  console.log(`   Cloudinary Key: ${apiKey ? 'Definida' : 'NÃO DEFINIDA'}`);
  console.log(`   Cloudinary Secret: ${apiSecret ? 'Definida' : 'NÃO DEFINIDA'}`);

  if (cloudName && apiKey && apiSecret) {
    console.log(`☁️  Storage ATIVO: Cloudinary`);
    console.log(`📁 Pasta: ${process.env.CLOUDINARY_FOLDER || 'talmax'}\n`);
  } else {
    console.log(`📁 Storage ATIVO: Local (Faltam chaves do Cloudinary)\n`);
  }
});
