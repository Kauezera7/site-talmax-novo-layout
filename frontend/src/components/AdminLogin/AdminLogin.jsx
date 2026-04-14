import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, User, ShieldCheck } from 'lucide-react';
import { loginAdmin, validateAdminSession } from '../../services/adminAuth';
import { readStoredAdminSessionToken } from '../../services/adminSessionStorage';
import { ADMIN_SESSION_EXPIRED_MESSAGE } from '../../services/adminSessionEvents';
import './AdminLogin.css';

const getRemainingLockSeconds = (lockExpiresAt) => {
  if (!lockExpiresAt) {
    return 0;
  }

  return Math.max(0, Math.ceil((lockExpiresAt - Date.now()) / 1000));
};

const formatCountdown = (totalSeconds) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(() => Boolean(readStoredAdminSessionToken()));
  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [lockRemainingSeconds, setLockRemainingSeconds] = useState(0);

  useEffect(() => {
    if (!lockExpiresAt) {
      setLockRemainingSeconds(0);
      return undefined;
    }

    const updateRemainingTime = () => {
      const remainingSeconds = getRemainingLockSeconds(lockExpiresAt);
      setLockRemainingSeconds(remainingSeconds);

      if (remainingSeconds <= 0) {
        setLockExpiresAt(null);
      }
    };

    updateRemainingTime();
    const intervalId = window.setInterval(updateRemainingTime, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [lockExpiresAt]);

  useEffect(() => {
    if (location.state?.sessionExpired) {
      setError(ADMIN_SESSION_EXPIRED_MESSAGE);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (location.state?.sessionExpired) {
      setIsCheckingSession(false);
      return undefined;
    }

    const hasStoredToken = Boolean(readStoredAdminSessionToken());

    if (!hasStoredToken) {
      setIsCheckingSession(false);
      return undefined;
    }

    let mounted = true;

    validateAdminSession({
      skipWhenNoStoredToken: true,
      timeoutMs: 2500
    })
      .then((result) => {
        if (!mounted) {
          return;
        }

        if (result.authenticated) {
          navigate('/admin/painel', { replace: true });
          return;
        }

        setIsCheckingSession(false);
      })
      .catch(() => {
        if (mounted) {
          setIsCheckingSession(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [location.state, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (lockRemainingSeconds > 0) {
      setError('Muitas tentativas de login.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await loginAdmin(formData);
      setLockExpiresAt(null);
      navigate('/admin/painel');
    } catch (loginError) {
      if (loginError.retryAfterSeconds) {
        setLockExpiresAt(Date.now() + (loginError.retryAfterSeconds * 1000));
      }

      setError(loginError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isLocked = lockRemainingSeconds > 0;
  const displayedError = isLocked
    ? 'Muitas tentativas de login. Tente novamente mais tarde.'
    : error;

  if (isCheckingSession) {
    return <div className="admin-login-page"><div className="admin-login-shell">Carregando...</div></div>;
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-shell">
        <div className="admin-login-brand">
          <span className="admin-login-badge">Painel Administrativo</span>
          <h1>TALMAX ADMIN</h1>
          <p>Acesse o painel com suas credenciais para gerenciar produtos, categorias e banners.</p>
        </div>

        <form className="admin-login-card" onSubmit={handleSubmit}>
          <div className="admin-login-card-header">
            <div className="admin-login-icon">
              <ShieldCheck size={24} />
            </div>
            <h2>Entrar no painel</h2>
          </div>

          <label className="admin-login-field">
            <span>Usuario ou e-mail</span>
            <div className="admin-login-input">
              <User size={18} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Digite seu usuario ou e-mail"
                autoComplete="username"
                disabled={isLoading}
                required
              />
            </div>
          </label>

          <label className="admin-login-field">
            <span>Senha</span>
            <div className="admin-login-input">
              <LockKeyhole size={18} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                disabled={isLoading}
                required
              />
            </div>
          </label>

          {displayedError && <div className="admin-login-error">{displayedError}</div>}

          <button type="submit" className="admin-login-submit" disabled={isLoading || isLocked}>
            {isLoading ? 'Entrando...' : isLocked ? `Aguarde ${formatCountdown(lockRemainingSeconds)}` : 'Acessar painel'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
