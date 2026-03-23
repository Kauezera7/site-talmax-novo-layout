import API_URL from './api';

const parseError = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    return data.error || fallbackMessage;
  } catch (error) {
    return fallbackMessage;
  }
};

export const bannerService = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/banners`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Erro ao carregar banners');
    return res.json();
  },

  create: async (formData) => {
    const res = await fetch(`${API_URL}/banners`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    if (!res.ok) throw new Error(await parseError(res, 'Erro ao criar banner'));
    return res.json();
  },

  update: async (id, formData) => {
    const res = await fetch(`${API_URL}/banners/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    });
    if (!res.ok) throw new Error(await parseError(res, 'Erro ao atualizar banner'));
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/banners/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) throw new Error(await parseError(res, 'Erro ao excluir banner'));
    return res.json();
  }
};
