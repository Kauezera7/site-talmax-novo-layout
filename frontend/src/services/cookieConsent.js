export const COOKIE_CONSENT_STORAGE_KEY = 'cookie-consent';
export const COOKIE_CONSENT_ACCEPTED = 'accepted';
export const COOKIE_CONSENT_REJECTED = 'rejected';

const COOKIE_CONSENT_CHANGED_EVENT = 'talmax-cookie-consent-changed';
const VALID_COOKIE_CONSENT_STATUSES = new Set([
  COOKIE_CONSENT_ACCEPTED,
  COOKIE_CONSENT_REJECTED
]);

const normalizeCookieConsentStatus = (value) => {
  const normalizedValue = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return VALID_COOKIE_CONSENT_STATUSES.has(normalizedValue) ? normalizedValue : '';
};

export const readCookieConsentStatus = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    return normalizeCookieConsentStatus(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
  } catch {
    return '';
  }
};

export const hasCookieConsentStatus = () => Boolean(readCookieConsentStatus());

export const writeCookieConsentStatus = (value) => {
  const normalizedStatus = normalizeCookieConsentStatus(value);

  if (!normalizedStatus || typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, normalizedStatus);
  } catch {
    // Mantem o fluxo funcional mesmo quando o navegador bloqueia o storage.
  }

  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, {
    detail: {
      status: normalizedStatus
    }
  }));
};

export const subscribeToCookieConsentStatus = (callback) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleConsentChange = (event) => {
    callback(normalizeCookieConsentStatus(event?.detail?.status) || readCookieConsentStatus());
  };

  window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);

  return () => {
    window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChange);
  };
};
