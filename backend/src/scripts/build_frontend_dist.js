/**
 * Garante que o backend tenha frontend/dist disponivel no deploy.
 *
 * O Render pode instalar/iniciar apenas o backend. Como o Express serve
 * ../frontend/dist, este script instala as dependencias do frontend e roda
 * o build durante o postinstall do backend.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const backendRoot = path.resolve(__dirname, '../..');
const repoRoot = path.resolve(backendRoot, '..');
const frontendRoot = path.join(repoRoot, 'frontend');
const frontendPackageJson = path.join(frontendRoot, 'package.json');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    ...options
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} falhou com codigo ${result.status}`);
  }
};

const main = () => {
  if (process.env.SKIP_FRONTEND_BUILD === '1') {
    console.log('SKIP_FRONTEND_BUILD=1 definido. Build do frontend ignorado.');
    return;
  }

  if (!fs.existsSync(frontendPackageJson)) {
    console.log('frontend/package.json nao encontrado. Build do frontend ignorado.');
    return;
  }

  console.log('Instalando dependencias do frontend...');
  run(npmCommand, ['install', '--include=dev'], { cwd: frontendRoot });

  console.log('Gerando frontend/dist...');
  run(npmCommand, ['run', 'build'], { cwd: frontendRoot });
};

try {
  main();
} catch (error) {
  console.error(error.message || 'Erro ao gerar frontend/dist.');
  process.exit(1);
}
