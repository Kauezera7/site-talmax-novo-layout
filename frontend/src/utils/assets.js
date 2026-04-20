import API_URL from '../services/api';
import { sanitizeAssetReference } from './contentSafety';

const INLINE_ASSET_PATTERN = /^(?:blob|data):/i;

const normalizeRawPath = (path = '') => sanitizeAssetReference(path, { allowExternal: true, allowRelative: true });

const isCloudinaryPathWithoutProtocol = (path = '') => /^res\.cloudinary\.com\//i.test(path);

const isAbsoluteUrl = (path = '') => /^(?:[a-z]+:)?\/\//i.test(normalizeRawPath(path));

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
  const rawPath = String(path || '').trim();
  if (INLINE_ASSET_PATTERN.test(rawPath)) return rawPath;
  const trimmedPath = normalizeRawPath(path);

  if (!trimmedPath) return '';
  if (isAbsoluteUrl(trimmedPath)) return trimmedPath;

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
  } catch {
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
  } catch {
    return '';
  }
};

export const apiAssetPath = (path = '') => {
  if (!path) return path;
  const rawPath = String(path || '').trim();
  if (INLINE_ASSET_PATTERN.test(rawPath)) return rawPath;
  const trimmedPath = normalizeRawPath(path);

  if (!trimmedPath) return '';
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
