import API_URL from './api';

const parseError = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    return data.error || fallbackMessage;
  } catch (error) {
    return fallbackMessage;
  }
};

export const categoryService = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/categories`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Erro ao carregar categorias');
    return res.json();
  },

  create: async (formData) => {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    if (!res.ok) throw new Error(await parseError(res, 'Erro ao criar categoria'));
    return res.json();
  },

  update: async (id, formData) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    });
    if (!res.ok) throw new Error(await parseError(res, 'Erro ao atualizar categoria'));
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) throw new Error(await parseError(res, 'Erro ao excluir categoria'));
    return res.json();
  }
};
