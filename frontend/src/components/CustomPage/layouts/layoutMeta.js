export const LAYOUT_META = {
  'hero-left': {
    badge: 'Layout de Lista',
    className: 'custom-page__hero--left'
  },
  'hero-centered': {
    badge: 'Layout produtos em destaque',
    className: 'custom-page__hero--centered'
  },
  'hero-split': {
    badge: 'Layout 3',
    className: 'custom-page__hero--split'
  }
};

export const getLayoutMeta = (layoutType) => LAYOUT_META[layoutType] || LAYOUT_META['hero-left'];
