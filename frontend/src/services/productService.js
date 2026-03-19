import API_URL from './api';

export const productService = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error('Erro ao carregar produtos');
    return res.json();
  },

  getById: async (id) => {
    const res = await fetch(`${API_URL}/products/${id}`);
    if (!res.ok) throw new Error('Erro ao carregar produto');
    return res.json();
  },

  create: async (formData) => {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      body: formData, // FormData para imagens
    });
    if (!res.ok) throw new Error('Erro ao criar produto');
    return res.json();
  },

  update: async (id, formData) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      body: formData, // FormData para imagens
    });
    if (!res.ok) throw new Error('Erro ao atualizar produto');
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao excluir produto');
    return res.json();
  },

  // Métodos para seções especiais
  updateUpcera: async (selectedProducts) => {
    const res = await fetch(`${API_URL}/upcera/products`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_products: selectedProducts }),
    });
    if (!res.ok) throw new Error('Erro ao atualizar produtos Upcera');
    return res.json();
  },

  updateScanners: async (selectedProducts) => {
    const res = await fetch(`${API_URL}/scanners/products`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_products: selectedProducts }),
    });
    if (!res.ok) throw new Error('Erro ao atualizar produtos Scanners');
    return res.json();
  },

  updatePrinters: async (selectedProducts) => {
    const res = await fetch(`${API_URL}/3d-printers/products`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_products: selectedProducts }),
    });
    if (!res.ok) throw new Error('Erro ao atualizar produtos de Impressoras 3D');
    return res.json();
  }
};
