import API_URL from './api';
import { createAdminRequestOptions, ensureAdminResponse } from './adminRequest';

const customPageService = {
  async getAll() {
    const response = await fetch(`${API_URL}/custom-pages`, createAdminRequestOptions());

    await ensureAdminResponse(response, 'Erro ao buscar paginas personalizadas');
    return response.json();
  },

  async getPublicBySlug(slug) {
    const response = await fetch(`${API_URL}/custom-pages/public/${slug}`);

    if (!response.ok) {
      throw new Error('Pagina personalizada nao encontrada');
    }

    return response.json();
  },

  async create(formData) {
    const response = await fetch(`${API_URL}/custom-pages`, createAdminRequestOptions({
      method: 'POST',
      body: formData
    }));

    await ensureAdminResponse(response, 'Erro ao criar pagina personalizada');
    return response.json();
  },

  async update(id, formData) {
    const response = await fetch(`${API_URL}/custom-pages/${id}`, createAdminRequestOptions({
      method: 'PUT',
      body: formData
    }));

    await ensureAdminResponse(response, 'Erro ao atualizar pagina personalizada');
    return response.json();
  },

  async remove(id) {
    const response = await fetch(`${API_URL}/custom-pages/${id}`, createAdminRequestOptions({ method: 'DELETE' }));

    await ensureAdminResponse(response, 'Erro ao excluir pagina personalizada');
    return response.json();
  }
};

export default customPageService;
