import API_URL from './api';
import { ensureAdminResponse } from './adminRequest';

export const DEFAULT_SPECIAL_PAGE_SETTINGS = {
  'talmax-digital': {
    page_name: 'talmax-digital',
    label: 'Talmax Digital',
    overline: 'TECNOLOGIA ODONTOLÓGICA',
    title: 'Talmax Digital',
    description: 'O futuro da prótese dentária com tecnologia de ponta e precisão absoluta.',
    logo_url: '/img/logo-talmax-digital-pos.png'
  },
  upcera: {
    page_name: 'upcera',
    label: 'Upcera',
    overline: '',
    title: 'Innovation in Restorative Dentistry',
    description: 'Líder mundial em cerâmicas odontológicas de alta performance, unindo estética natural e resistência extrema.',
    logo_url: '/img/logo-upcera-.webp'
  },
  scanners: {
    page_name: 'scanners',
    label: 'Scanners',
    overline: '',
    title: 'Digital Reality Capture',
    description: 'A mais alta tecnologia em digitalização 3D, transformando o fluxo físico em digital com precisão absoluta.',
    logo_url: '/img/titulo-pag-scanners.png'
  },
  printers: {
    page_name: 'printers',
    label: 'Impressoras 3D',
    overline: '',
    title: 'High Precision Printing',
    description: 'A revolução da manufatura aditiva com precisão industrial para o fluxo digital odontológico.',
    logo_url: '/img/impressoras3d.png'
  }
};

export const normalizeSpecialPageSettings = (items = []) => {
  const normalizedMap = { ...DEFAULT_SPECIAL_PAGE_SETTINGS };

  if (Array.isArray(items)) {
    items.forEach((item) => {
      if (!item?.page_name || !normalizedMap[item.page_name]) {
        return;
      }

      normalizedMap[item.page_name] = {
        ...normalizedMap[item.page_name],
        ...item
      };
    });
  }

  return normalizedMap;
};

const pageSettingsService = {
  async getAll() {
    const response = await fetch(`${API_URL}/page-settings`);
    if (!response.ok) {
      throw new Error('Erro ao buscar configurações das páginas especiais');
    }

    return response.json();
  },

  async update(pageName, formData) {
    const response = await fetch(`${API_URL}/page-settings/${pageName}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    });

    await ensureAdminResponse(response, 'Erro ao atualizar configuração da página especial');
    return response.json();
  }
};

export default pageSettingsService;
