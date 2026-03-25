
#!/usr/bin/env node

/**
 * 🚀 Script de Deploy para Produção
 * Execute este script no servidor de produção para ativar Cloudinary
 * 
 * Uso: node deploy-production.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envProdPath = path.join(__dirname, '.env.production');

console.log('🚀 Iniciando deploy para PRODUÇÃO...\n');

// Passo 1: Verificar se arquivo .env.production existe
if (!fs.existsSync(envProdPath)) {
  console.error('❌ ERRO: Arquivo .env.production não encontrado!');
  console.log(`📍 Procurando em: ${envProdPath}`);
  console.log('\n💡 Dica: Se está em produção, copie as credenciais para .env manualmente');
  process.exit(1);
}

// Passo 2: Ler ambos os arquivos
const envContent = fs.readFileSync(envPath, 'utf8');
const envProdContent = fs.readFileSync(envProdPath, 'utf8');

// Passo 3: Backup do .env atual
const backupPath = path.join(__dirname, `.env.backup.${Date.now()}`);
fs.writeFileSync(backupPath, envContent, 'utf8');
console.log(`✅ Backup criado: ${backupPath}`);

// Passo 4: Copiar .env.production para .env
fs.writeFileSync(envPath, envProdContent, 'utf8');
console.log(`✅ .env.production copiado para .env`);

// Passo 5: Mostrar configurações
console.log('\n📋 Configurações ativadas:');
const lines = envProdContent.split('\n');
lines.forEach(line => {
  if (line.startsWith('NODE_ENV=')) {
    console.log(`   📦 ${line}`);
  } else if (line.startsWith('CLOUDINARY_')) {
    const key = line.split('=')[0];
    console.log(`   ☁️  ${key}=***[OCULTO]`);
  } else if (line.startsWith('DB_HOST=')) {
    console.log(`   🗄️  ${line}`);
  } else if (line.startsWith('CORS_ALLOWED_ORIGINS=')) {
    console.log(`   🔒 CORS configurado para produção`);
  }
});

console.log(`\n✨ Deploy pronto! Próximos passos:`);
console.log(`   1. Reinicie o backend: npm start`);
console.log(`   2. Verifique os logs - deve aparecer "☁️  Storage: Cloudinary"`);
console.log(`   3. Teste upload de uma imagem`);
console.log(`   4. Verifique se a URL é do Cloudinary\n`);

process.exit(0);
