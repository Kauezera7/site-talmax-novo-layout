import React, { useEffect, useState } from 'react';
import { KeyRound, Mail, PencilLine, RefreshCw, ShieldCheck, UserCog, Users } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';
import { createAdminUser, listAdminUsers, updateAdminUser } from '../../../services/adminUsers';
import './AdminUsers.css';

const INITIAL_FORM_DATA = {
  full_name: '',
  email: '',
  username: '',
  password: '',
  role: 'editor'
};

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

const normalizeFormPayload = (formData, isEditing) => {
  const payload = {
    full_name: formData.full_name.trim(),
    email: formData.email.trim().toLowerCase(),
    username: formData.username.trim(),
    role: formData.role
  };

  if (formData.password.trim()) {
    payload.password = formData.password.trim();
  } else if (!isEditing) {
    payload.password = '';
  }

  return payload;
};

const AdminUsers = () => {
  const { addToast, isMasterAdmin, refreshSessionUser, sessionUser } = useAdmin();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    setLoadError('');

    try {
      const result = await listAdminUsers();
      setUsers(Array.isArray(result.users) ? result.users : []);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!isMasterAdmin) {
      setIsLoadingUsers(false);
      return;
    }

    loadUsers();
  }, [isMasterAdmin]);

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setEditingUserId(null);
    setFormError('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setFormError('');
    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      username: user.username || '',
      password: '',
      role: user.role || 'editor'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = async () => {
    await loadUsers();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = normalizeFormPayload(formData, Boolean(editingUserId));

    if (!payload.full_name || !payload.email || !payload.username || !payload.role) {
      setFormError('Preencha nome, e-mail, usuario e perfil antes de salvar.');
      return;
    }

    if (!isValidEmail(payload.email)) {
      setFormError('Informe um e-mail corporativo valido para este usuario.');
      return;
    }

    if (!editingUserId && !payload.password) {
      setFormError('Defina uma senha para criar o novo usuario.');
      return;
    }

    if (payload.password && payload.password.length < 6) {
      setFormError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const response = editingUserId
        ? await updateAdminUser(editingUserId, payload)
        : await createAdminUser(payload);

      await loadUsers();

      if (editingUserId && editingUserId === sessionUser?.id) {
        await refreshSessionUser();
      }

      addToast(response.message || 'Usuario salvo com sucesso.', 'success');
      resetForm();
    } catch (error) {
      setFormError(error.message);
      addToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMasterAdmin) {
    return (
      <div className="admin-users">
        <section className="admin-card">
          <div className="card-header">
            <div>
              <h2><ShieldCheck size={20} /> Usuarios do Painel</h2>
              <p>Somente o admin master pode gerenciar os acessos do painel.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <section className="admin-card">
        <div className="card-header admin-users__header">
          <div>
            <h2><UserCog size={20} /> Controle de Usuarios</h2>
            <p>Cadastre o nome do funcionario, e-mail, usuario e senha. Apenas o admin master pode alterar esses acessos.</p>
          </div>
          <button type="button" className="btn-secondary admin-users__refresh" onClick={handleRefresh} disabled={isLoadingUsers}>
            <RefreshCw size={16} />
            Atualizar lista
          </button>
        </div>

        <div className="card-body">
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-section-group">
              <div className="admin-users__grid">
                <div className="form-group">
                  <label htmlFor="admin-user-full-name">Nome do funcionario</label>
                  <input
                    id="admin-user-full-name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Ex.: Kaue"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="admin-user-email">E-mail corporativo</label>
                  <input
                    id="admin-user-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Ex.: ti6@talmax.com.br"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="admin-user-username">Usuario</label>
                  <input
                    id="admin-user-username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Ex.: kaue"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="admin-user-role">Perfil de acesso</label>
                  <select
                    id="admin-user-role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <option value="editor">Editor do painel</option>
                    <option value="master">Admin master</option>
                  </select>
                </div>
              </div>

              <div className="admin-users__grid admin-users__grid--password">
                <div className="form-group">
                  <label htmlFor="admin-user-password">
                    {editingUserId ? 'Nova senha (opcional)' : 'Senha'}
                  </label>
                  <input
                    id="admin-user-password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={editingUserId ? 'Preencha apenas se quiser trocar a senha' : 'Defina a senha inicial'}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="admin-users__tips">
                  <div className="admin-users__tip">
                    <Mail size={16} />
                    <span>O login agora aceita usuario ou e-mail.</span>
                  </div>
                  <div className="admin-users__tip">
                    <KeyRound size={16} />
                    <span>Ao editar, deixe a senha em branco para manter a atual.</span>
                  </div>
                </div>
              </div>

              {formError && <div className="admin-security__feedback is-error">{formError}</div>}

              <div className="admin-users__actions">
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  <UserCog size={18} />
                  {isSubmitting ? 'Salvando...' : editingUserId ? 'Salvar alteracoes' : 'Criar usuario'}
                </button>

                {(editingUserId || formData.full_name || formData.email || formData.username || formData.password) && (
                  <button type="button" className="btn-secondary" onClick={resetForm} disabled={isSubmitting}>
                    Limpar formulario
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="admin-card">
        <div className="card-header">
          <div>
            <h2><Users size={20} /> Acessos cadastrados</h2>
            <p>Lista completa dos usuarios que podem entrar no painel administrativo.</p>
          </div>
        </div>

        <div className="card-body">
          {loadError && <div className="admin-security__feedback is-error">{loadError}</div>}

          {isLoadingUsers ? (
            <p className="admin-users__empty">Carregando usuarios...</p>
          ) : users.length === 0 ? (
            <p className="admin-users__empty">Nenhum usuario admin encontrado.</p>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table admin-users__table">
                <thead>
                  <tr>
                    <th>Funcionario</th>
                    <th>E-mail</th>
                    <th>Usuario</th>
                    <th>Perfil</th>
                    <th>Status</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-users__identity">
                          <strong>{user.full_name || 'Sem nome'}</strong>
                          <span>ID {user.id}</span>
                        </div>
                      </td>
                      <td>{user.email || 'Sem e-mail'}</td>
                      <td>{user.username}</td>
                      <td>
                        <span className={`admin-users__role admin-users__role--${user.role}`}>
                          {user.role === 'master' ? 'Master' : 'Editor'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${Number(user.bloq_user) === 2 ? 'status-inactive' : 'status-active'}`}>
                          {Number(user.bloq_user) === 2 ? 'Bloqueado' : 'Livre'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button type="button" className="btn-secondary admin-users__edit-button" onClick={() => handleEdit(user)}>
                          <PencilLine size={16} />
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminUsers;
