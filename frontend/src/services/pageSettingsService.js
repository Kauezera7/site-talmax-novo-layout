import API_URL from './api';
import { createAdminRequestOptions, ensureAdminResponse } from './adminRequest';

export const DEFAULT_SPECIAL_PAGE_SETTINGS = {
  'talmax-digital': {
    page_name: 'talmax-digital',
    label: 'Talmax Digital',
    overline: 'TECNOLOGIA ODONTOLOGICA',
    title: 'Talmax Digital',
    description: 'O futuro da protese dentaria com tecnologia de ponta e precisao absoluta.',
    logo_url: '/img/logo-talmax-digital-pos.png'
  },
  upcera: {
    page_name: 'upcera',
    label: 'Upcera',
    overline: '',
    title: 'Innovation in Restorative Dentistry',
    description: 'Lider mundial em ceramicas odontologicas de alta performance, unindo estetica natural e resistencia extrema.',
    logo_url: '/img/logo-upcera-.webp'
  },
  scanners: {
    page_name: 'scanners',
    label: 'Scanners',
    overline: '',
    title: 'Digital Reality Capture',
    description: 'A mais alta tecnologia em digitalizacao 3D, transformando o fluxo fisico em digital com precisao absoluta.',
    logo_url: '/img/titulo-pag-scanners.png'
  },
  printers: {
    page_name: 'printers',
    label: 'Impressoras 3D',
    overline: '',
    title: 'High Precision Printing',
    description: 'A revolucao da manufatura aditiva com precisao industrial para o fluxo digital odontologico.',
    logo_url: '/img/impressoras3d.png'
  },
  'assistencia-tecnica': {
    page_name: 'assistencia-tecnica',
    label: 'Assistencia Tecnica',
    overline: '',
    title: 'Assistencia Tecnica',
    description: 'Confianca em cada servico,\ncom pecas originais e\nalto padrao de qualidade.',
    logo_url: '',
    banner_url: '/img/assistenciatecnica-2.jpg.webp',
    hero_tagline: 'Confianca em cada servico, com pecas originais e alto padrao de qualidade.',
    card_title: 'Assistencia Tecnica',
    card_description: 'Um time altamente especializado em qualidade, pronto para entregar rapidez, precisao e seguranca na manutencao dos seus equipamentos.',
    card_description_secondary: 'Trabalhamos para reduzir o tempo de parada e garantir o maximo desempenho, levando mais confianca e excelencia a cada atendimento.',
    card_button_label: 'Abrir chamado',
    card_url: 'https://talmax.tomticket.com/'
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
      throw new Error('Erro ao buscar configuracoes das paginas especiais');
    }

    return response.json();
  },

  async update(pageName, formData) {
    const response = await fetch(`${API_URL}/page-settings/${pageName}`, createAdminRequestOptions({
      method: 'PUT',
      body: formData
    }));

    await ensureAdminResponse(response, 'Erro ao atualizar configuracao da pagina especial');
    return response.json();
  }
};

export default pageSettingsService;
