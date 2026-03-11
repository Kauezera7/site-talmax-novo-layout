export const products = [
  {
    id: 1,
    name: 'Dura Rock',
    category: 'Gesso e Troquelização',
    description: 'Gesso Tipo IV com expansão controlada (0,09%) e elevada resistência à compressão (18,000 Psi). Ideal para trabalhos cerâmicos, inlays, onlays, PPR e prótese sobre implante.',
    features: [
      'Expansão controlada (0,09%)',
      'Resistência de 18,000 Psi',
      'Cores: azul e marfim',
      'Embalagens: 3kg e 25kg'
    ],
    image: '/img/CTLG-GESSP-TROQUELIZAÇÃO.webp',
    models: [
      { color: 'Azul', code3kg: '20173', code25kg: '20164' },
      { color: 'Marfim', code3kg: '20171', code25kg: '20168' }
    ]
  },
  {
    id: 2,
    name: 'Silicone Master',
    category: 'Duplicadores',
    description: 'Indicado para duplicação de inlays/onlays e PPR. Oferece alta estabilidade dimensional.',
    features: [
      'Contração de 0,2% após 7 dias',
      'Embalagem: 1kg + catalisador de 60ml',
      'Código: 20115 (Silicone) / 20116 (Catalisador)'
    ],
    image: '/img/CTLG-DUPLICADORES-Silicone.webp'
  },
  {
    id: 3,
    name: 'Ceras Flex - Grampos Pré-Formados',
    category: 'Ceras',
    description: 'Formato ideal para a confecção de grampos de precisão em PPR.',
    features: [
      'Modelos: molares, pré-molares, retos e roach',
      'Embalagem com 10 peças'
    ],
    image: '/img/CTLG-CERAS-Flex-Grampos.webp',
    images: [
      '/img/CTLG-CERAS-Flex-Grampos.webp',
      '/img/CTLG01-CERAS-Flex-Grampos1.webp'
    ],
    models: [
      { type: 'Molares', code: '5013' },
      { type: 'Pré-Molares', code: '5014' },
      { type: 'Retos', code: '5011' },
      { type: 'Roach', code: '5012' }
    ]
  },
  {
    id: 4,
    name: 'Revestimento Micro Fit',
    category: 'Revestimentos',
    description: 'Revestimento extrafino com riqueza de detalhes e superfície lisa. Resistente à expansão de ceras e resinas.',
    features: [
      'Tempo de trabalho: 12 minutos',
      'Fácil desinclusão',
      'Uso seguro no método rápido (900ºC)',
      'Livre de carbono'
    ],
    image: '/img/CTLG-REVESTIMENTOS.webp',
    models: [
      { pack: '9 pacotes de 100g', code: '20286' },
      { pack: '45 pacotes de 100g', code: '20287' }
    ]
  },
  {
    id: 5,
    name: 'Cerâmica de Reparo',
    category: 'Zirkon Ice',
    description: 'Para reparo do coping de zircônia. Pote com 20g.',
    image: '/img/CTLG-ZIRKON-ICE.webp',
    models: [
      { type: 'REPAIR 1', code: '1286' },
      { type: 'REPAIR 2', code: '1268' }
    ]
  },
  {
    id: 6,
    name: 'Fit Cast-2',
    category: 'Ligas Metálicas',
    description: 'Ni-Cr sem Berílio e com Nióbio. Maior controle de oxidação e excelente aderência da cerâmica.',
    features: [
      'CET 14,1 (25 °C – 500 °C)',
      'Caixa com 250g',
      'Código: 4225'
    ],
    image: '/img/CTLG-LIGAS-METALICAS.webp'
  },
  {
    id: 7,
    name: 'Mini Maçarico',
    category: 'Soldas',
    description: 'Funcionamento a gás até 1300 ºC. Ideal para soldas de baixa fusão e ortodontia.',
    features: [
      'Regulagem de chama',
      'Acendedor automático',
      'Leve e portátil',
      'Código: 545'
    ],
    image: '/img/CTLG-SOLDAS.webp'
  },
  {
    id: 8,
    name: 'Pedras Ninja para Metal',
    category: 'Corte e Acabamento',
    description: 'Pedras microgranuladas à base de óxido de alumínio (Branca e Rosa). Evita contaminação da liga.',
    features: [
      'Modelos: W 2, W 6, W 9, W 10, W 12, P 2, P 6, P 9, P 10 e P 12',
      'Caixa com 10 unidades'
    ],
    image: '/img/CTLG-CORTE-E-ACABAMENTO.webp',
    models: [
      { type: 'W 2', code: '19120' }, { type: 'W 6', code: '19122' },
      { type: 'W 9', code: '19123' }, { type: 'W 10', code: '19124' },
      { type: 'W 12', code: '19125' }, { type: 'P 2', code: '19200' },
      { type: 'P 6', code: '19203' }, { type: 'P 9', code: '19204' },
      { type: 'P 10', code: '19201' }, { type: 'P 12', code: '19202' }
    ]
  },
  {
    id: 9,
    name: 'Microscópio Focus – Z10',
    category: 'Microscópio e Lupa',
    description: 'Aumento de 10x com braço móvel. Ideal para avaliação de moldagens e delimitação de preparos.',
    features: [
      'Braço móvel',
      'Lâmina de vidro protetora',
      'Código: 4200'
    ],
    techInfo: { height: '41cm', base: '14,5cm', weight: '3,7kg' },
    image: '/img/CTLG-MICROSCÓPIO-E-LUPA.webp'
  },
  {
    id: 10,
    name: 'Marathon Handy 702',
    category: 'Equipamentos',
    description: 'Micromotor de alta performance com 45.000 rpm e display digital.',
    features: [
      'Potência: 100W / Torque: 4.5N',
      'Caneta com rolamentos blindados',
      'Pedal com controle automático',
      'Garantia de 6 meses'
    ],
    techInfo: { height: '18cm', width: '13,7cm', depth: '23,2cm', weight: '3,3kg' },
    image: '/img/CTLG-EQUIPAMENTOS.webp',
    models: [
      { type: '110V', code: '3024' },
      { type: '220V', code: '3311' }
    ]
  },
  {
    id: 11,
    name: 'Pincel Kolinsky Diamond Class',
    category: 'Acessórios para Cerâmica',
    description: '100% pêlo de Marta. Cerdas especiais com mínima retenção de partículas cerâmicas.',
    features: [
      'Cabo acoplado para durabilidade',
      'Disponível em Nº08 e Nº10'
    ],
    image: '/img/CTLG-ACESSORIOS-PARA-CERAMICA.webp',
    models: [
      { type: 'Nº08', code: '9141' },
      { type: 'Nº10', code: '9142' }
    ]
  },
  {
    id: 12,
    name: 'T-Lithium CAD',
    category: 'T-Lithium',
    description: 'Dissilicato de Lítio – 400MPa. Cristalização em qualquer forno de cerâmica.',
    features: [
      'Restaurações em até 90 minutos',
      'Baixa dureza para fresagem',
      'Blocos BL com alta fluorescência',
      'Caixa com 5 blocks'
    ],
    image: '/img/CTLG-T-LITHIUM.webp'
  },
  {
    id: 13,
    name: 'Frizadora Talmax Digital',
    category: 'Talmax Digital',
    description: 'Equipamento de alta precisão para fresagem e acabamento de próteses digitais.',
    features: [
      'Alta precisão de corte',
      'Compatível com sistemas CAD/CAM',
      'Design ergonômico',
      'Fácil operação'
    ],
    image: '/img/CTLG-FRIZADORA-TALMAX-DIGITAL.webp'
  }
];
