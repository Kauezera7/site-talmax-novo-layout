import API_URL from './api';

const parseError = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    return data.error || fallbackMessage;
  } catch (error) {
    return fallbackMessage;
  }
};

export const productService = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/products`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Erro ao carregar produtos');
    return res.json();
  },

  getById: async (id) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Erro ao carregar produto');
    return res.json();
  },

  create: async (formData) => {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    if (!res.ok) throw new Error(await parseError(res, 'Erro ao criar produto'));
    return res.json();
  },

  update: async (id, formData) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    });
    if (!res.ok) throw new Error(await parseError(res, 'Erro ao atualizar produto'));
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) throw new Error(await parseError(res, 'Erro ao excluir produto'));
    return res.json();
  },

  updateUpcera: async (selectedProducts) => {
    const res = await fetch(`${API_URL}/upcera/products`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_products: selectedProducts })
    });
    if (!res.ok) throw new Error(await parseError(res, 'Erro ao atualizar produtos Upcera'));
    return res.json();
  },

  updateScanners: async (selectedProducts) => {
    const res = await fetch(`${API_URL}/scanners/products`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_products: selectedProducts })
    });
    if (!res.ok) throw new Error(await parseError(res, 'Erro ao atualizar produtos Scanners'));
    return res.json();
  },

  updatePrinters: async (selectedProducts) => {
    const res = await fetch(`${API_URL}/3d-printers/products`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_products: selectedProducts })
    });
    if (!res.ok) throw new Error(await parseError(res, 'Erro ao atualizar produtos de Impressoras 3D'));
    return res.json();
  }
};
