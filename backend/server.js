/**
 * Ponto de entrada do backend.
 * Carrega variaveis de ambiente ANTES de qualquer outro modulo.
 */
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// --- CARREGAMENTO DE VARIÁVEIS (PRIMEIRA COISA) ---
const nodeEnv = process.env.NODE_ENV || 'development';

// Tenta carregar .env.production, .env.development ou .env
const envFiles = [`.env.${nodeEnv}`, '.env'];
let loaded = false;

for (const file of envFiles) {
  const envPath = path.resolve(__dirname, file);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`✅ Variáveis carregadas de: ${file}`);
    loaded = true;
    break;
  }
}

if (!loaded) {
  // Se não achou arquivo, o dotenv tenta carregar do ambiente (importante para o Render)
  dotenv.config();
  console.log(`ℹ️ Nao foi encontrado arquivo .env, usando variaveis de ambiente do sistema.`);
}
// ------------------------------------------------

const createApp = require('./src/server/app');

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📦 Ambiente: ${nodeEnv}`);
  
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const hasCloudinary = Boolean(cloudName && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

  if (hasCloudinary) {
    console.log(`☁️  Storage ATIVO: Cloudinary (Cloud: ${cloudName})`);
  } else {
    console.log(`⚠️  Storage: LOCAL (Cloudinary nao configurado corretamente)`);
  }
});
