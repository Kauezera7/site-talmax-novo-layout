import API_URL from '../services/api';

const normalizeRawPath = (path = '') => String(path || '').trim();
const INLINE_IMAGE_PLACEHOLDER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img" aria-label="Talmax">' +
    '<defs>' +
      '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#0f3f75"/>' +
        '<stop offset="100%" stop-color="#1f2937"/>' +
      '</linearGradient>' +
    '</defs>' +
    '<rect width="1200" height="630" fill="url(#bg)"/>' +
    '<circle cx="960" cy="140" r="90" fill="rgba(255,255,255,0.12)"/>' +
    '<circle cx="210" cy="520" r="130" fill="rgba(255,255,255,0.08)"/>' +
    '<text x="80" y="300" fill="#ffffff" font-family="Arial, sans-serif" font-size="84" font-weight="700">Talmax</text>' +
    '<text x="80" y="370" fill="#dbeafe" font-family="Arial, sans-serif" font-size="32">Imagem indisponivel</text>' +
  '</svg>'
)}`;

const isCloudinaryPathWithoutProtocol = (path = '') => /^res\.cloudinary\.com\//i.test(path);

const isAbsoluteUrl = (path = '') => /^(?:[a-z]+:)?\/\//i.test(normalizeRawPath(path));
const isInlineAsset = (path = '') => /^(?:data|blob):/i.test(normalizeRawPath(path));
const isPlaceholderAssetPath = (path = '') => {
  const normalizedPath = normalizeRawPath(path).replace(/^\/+/, '');
  return normalizedPath === 'img/placeholder.png' || normalizedPath === 'img/placeholder.webp';
};

const normalizeApiAssetRelativePath = (path = '') => {
  if (!path) return path;
  const trimmedPath = normalizeRawPath(path);

  if (isAbsoluteUrl(trimmedPath)) return trimmedPath;
  if (isCloudinaryPathWithoutProtocol(trimmedPath)) return `https://${trimmedPath}`;

  const withoutLeadingSlash = trimmedPath.replace(/^\/+/, '');

  if (!withoutLeadingSlash) {
    return '';
  }

  if (withoutLeadingSlash.startsWith('img/')) {
    return `/${withoutLeadingSlash}`;
  }

  if (trimmedPath.startsWith('/')) {
    return trimmedPath;
  }

  if (!withoutLeadingSlash.includes('/')) {
    return `/img/${withoutLeadingSlash}`;
  }

  return `/${withoutLeadingSlash}`;
};

export const assetPath = (path = '') => {
  if (!path) return path;
  const trimmedPath = normalizeRawPath(path);

  if (isAbsoluteUrl(trimmedPath) || isInlineAsset(trimmedPath)) return trimmedPath;
  if (isPlaceholderAssetPath(trimmedPath)) return INLINE_IMAGE_PLACEHOLDER;

  const normalizedPath = trimmedPath.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

const getApiOrigin = () => {
  if (!API_URL) {
    return '';
  }

  try {
    const apiUrl = new URL(API_URL, window.location.origin);
    return apiUrl.origin;
  } catch (error) {
    return '';
  }
};

const getApiBasePath = () => {
  if (!API_URL) {
    return '';
  }

  try {
    const apiUrl = new URL(API_URL, window.location.origin);
    return apiUrl.pathname.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  } catch (error) {
    return '';
  }
};

export const apiAssetPath = (path = '') => {
  if (!path) return path;
  const trimmedPath = normalizeRawPath(path);

  if (isAbsoluteUrl(trimmedPath)) return trimmedPath;

  const normalizedPath = normalizeApiAssetRelativePath(trimmedPath);
  const apiOrigin = getApiOrigin();
  const apiBasePath = getApiBasePath();

  if (!apiOrigin) {
    return normalizedPath;
  }

  return `${apiOrigin}${apiBasePath}${normalizedPath}`;
};

export const resolveStoredAssetPath = (path = '') => {
  if (!path) return path;
  return apiAssetPath(path);
};
