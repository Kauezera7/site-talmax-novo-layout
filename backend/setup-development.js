#!/usr/bin/env node

/**
 * 🖥️ Script de Configuração para Desenvolvimento
 * Execute este script para voltar ao modo de desenvolvimento local
 * 
 * Uso: node setup-development.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envDevPath = path.join(__dirname, '.env.development');

console.log('🖥️ Configurando para DESENVOLVIMENTO...\n');

// Passo 1: Verificar se arquivo .env.development existe
if (!fs.existsSync(envDevPath)) {
  console.error('❌ ERRO: Arquivo .env.development não encontrado!');
  console.log(`📍 Procurando em: ${envDevPath}`);
  process.exit(1);
}

// Passo 2: Ler ambos os arquivos
const envContent = fs.readFileSync(envPath, 'utf8');
const envDevContent = fs.readFileSync(envDevPath, 'utf8');

// Passo 3: Backup do .env atual
const backupPath = path.join(__dirname, `.env.backup.${Date.now()}`);
fs.writeFileSync(backupPath, envContent, 'utf8');
console.log(`✅ Backup criado: ${backupPath}`);

// Passo 4: Copiar .env.development para .env
fs.writeFileSync(envPath, envDevContent, 'utf8');
console.log(`✅ .env.development copiado para .env`);

// Passo 5: Mostrar configurações
console.log('\n📋 Configurações ativadas:');
const lines = envDevContent.split('\n');
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

console.log(`\n✨ Desenvolvimento pronto! Próximos passos:`);
console.log(`   1. Reinicie o backend: npm start ou node server.js`);
console.log(`   2. Verifique os logs - deve aparecer "📁 Storage: Local"`);
console.log(`   3. Teste upload de uma imagem`);
console.log(`   4. Verifique se a URL é /img/...\n`);

process.exit(0);
