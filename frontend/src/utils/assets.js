export const assetPath = (path = '') => {
  if (!path) return path;
  if (/^(?:[a-z]+:)?\/\//i.test(path)) return path;

  const normalizedPath = path.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};
