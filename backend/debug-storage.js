#!/usr/bin/env node

/**
 * 🔍 Script de Debug - Mostra qual storage está ativo
 * Rode este script para ver exatamente o que o backend vai usar
 * 
 * Uso: node debug-storage.js
 */

require('dotenv').config();

console.log('\n╔════════════════════════════════════════════╗');
console.log('║     🔍 DEBUG - Verificação de Storage      ║');
console.log('╚════════════════════════════════════════════╝\n');

const nodeEnv = process.env.NODE_ENV;
const cloudinaryName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryKey = process.env.CLOUDINARY_API_KEY;
const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;

console.log('📋 Variáveis Detectadas:');
console.log(`   NODE_ENV: "${nodeEnv}"`);
console.log(`   CLOUDINARY_CLOUD_NAME: "${cloudinaryName}"`);
console.log(`   CLOUDINARY_API_KEY: "${cloudinaryKey ? '✓ Presente' : '✗ Ausente'}"`);
console.log(`   CLOUDINARY_API_SECRET: "${cloudinarySecret ? '✓ Presente' : '✗ Ausente'}"\n`);

// Simula a lógica de hasCloudinaryConfig()
const isProduction = nodeEnv === 'production';
const hasAllCloudinaryCreds = Boolean(cloudinaryName) && Boolean(cloudinaryKey) && Boolean(cloudinarySecret);
const willUseCloudinary = isProduction && hasAllCloudinaryCreds;

console.log('🎯 Decisão de Storage:');
console.log(`   isProduction: ${isProduction ? '✓ SIM' : '✗ NÃO'}`);
console.log(`   hasAllCloudinaryCreds: ${hasAllCloudinaryCreds ? '✓ SIM' : '✗ NÃO'}`);
console.log(`   → Resultado: ${willUseCloudinary ? '☁️  CLOUDINARY' : '📁 LOCAL STORAGE'}\n`);

if (willUseCloudinary) {
  console.log('✅ Backend USARÁ: CLOUDINARY');
  console.log(`   Cloud: ${cloudinaryName}`);
  console.log(`   URLs: https://res.cloudinary.com/${cloudinaryName}/...\n`);
} else {
  console.log('✅ Backend USARÁ: LOCAL STORAGE (/img/)');
  console.log(`   URLs: /img/filename.webp\n`);
  
  if (nodeEnv !== 'production') {
    console.log(`⚠️  NODE_ENV está como "${nodeEnv}" (não é production)`);
    console.log(`   Para usar Cloudinary, defina: NODE_ENV=production\n`);
  } else if (!hasAllCloudinaryCreds) {
    console.log(`⚠️  Credenciais Cloudinary incompletas:`);
    if (!cloudinaryName) console.log(`   ✗ CLOUDINARY_CLOUD_NAME falta`);
    if (!cloudinaryKey) console.log(`   ✗ CLOUDINARY_API_KEY falta`);
    if (!cloudinarySecret) console.log(`   ✗ CLOUDINARY_API_SECRET falta`);
    console.log(`   Adicione-as ao .env\n`);
  }
}

console.log('💡 Se esta informação está errada:');
console.log('   1. Verifique seu .env');
console.log('   2. Rode: node debug-storage.js');
console.log('   3. Compare com o resultado acima\n');
