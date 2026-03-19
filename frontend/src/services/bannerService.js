import API_URL from './api';

export const bannerService = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/banners`);
    if (!res.ok) throw new Error('Erro ao carregar banners');
    return res.json();
  },

  create: async (formData) => {
    const res = await fetch(`${API_URL}/banners`, {
      method: 'POST',
      body: formData, // FormData para imagem
    });
    if (!res.ok) throw new Error('Erro ao criar banner');
    return res.json();
  },

  update: async (id, formData) => {
    const res = await fetch(`${API_URL}/banners/${id}`, {
      method: 'PUT',
      body: formData, // FormData para imagem
    });
    if (!res.ok) throw new Error('Erro ao atualizar banner');
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/banners/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao excluir banner');
    return res.json();
  }
};
