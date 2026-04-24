import { COOKIE_CONSENT_ACCEPTED } from './cookieConsent';

const ANALYTICS_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-7K6GMGZT0K').trim();
const ANALYTICS_SCRIPT_ID = 'talmax-google-analytics';
const ANALYTICS_CONFIGURED_FLAG = '__talmaxAnalyticsConfigured';

const buildAnalyticsConsentState = (isEnabled) => ({
  analytics_storage: isEnabled ? 'granted' : 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
});

const getAnalyticsDisableFlagKey = () => `ga-disable-${ANALYTICS_MEASUREMENT_ID}`;

const ensureAnalyticsBootstrap = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  window.dataLayer = window.dataLayer || [];

  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }

  return true;
};

const configureAnalytics = () => {
  if (!ANALYTICS_MEASUREMENT_ID || typeof window === 'undefined' || window[ANALYTICS_CONFIGURED_FLAG]) {
    return false;
  }

  ensureAnalyticsBootstrap();
  window.gtag('js', new Date());
  window.gtag('config', ANALYTICS_MEASUREMENT_ID, {
    anonymize_ip: true
  });
  window[ANALYTICS_CONFIGURED_FLAG] = true;

  return true;
};

const ensureAnalyticsScript = () => {
  if (!ANALYTICS_MEASUREMENT_ID || typeof document === 'undefined') {
    return false;
  }

  ensureAnalyticsBootstrap();

  const existingScript = document.getElementById(ANALYTICS_SCRIPT_ID);

  if (existingScript) {
    if (existingScript.dataset.loaded === 'true') {
      configureAnalytics();
    }

    return true;
  }

  const script = document.createElement('script');
  script.id = ANALYTICS_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ANALYTICS_MEASUREMENT_ID)}`;
  script.addEventListener('load', () => {
    script.dataset.loaded = 'true';
    configureAnalytics();
  }, { once: true });

  document.head.appendChild(script);
  return true;
};

const setAnalyticsEnabled = (isEnabled) => {
  if (!ANALYTICS_MEASUREMENT_ID || typeof window === 'undefined') {
    return false;
  }

  ensureAnalyticsBootstrap();
  window[getAnalyticsDisableFlagKey()] = !isEnabled;

  const consentMode = window[ANALYTICS_CONFIGURED_FLAG] ? 'update' : 'default';
  window.gtag('consent', consentMode, buildAnalyticsConsentState(isEnabled));

  if (isEnabled) {
    ensureAnalyticsScript();
  }

  return true;
};

export const syncAnalyticsWithConsent = ({ consentStatus, enabled }) => {
  if (!ANALYTICS_MEASUREMENT_ID) {
    return false;
  }

  return setAnalyticsEnabled(Boolean(enabled) && consentStatus === COOKIE_CONSENT_ACCEPTED);
};
