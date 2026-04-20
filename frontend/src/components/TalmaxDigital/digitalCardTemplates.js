import { assetPath, resolveStoredAssetPath } from '../../utils/assets';
import {
  isExternalNavigationTarget,
  sanitizeAssetReference,
  sanitizeNavigationTarget,
  sanitizeTextInput
} from '../../utils/contentSafety';

export const DIGITAL_CARD_TEMPLATES = [
  {
    id: 'upcera',
    title: 'UPCERA',
    description: 'Ceramicas e Discos de alta performance',
    frontAsset: 'img/upcera.png',
    backAsset: 'img/logo-upcera-.webp'
  },
  {
    id: 'scanners',
    title: 'SCANNERS',
    description: 'Intraoral e Bancada com Precisao Digital',
    frontAsset: 'img/box-td-scanners.jpg.webp',
    backAsset: 'img/scanner.png'
  },
  {
    id: 'impressoras',
    title: 'IMPRESSORAS 3D',
    description: 'Anycubic e Resinas Especializadas',
    frontAsset: 'img/box-td-impressoras-1-260x300.jpg.webp',
    backAsset: 'img/impressoras3d.png'
  },
  {
    id: 'componentes',
    title: 'COMPONENTES',
    description: 'Pecas e Estruturas Proteticas',
    frontAsset: 'img/box-td-componentes-260x300.jpg.webp',
    backAsset: 'img/componentesproteticos.png'
  },
  {
    id: 'insumos',
    title: 'INSUMOS',
    description: 'Blocos e Ceras de Alta Qualidade',
    frontAsset: 'img/box-td-insumos-260x300.jpg.webp',
    backAsset: 'img/icon-td-insumos.png'
  }
];

export const parseDigitalActionsPayload = (value) => {
  if (!value) {
    return { buttons: [], digital_cards: [] };
  }

  if (typeof value === 'string') {
    try {
      return parseDigitalActionsPayload(JSON.parse(value));
    } catch {
      return { buttons: [], digital_cards: [] };
    }
  }

  if (Array.isArray(value)) {
    return { buttons: value, digital_cards: [] };
  }

  if (typeof value === 'object') {
    const digitalCards = (Array.isArray(value.digital_cards) ? value.digital_cards : [])
      .map((card, index) => {
        const safeLinkUrl = sanitizeNavigationTarget(card?.link_url || '', {
          allowExternal: true,
          allowRelative: true
        });

        return {
          id: sanitizeTextInput(card?.id || `digital-card-${index}`, { preserveNewlines: false, maxLength: 120 }),
          title: sanitizeTextInput(card?.title || '', { preserveNewlines: false, maxLength: 255 }),
          description: sanitizeTextInput(card?.description || '', { preserveNewlines: true, maxLength: 4000 }),
          link_url: safeLinkUrl,
          is_external: Boolean(card?.is_external) || isExternalNavigationTarget(safeLinkUrl),
          front_image_url: sanitizeAssetReference(card?.front_image_url || ''),
          back_image_url: sanitizeAssetReference(card?.back_image_url || '')
        };
      })
      .filter((card) => card.id);

    return {
      buttons: Array.isArray(value.buttons)
        ? value.buttons
        : Array.isArray(value.actions)
          ? value.actions
          : [],
      digital_cards: digitalCards
    };
  }

  return { buttons: [], digital_cards: [] };
};

export const buildTalmaxDigitalReferenceCards = (storedCards = []) => (
  DIGITAL_CARD_TEMPLATES.map((template) => {
    const storedCard = storedCards.find((card) => String(card?.id || '').trim() === template.id) || {};

    return {
      id: template.id,
      title: storedCard.title || sanitizeTextInput(template.title, { preserveNewlines: false, maxLength: 255 }),
      description: storedCard.description || sanitizeTextInput(template.description, { preserveNewlines: true, maxLength: 4000 }),
      link_url: sanitizeNavigationTarget(storedCard.link_url || '', { allowExternal: true, allowRelative: true }),
      is_external: Boolean(storedCard.is_external),
      front_image_url: sanitizeAssetReference(storedCard.front_image_url || ''),
      back_image_url: sanitizeAssetReference(storedCard.back_image_url || ''),
      default_front_image: assetPath(template.frontAsset),
      default_back_image: assetPath(template.backAsset)
    };
  })
);

export const buildTalmaxDigitalCategories = (storedCards = []) => (
  buildTalmaxDigitalReferenceCards(storedCards).map((card) => ({
    id: card.id,
    title: card.title,
    desc: card.description,
    image: card.front_image_url ? resolveStoredAssetPath(card.front_image_url) : card.default_front_image,
    backIcon: card.back_image_url ? resolveStoredAssetPath(card.back_image_url) : card.default_back_image,
    backImage: card.back_image_url ? resolveStoredAssetPath(card.back_image_url) : '',
    link_url: card.link_url || ''
  }))
);
