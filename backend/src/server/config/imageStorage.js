const fs = require('fs');
const path = require('path');

const EXTERNAL_ASSET_PATTERN = /^(?:[a-z]+:)?\/\//i;
const INLINE_ASSET_PATTERN = /^(?:data|blob):/i;

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

const getUploadTempDir = () => {
  const configuredTempDir = process.env.UPLOAD_TMP_DIR && process.env.UPLOAD_TMP_DIR.trim();

  if (configuredTempDir) {
    return path.resolve(configuredTempDir);
  }

  return path.resolve(__dirname, '../../../storage/tmp-uploads');
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
const ensureUploadTempDir = () => ensureDirectory(getUploadTempDir());

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

const normalizeServedImageRelativePath = (assetUrl) => {
  if (typeof assetUrl !== 'string') {
    return null;
  }

  const trimmedAssetUrl = assetUrl.trim();

  if (!trimmedAssetUrl || EXTERNAL_ASSET_PATTERN.test(trimmedAssetUrl) || INLINE_ASSET_PATTERN.test(trimmedAssetUrl)) {
    return null;
  }

  const withoutLeadingSlash = trimmedAssetUrl.replace(/^\/+/, '');
  const relativePath = withoutLeadingSlash.startsWith('img/')
    ? withoutLeadingSlash.slice(4)
    : withoutLeadingSlash;

  if (!relativePath) {
    return null;
  }

  const pathSegments = relativePath.split(/[\\/]+/).filter(Boolean);

  if (pathSegments.length === 0 || pathSegments.includes('..')) {
    return null;
  }

  return pathSegments.join(path.sep);
};

const resolveServedImagePath = (assetUrl) => {
  const relativePath = normalizeServedImageRelativePath(assetUrl);

  if (!relativePath) {
    return null;
  }

  for (const directoryPath of getServedImageDirs()) {
    const resolvedDirectoryPath = path.resolve(directoryPath);
    const candidatePath = path.resolve(resolvedDirectoryPath, relativePath);

    if (!candidatePath.startsWith(`${resolvedDirectoryPath}${path.sep}`)) {
      continue;
    }

    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  return null;
};

const hasServedImage = (assetUrl) => Boolean(resolveServedImagePath(assetUrl));

const sanitizeServedImageUrl = (assetUrl) => {
  if (typeof assetUrl !== 'string') {
    return null;
  }

  const trimmedAssetUrl = assetUrl.trim();

  if (!trimmedAssetUrl) {
    return null;
  }

  if (EXTERNAL_ASSET_PATTERN.test(trimmedAssetUrl) || INLINE_ASSET_PATTERN.test(trimmedAssetUrl)) {
    return trimmedAssetUrl;
  }

  return hasServedImage(trimmedAssetUrl) ? trimmedAssetUrl : null;
};

module.exports = {
  ensurePrimaryImageDir,
  ensureUploadTempDir,
  getPrimaryImageDir,
  getUploadTempDir,
  getServedImageDirs,
  hasServedImage,
  resolveServedImagePath,
  sanitizeServedImageUrl
};
