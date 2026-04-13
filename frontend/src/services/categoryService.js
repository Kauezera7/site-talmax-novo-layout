import API_URL from './api';
import { createAdminRequestOptions, ensureAdminResponse } from './adminRequest';

export const categoryService = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/categories`, createAdminRequestOptions());
    await ensureAdminResponse(res, 'Erro ao carregar categorias');
    return res.json();
  },

  create: async (formData) => {
    const res = await fetch(`${API_URL}/categories`, createAdminRequestOptions({
      method: 'POST',
      body: formData
    }));
    await ensureAdminResponse(res, 'Erro ao criar categoria');
    return res.json();
  },

  update: async (id, formData) => {
    const res = await fetch(`${API_URL}/categories/${id}`, createAdminRequestOptions({
      method: 'PUT',
      body: formData
    }));
    await ensureAdminResponse(res, 'Erro ao atualizar categoria');
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/categories/${id}`, createAdminRequestOptions({ method: 'DELETE' }));
    await ensureAdminResponse(res, 'Erro ao excluir categoria');
    return res.json();
  }
};
