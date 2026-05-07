import API_URL from './api';
import { createAdminRequestOptions, ensureAdminResponse } from './adminRequest';

const JSON_HEADERS = {
  'Content-Type': 'application/json'
};

const createPayloadRequestOptions = (method, payload) => {
  if (payload instanceof FormData) {
    return createAdminRequestOptions({
      method,
      body: payload
    });
  }

  return createAdminRequestOptions({
    method,
    headers: JSON_HEADERS,
    body: JSON.stringify(payload)
  });
};

const homeContentBlockService = {
  async getAll({ admin = false } = {}) {
    const response = await fetch(
      `${API_URL}/home-content-blocks${admin ? '?admin=1' : ''}`,
      admin ? createAdminRequestOptions() : undefined
    );

    if (admin) {
      await ensureAdminResponse(response, 'Erro ao buscar blocos da home');
    } else if (!response.ok) {
      throw new Error('Erro ao buscar blocos da home');
    }

    return response.json();
  },

  async create(payload) {
    const response = await fetch(`${API_URL}/home-content-blocks`, createPayloadRequestOptions('POST', payload));

    await ensureAdminResponse(response, 'Erro ao criar bloco da home');
    return response.json();
  },

  async update(id, payload) {
    const response = await fetch(`${API_URL}/home-content-blocks/${id}`, createPayloadRequestOptions('PUT', payload));

    await ensureAdminResponse(response, 'Erro ao atualizar bloco da home');
    return response.json();
  },

  async updateActiveStatus(id, active) {
    const response = await fetch(`${API_URL}/home-content-blocks/${id}/active`, createAdminRequestOptions({
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify({ active })
    }));

    await ensureAdminResponse(response, 'Erro ao atualizar status do bloco da home');
    return response.json();
  },

  async remove(id) {
    const response = await fetch(`${API_URL}/home-content-blocks/${id}`, createAdminRequestOptions({
      method: 'DELETE'
    }));

    await ensureAdminResponse(response, 'Erro ao excluir bloco da home');
    return response.json();
  }
};

export default homeContentBlockService;
