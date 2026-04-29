import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, User, ShieldCheck } from 'lucide-react';
import { loginAdmin } from '../../services/adminAuth';
import { ADMIN_SESSION_EXPIRED_MESSAGE } from '../../services/adminSessionEvents';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state?.sessionExpired) {
      setError(ADMIN_SESSION_EXPIRED_MESSAGE);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError('');
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setIsLoading(true);

    try {
      await loginAdmin(formData);
      window.location.assign('/admin/painel');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsLoading(false);
    }
  };

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

          {error && <div className="admin-login-error">{error}</div>}

          <button type="submit" className="admin-login-submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Acessar painel'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
