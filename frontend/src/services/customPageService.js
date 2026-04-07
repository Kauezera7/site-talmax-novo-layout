import API_URL from './api';
import { ensureAdminResponse } from './adminRequest';

const customPageService = {
  async getAll() {
    const response = await fetch(`${API_URL}/custom-pages`, {
      credentials: 'include'
    });

    await ensureAdminResponse(response, 'Erro ao buscar páginas personalizadas');
    return response.json();
  },

  async getPublicBySlug(slug) {
    const response = await fetch(`${API_URL}/custom-pages/public/${slug}`);

    if (!response.ok) {
      throw new Error('Página personalizada não encontrada');
    }

    return response.json();
  },

  async create(formData) {
    const response = await fetch(`${API_URL}/custom-pages`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    await ensureAdminResponse(response, 'Erro ao criar página personalizada');
    return response.json();
  },

  async update(id, formData) {
    const response = await fetch(`${API_URL}/custom-pages/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    });

    await ensureAdminResponse(response, 'Erro ao atualizar página personalizada');
    return response.json();
  },

  async remove(id) {
    const response = await fetch(`${API_URL}/custom-pages/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    await ensureAdminResponse(response, 'Erro ao excluir página personalizada');
    return response.json();
  }
};

export default customPageService;
