const resolveDevelopmentApiUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000/api';
  }

  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  const currentHostname = window.location.hostname || 'localhost';
  const apiHostname = currentHostname === '0.0.0.0' ? 'localhost' : currentHostname;

  return `${protocol}//${apiHostname}:5000/api`;
};

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? resolveDevelopmentApiUrl() : '/api');

export default API_URL;
