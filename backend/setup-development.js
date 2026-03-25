#!/usr/bin/env node

/**
 * 🖥️ Script de Configuração para Desenvolvimento
 * Execute este script para ativar modo de desenvolvimento local
 * 
 * Uso: node setup-development.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envLocalPath = path.join(__dirname, '.env.local');

console.log('🖥️ Configurando para DESENVOLVIMENTO LOCAL...\n');

// Passo 1: Verificar se arquivo .env.local existe
if (!fs.existsSync(envLocalPath)) {
  console.error('❌ ERRO: Arquivo .env.local não encontrado!');
  console.log(`📍 Procurando em: ${envLocalPath}`);
  process.exit(1);
}

// Passo 2: Ler ambos os arquivos
const envContent = fs.readFileSync(envPath, 'utf8');
const envLocalContent = fs.readFileSync(envLocalPath, 'utf8');

// Passo 3: Backup do .env atual
const backupPath = path.join(__dirname, `.env.backup.${Date.now()}`);
fs.writeFileSync(backupPath, envContent, 'utf8');
console.log(`✅ Backup criado: ${backupPath}`);

// Passo 4: Copiar .env.local para .env
fs.writeFileSync(envPath, envLocalContent, 'utf8');
console.log(`✅ .env.local copiado para .env`);

// Passo 5: Mostrar configurações
console.log('\n📋 Configurações ativadas:');
const lines = envLocalContent.split('\n');
lines.forEach(line => {
  if (line.startsWith('NODE_ENV=')) {
    console.log(`   📦 ${line}`);
  } else if (line.startsWith('DB_HOST=')) {
    console.log(`   🗄️  ${line}`);
  } else if (line.startsWith('CORS_ALLOWED_ORIGINS=')) {
    console.log(`   🔒 ${line}`);
  } else if (line.includes('CLOUDINARY') && !line.startsWith('#')) {
    const key = line.split('=')[0];
    console.log(`   ☁️  ${key}=***[OCULTO]`);
  }
});

console.log(`\n✨ Desenvolvimento LOCAL pronto! Próximos passos:`);
console.log(`   1. Reinicie o backend: npm start ou node server.js`);
console.log(`   2. Verifique os logs - deve aparecer "📁 Storage: Local"`);
console.log(`   3. Teste upload de uma imagem`);
console.log(`   4. Verifique se a URL é /img/...\n`);

process.exit(0);

