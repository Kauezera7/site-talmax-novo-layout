import API_URL from './api';
import { ensureAdminResponse } from './adminRequest';

export const categoryService = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/categories`, {
      credentials: 'include'
    });
    await ensureAdminResponse(res, 'Erro ao carregar categorias');
    return res.json();
  },

  create: async (formData) => {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    await ensureAdminResponse(res, 'Erro ao criar categoria');
    return res.json();
  },

  update: async (id, formData) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    });
    await ensureAdminResponse(res, 'Erro ao atualizar categoria');
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    await ensureAdminResponse(res, 'Erro ao excluir categoria');
    return res.json();
  }
};
