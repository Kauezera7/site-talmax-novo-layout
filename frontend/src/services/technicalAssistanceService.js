import API_URL from './api';
import { createAdminRequestOptions, ensureAdminResponse } from './adminRequest';

const TECHNICAL_ASSISTANCE_API_URL = `${API_URL}/technical-assistance`;

const technicalAssistanceService = {
  async getAll() {
    const response = await fetch(TECHNICAL_ASSISTANCE_API_URL);

    if (!response.ok) {
      throw new Error('Erro ao buscar cards da assistencia tecnica');
    }

    return response.json();
  },

  async create(payload) {
    const response = await fetch(TECHNICAL_ASSISTANCE_API_URL, createAdminRequestOptions({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }));

    await ensureAdminResponse(response, 'Erro ao criar card da assistencia tecnica');
    return response.json();
  },

  async update(id, payload) {
    const response = await fetch(`${TECHNICAL_ASSISTANCE_API_URL}/${id}`, createAdminRequestOptions({
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }));

    await ensureAdminResponse(response, 'Erro ao atualizar card da assistencia tecnica');
    return response.json();
  },

  async remove(id) {
    const response = await fetch(`${TECHNICAL_ASSISTANCE_API_URL}/${id}`, createAdminRequestOptions({
      method: 'DELETE'
    }));

    await ensureAdminResponse(response, 'Erro ao remover card da assistencia tecnica');
    return response.json();
  }
};

export default technicalAssistanceService;
