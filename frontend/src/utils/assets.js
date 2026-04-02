import API_URL from '../services/api';

export const assetPath = (path = '') => {
  if (!path) return path;
  if (/^(?:[a-z]+:)?\/\//i.test(path)) return path;

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
  if (/^(?:[a-z]+:)?\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const apiOrigin = getApiOrigin();
  const apiBasePath = getApiBasePath();

  if (!apiOrigin) {
    return normalizedPath;
  }

  return `${apiOrigin}${apiBasePath}${normalizedPath}`;
};

export const resolveStoredAssetPath = (path = '') => {
  if (!path) return path;
  if (/^(?:[a-z]+:)?\/\//i.test(path)) return path;

  const normalizedPath = path.replace(/^\/+/, '');

  if (normalizedPath.startsWith('img/')) {
    return assetPath(normalizedPath);
  }

  return apiAssetPath(path);
};
