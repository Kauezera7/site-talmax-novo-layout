/**
 * Componente: CookieBanner
 * Uso: componente global do site publico
 * Responsabilidade: exibir e registrar o consentimento de cookies
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CookieBanner.css';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      return !window.localStorage.getItem('cookie-consent');
    } catch {
      return true;
    }
  });

  const handleConsent = (status) => {
    localStorage.setItem('cookie-consent', status);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-content">
        <h3>Privacidade e Cookies</h3>
        <p>
          Este site utiliza cookies para melhorar sua experiência. Ao continuar navegando, 
          você concorda com nossa <Link to="/privacidade">Política de Privacidade</Link>.
        </p>
      </div>
      <div className="cookie-banner-actions">
        <button className="btn-cookie btn-accept" onClick={() => handleConsent('accepted')}>
          Aceitar
        </button>
        <button className="btn-cookie btn-reject" onClick={() => handleConsent('rejected')}>
          Recusar
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
