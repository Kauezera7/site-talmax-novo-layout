import API_URL from './api';
import { createAdminRequestOptions, ensureAdminResponse } from './adminRequest';

const SUPPORT_API_URL = `${API_URL}/support`;

const supportService = {
  async getContentCards({ includeInactive = false } = {}) {
    const response = await fetch(
      `${SUPPORT_API_URL}/content-cards${includeInactive ? '/admin' : ''}`,
      includeInactive ? createAdminRequestOptions() : undefined
    );

    if (includeInactive) {
      await ensureAdminResponse(response, 'Erro ao buscar cards de suporte');
    } else if (!response.ok) {
      throw new Error('Erro ao buscar cards de suporte');
    }

    return response.json();
  },

  async createContentCard(payload) {
    const response = await fetch(`${SUPPORT_API_URL}/content-cards`, createAdminRequestOptions({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }));

    await ensureAdminResponse(response, 'Erro ao criar card de suporte');
    return response.json();
  },

  async updateContentCard(id, payload) {
    const response = await fetch(`${SUPPORT_API_URL}/content-cards/${id}`, createAdminRequestOptions({
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }));

    await ensureAdminResponse(response, 'Erro ao atualizar card de suporte');
    return response.json();
  },

  async removeContentCard(id) {
    const response = await fetch(`${SUPPORT_API_URL}/content-cards/${id}`, createAdminRequestOptions({
      method: 'DELETE'
    }));

    await ensureAdminResponse(response, 'Erro ao remover card de suporte');
    return response.json();
  }
};

export default supportService;
