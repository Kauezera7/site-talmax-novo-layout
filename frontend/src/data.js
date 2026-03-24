/**
 * SLIDES (BANNERS): Lista de imagens que aparecem no slider principal.
 */
import { assetPath } from './utils/assets';

export const slides = [
  {
    id: 1,
    title: 'B42 - Fresadora de Precisão',
    image: assetPath('img/BANNER_B42.webp'),
  },
  {
    id: 2,
    title: 'A53 - Performance e Agilidade',
    image: assetPath('img/BANNER-A53.webp'),
  },
  {
    id: 3,
    title: 'Aoralscan 3',
    image: assetPath('img/BANNER-AORALSCAN-3.webp'),
  },
  {
    id: 4,
    title: 'Sistema Ceramotion',
    image: assetPath('img/BANNER-CERAMOTION.webp'),
  },
  {
    id: 5,
    title: 'MicroFit',
    image: assetPath('img/BANNER-microFit.webp'),
  },
  {
    id: 6,
    title: 'Atendimento via Chatbot',
    image: assetPath('img/BANNERchat_bot.webp'),
  },
  {
    id: 7,
    title: 'Suporte Técnico Especializado',
    image: assetPath('img/BANNERSUPORTE.MAQUINA.webp'),
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
