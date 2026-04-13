const ADMIN_SESSION_STORAGE_KEY = 'talmax-admin-session-token';

const canUseStorage = () => typeof window !== 'undefined' && !!window.localStorage;

export const readStoredAdminSessionToken = () => {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const token = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    return token ? token.trim() : null;
  } catch (error) {
    return null;
  }
};

export const storeAdminSessionToken = (token) => {
  if (!canUseStorage()) {
    return;
  }

  const normalizedToken = typeof token === 'string' ? token.trim() : '';

  try {
    if (normalizedToken) {
      window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, normalizedToken);
      return;
    }

    window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  } catch (error) {
    // Ignora bloqueios de storage para nao interromper o login.
  }
};

export const clearStoredAdminSessionToken = () => {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  } catch (error) {
    // Mantem o fluxo estavel mesmo em navegadores mais restritivos.
  }
};
