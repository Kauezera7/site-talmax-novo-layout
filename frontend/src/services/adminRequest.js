import { ADMIN_SESSION_EXPIRED_MESSAGE, dispatchAdminSessionExpired } from './adminSessionEvents';
import {
  clearStoredAdminSessionToken,
  readStoredAdminSessionToken
} from './adminSessionStorage';

const buildAdminHeaders = (headers) => {
  const requestHeaders = new Headers(headers || undefined);
  const sessionToken = readStoredAdminSessionToken();

  if (sessionToken && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${sessionToken}`);
  }

  return requestHeaders;
};

export const createAdminRequestOptions = (options = {}) => {
  const requestOptions = {
    credentials: 'include',
    ...options
  };
  const headers = buildAdminHeaders(options.headers);

  if (Array.from(headers.keys()).length > 0) {
    requestOptions.headers = headers;
  }

  return requestOptions;
};

const parseErrorBody = async (response, fallbackMessage) => {
  try {
    const data = await response.json();

    if (response.status === 401) {
      return ADMIN_SESSION_EXPIRED_MESSAGE;
    }

    return data.error || fallbackMessage;
  } catch (error) {
    return response.status === 401 ? ADMIN_SESSION_EXPIRED_MESSAGE : fallbackMessage;
  }
};

export const ensureAdminResponse = async (response, fallbackMessage) => {
  if (response.ok) {
    return response;
  }

  const errorMessage = await parseErrorBody(response, fallbackMessage);

  if (response.status === 401) {
    clearStoredAdminSessionToken();
    dispatchAdminSessionExpired();
  }

  throw new Error(errorMessage);
};
