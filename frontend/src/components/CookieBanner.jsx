import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

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
