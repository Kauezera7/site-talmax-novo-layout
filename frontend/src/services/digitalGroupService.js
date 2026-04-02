import API_URL from './api';
import { ensureAdminResponse } from './adminRequest';

const digitalGroupService = {
  async getAll({ admin = false } = {}) {
    const response = await fetch(`${API_URL}/digital-groups${admin ? '?admin=1' : ''}`, {
      credentials: admin ? 'include' : 'same-origin'
    });

    if (admin) {
      await ensureAdminResponse(response, 'Erro ao buscar grupos digitais');
    } else if (!response.ok) {
      throw new Error('Erro ao buscar grupos digitais');
    }

    return response.json();
  },

  async getPublicById(id) {
    const response = await fetch(`${API_URL}/digital-groups/public/${id}`);

    if (!response.ok) {
      throw new Error('Grupo digital nao encontrado');
    }

    return response.json();
  },

  async create(formData) {
    const response = await fetch(`${API_URL}/digital-groups`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    await ensureAdminResponse(response, 'Erro ao criar grupo digital');
    return response.json();
  },

  async update(id, formData) {
    const response = await fetch(`${API_URL}/digital-groups/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    });

    await ensureAdminResponse(response, 'Erro ao atualizar grupo digital');
    return response.json();
  },

  async remove(id) {
    const response = await fetch(`${API_URL}/digital-groups/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    await ensureAdminResponse(response, 'Erro ao remover grupo digital');
    return response.json();
  }
};

export default digitalGroupService;
