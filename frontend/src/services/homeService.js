/**
 * Servico para interagir com a API de servicos/segmentos da home.
 */
import API_URL from './api';
import { ensureAdminResponse } from './adminRequest';

const homeService = {
  async getAll() {
    const response = await fetch(`${API_URL}/home-services`);
    if (!response.ok) {
      throw new Error('Erro ao buscar servicos da home');
    }
    return response.json();
  },

  async create(formData) {
    const response = await fetch(`${API_URL}/home-services`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    await ensureAdminResponse(response, 'Erro ao criar serviço');
    return response.json();
  },

  async update(id, formData) {
    const response = await fetch(`${API_URL}/home-services/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });
    await ensureAdminResponse(response, 'Erro ao atualizar serviço');
    return response.json();
  },

  async updateActiveStatus(id, active) {
    const response = await fetch(`${API_URL}/home-services/${id}/active`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ active }),
    });
    await ensureAdminResponse(response, 'Erro ao atualizar status do serviço');
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_URL}/home-services/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    await ensureAdminResponse(response, 'Erro ao excluir serviço');
    return response.json();
  }
};

export default homeService;
