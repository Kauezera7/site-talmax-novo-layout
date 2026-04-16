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

    if (Array.isArray(data.details) && data.details.length > 0) {
      const firstDetail = data.details.find((detail) => detail?.message) || data.details[0];
      const fieldLabel = firstDetail?.field ? `${firstDetail.field}: ` : '';
      return `${fieldLabel}${firstDetail?.message || data.error || fallbackMessage}`;
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
