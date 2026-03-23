import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, User, ShieldCheck } from 'lucide-react';
import { loginAdmin, validateAdminSession } from '../../services/adminAuth';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    validateAdminSession()
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
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
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
      navigate('/admin/painel');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsLoading(false);
    }
  };

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
            <span>Usuario</span>
            <div className="admin-login-input">
              <User size={18} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Digite seu usuario"
                autoComplete="username"
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
