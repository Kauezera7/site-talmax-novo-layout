import API_URL from '../services/api';

const isAbsoluteUrl = (path = '') => /^(?:[a-z]+:)?\/\//i.test(path);

const normalizeApiAssetRelativePath = (path = '') => {
  if (!path) return path;
  if (isAbsoluteUrl(path)) return path;

  const trimmedPath = String(path).trim();
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
  if (isAbsoluteUrl(path)) return path;

  const normalizedPath = path.replace(/^\/+/, '');
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
  if (isAbsoluteUrl(path)) return path;

  const normalizedPath = normalizeApiAssetRelativePath(path);
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
