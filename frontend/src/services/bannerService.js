import API_URL from './api';
import { createAdminRequestOptions, ensureAdminResponse } from './adminRequest';

export const bannerService = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/banners`, createAdminRequestOptions());
    await ensureAdminResponse(res, 'Erro ao carregar banners');
    return res.json();
  },

  create: async (formData) => {
    const res = await fetch(`${API_URL}/banners`, createAdminRequestOptions({
      method: 'POST',
      body: formData
    }));
    await ensureAdminResponse(res, 'Erro ao criar banner');
    return res.json();
  },

  update: async (id, formData) => {
    const res = await fetch(`${API_URL}/banners/${id}`, createAdminRequestOptions({
      method: 'PUT',
      body: formData
    }));
    await ensureAdminResponse(res, 'Erro ao atualizar banner');
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/banners/${id}`, createAdminRequestOptions({ method: 'DELETE' }));
    await ensureAdminResponse(res, 'Erro ao excluir banner');
    return res.json();
  }
};
