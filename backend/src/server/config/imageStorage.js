const fs = require('fs');
const path = require('path');

// Observacao:
// `frontend/public/img` fica reservado para assets estaticos do projeto.
// Uploads feitos pelo painel devem ir para uma pasta propria do backend,
// para que a API possa salvar arquivos sem depender do frontend.
const getPrimaryImageDir = () => {
  const configuredDir = process.env.UPLOAD_DIR && process.env.UPLOAD_DIR.trim();

  if (configuredDir) {
    return path.resolve(configuredDir);
  }

  // Em desenvolvimento local, usamos uma pasta dentro do backend.
  // Em producao, o ideal e apontar `UPLOAD_DIR` para um disco persistente.
  return path.resolve(__dirname, '../../../storage/img');
};

// Mantemos a pasta legada do frontend apenas para continuar servindo
// imagens antigas que ja foram publicadas/salvas antes da mudanca.
const getLegacyFrontendImageDir = () => path.resolve(__dirname, '../../../../frontend/public/img');
const getBuiltFrontendImageDir = () => path.resolve(__dirname, '../../../../frontend/dist/img');

const ensureDirectory = (directoryPath) => {
  fs.mkdirSync(directoryPath, { recursive: true });
  return directoryPath;
};

const ensurePrimaryImageDir = () => ensureDirectory(getPrimaryImageDir());

const getServedImageDirs = () => {
  // A API responde `/img/...` procurando primeiro nas imagens novas
  // do backend e depois na pasta legada do frontend.
  const imageDirectories = [
    ensurePrimaryImageDir(),
    getBuiltFrontendImageDir(),
    getLegacyFrontendImageDir()
  ];

  return Array.from(new Set(imageDirectories));
};

module.exports = {
  ensurePrimaryImageDir,
  getPrimaryImageDir,
  getServedImageDirs
};
