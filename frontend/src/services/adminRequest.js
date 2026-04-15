import { ADMIN_SESSION_EXPIRED_MESSAGE, dispatchAdminSessionExpired } from './adminSessionEvents';

export const createAdminRequestOptions = (options = {}) => {
  const requestOptions = {
    credentials: 'include',
    ...options
  };

  if (options.headers) {
    requestOptions.headers = new Headers(options.headers);
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
  } catch {
    return response.status === 401 ? ADMIN_SESSION_EXPIRED_MESSAGE : fallbackMessage;
  }
};

export const ensureAdminResponse = async (response, fallbackMessage) => {
  if (response.ok) {
    return response;
  }

  const errorMessage = await parseErrorBody(response, fallbackMessage);

  if (response.status === 401) {
    dispatchAdminSessionExpired();
  }

  throw new Error(errorMessage);
};
