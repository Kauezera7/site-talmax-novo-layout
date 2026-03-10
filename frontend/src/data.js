/**
 * CATEGORIAS: Lista de cards exibidos abaixo do banner.
 * Cada categoria tem um ID, Nome, Ícone (da biblioteca lucide-react) e uma cor de fundo (bg).
 */
export const categories = [
  { id: 1, name: 'Gesso e Troquelização', icon: 'Box', bg: '#f4f4f4' },
  { id: 2, name: 'Duplicadores', icon: 'Layers', bg: '#eef2f3' },
  { id: 3, name: 'Ceras', icon: 'Droplets', bg: '#f9f9f9' },
  { id: 4, name: 'Revestimentos', icon: 'Shield', bg: '#f0f4f8' },
  { id: 5, name: 'Zirkon Ice', icon: 'Snowflake', bg: '#e0f7fa' },
  { id: 6, name: 'Ligas Metálicas', icon: 'Zap', bg: '#eceff1' },
  { id: 7, name: 'Soldas', icon: 'Hammer', bg: '#fafafa' },
  { id: 8, name: 'Corte e Acabamento', icon: 'Scissors', bg: '#f5f5f5' },
  { id: 9, name: 'Microscópio e Lupa', icon: 'Search', bg: '#f1f8e9' },
  { id: 10, name: 'Equipamentos', icon: 'Monitor', bg: '#e3f2fd' },
  { id: 11, name: 'Acessórios para Cerâmica', icon: 'Palette', bg: '#fff3e0' },
  { id: 12, name: 'T-Lithium', icon: 'Battery', bg: '#e8eaf6' },
];

/**
 * SLIDES (BANNERS): Lista de imagens que aparecem no slider principal.
 * Para adicionar um novo banner:
 * 1. Coloque a imagem em /public/img/
 * 2. Adicione um novo objeto {} abaixo com o caminho da imagem.
 */
export const slides = [
  {
    id: 1,
    title: 'B42 - Fresadora de Precisão',
    image: '/img/BANNER_B42.webp',
  },
  {
    id: 2,
    title: 'A53 - Performance e Agilidade',
    image: '/img/BANNER-A53.webp',
  },
  {
    id: 3,
    title: 'Aoralscan 3',
    image: '/img/BANNER-AORALSCAN-3.webp',
  },
  {
    id: 4,
    title: 'Sistema Ceramotion',
    image: '/img/BANNER-CERAMOTION.webp',
  },
  {
    id: 5,
    title: 'MicroFit',
    image: '/img/BANNER-microFit.webp',
  },
  {
    id: 6,
    title: 'Atendimento via Chatbot',
    image: '/img/BANNERchat_bot.webp',
  },
  {
    id: 7,
    title: 'Suporte Técnico Especializado',
    image: '/img/BANNERSUPORTE.MAQUINA.webp',
  },
];

/**
 * SERVIÇOS: Banners coloridos fixos no final da página Home.
 */
export const services = [
  { id: 1, name: 'Moby Work', color: '#1a237e' },
  { id: 2, name: 'Talmax Digital', color: '#01579b' },
  { id: 3, name: 'Cursos', color: '#006064' },
  { id: 4, name: 'Suporte', color: '#1b5e20' },
];
