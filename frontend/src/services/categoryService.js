import API_URL from './api';

export const categoryService = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/categories`);
    if (!res.ok) throw new Error('Erro ao carregar categorias');
    return res.json();
  },

  create: async (formData) => {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      body: formData, // FormData para ícone
    });
    if (!res.ok) throw new Error('Erro ao criar categoria');
    return res.json();
  },

  update: async (id, formData) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      body: formData, // FormData para ícone
    });
    if (!res.ok) throw new Error('Erro ao atualizar categoria');
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao excluir categoria');
    return res.json();
  }
};
