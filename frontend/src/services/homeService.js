/**
 * Servico para interagir com a API de servicos/segmentos da home.
 */
import API_URL from './api';
import { createAdminRequestOptions, ensureAdminResponse } from './adminRequest';

const homeService = {
  async getAll({ admin = false } = {}) {
    const response = await fetch(
      `${API_URL}/home-services${admin ? '?admin=1' : ''}`,
      admin ? createAdminRequestOptions() : undefined
    );

    if (admin) {
      await ensureAdminResponse(response, 'Erro ao buscar servicos da home');
    } else if (!response.ok) {
      throw new Error('Erro ao buscar servicos da home');
    }

    return response.json();
  },

  async create(formData) {
    const response = await fetch(`${API_URL}/home-services`, createAdminRequestOptions({
      method: 'POST',
      body: formData
    }));
    await ensureAdminResponse(response, 'Erro ao criar servico');
    return response.json();
  },

  async update(id, formData) {
    const response = await fetch(`${API_URL}/home-services/${id}`, createAdminRequestOptions({
      method: 'PUT',
      body: formData
    }));
    await ensureAdminResponse(response, 'Erro ao atualizar servico');
    return response.json();
  },

  async updateActiveStatus(id, active) {
    const response = await fetch(`${API_URL}/home-services/${id}/active`, createAdminRequestOptions({
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ active }),
    }));
    await ensureAdminResponse(response, 'Erro ao atualizar status do servico');
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_URL}/home-services/${id}`, createAdminRequestOptions({
      method: 'DELETE',
    }));
    await ensureAdminResponse(response, 'Erro ao excluir servico');
    return response.json();
  }
};

export default homeService;
