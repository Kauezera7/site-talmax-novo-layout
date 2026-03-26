const ADMIN_SESSION_EXPIRED_EVENT = 'talmax-admin-session-expired';
export const ADMIN_SESSION_EXPIRED_MESSAGE = 'Sua sessao expirou. Entre novamente para continuar no painel.';

export const dispatchAdminSessionExpired = () => {
  window.dispatchEvent(new CustomEvent(ADMIN_SESSION_EXPIRED_EVENT));
};

export const subscribeToAdminSessionExpired = (callback) => {
  window.addEventListener(ADMIN_SESSION_EXPIRED_EVENT, callback);

  return () => {
    window.removeEventListener(ADMIN_SESSION_EXPIRED_EVENT, callback);
  };
};
