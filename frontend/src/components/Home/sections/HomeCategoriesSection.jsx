import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { apiAssetPath, assetPath } from '../../../utils/assets';
import 'swiper/css';
import 'swiper/css/pagination';

const CATEGORY_BACKGROUND = [
  {
    match: ['scanner'],
    image: 'img/box-td-scanners.jpg.webp'
  },
  {
    match: ['impressora', 'resina'],
    image: 'img/box-td-impressoras-1-260x300.jpg.webp'
  },
  {
    match: ['insumo', 'ceramica', 'ceramicas', 'bloco'],
    image: 'img/box-td-insumos-260x300.jpg.webp'
  },
  {
    match: ['componente', 'protetico', 'protese', 'cad', 'cam', 'fresadora', 'equipamento'],
    image: 'img/box-td-componentes-260x300.jpg.webp'
  }
];

const DEFAULT_CATEGORY_BACKGROUND = 'img/box-td-scanners.jpg.webp';

const normalizeCategoryText = (value = '') => (
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
);

const getCategoryBackground = (category) => {
  if (category.background_url) {
    return apiAssetPath(category.background_url);
  }

  const categoryText = normalizeCategoryText(`${category.name || ''} ${category.slug || ''}`);
  const background = CATEGORY_BACKGROUND.find(({ match }) => (
    match.some((keyword) => categoryText.includes(keyword))
  ));

  return assetPath(background?.image || DEFAULT_CATEGORY_BACKGROUND);
};

const isExternalTarget = (value = '') => /^(?:https?:|mailto:|tel:)/i.test(String(value || '').trim());

const splitDescription = (description = '') => (
  String(description || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
);

const renderPromoCard = (card, index) => {
  const href = String(card.link_url || '').trim();
  const isExternal = Boolean(card.is_external) || isExternalTarget(href);
  const descriptionLines = splitDescription(card.description);
  const buttonLabel = card.button_label || 'Saiba Mais';
  const style = {
    '--categories-promo-card-bg': card.background_color || '#111630',
    '--categories-promo-card-color': card.text_color || '#f5f7ff',
    '--categories-promo-button-bg': card.button_color || '#374c92',
    '--categories-promo-button-color': card.button_text_color || '#ffffff'
  };
  const content = (
    <>
      <span className="categories-promo-card__content">
        <strong>{card.title}</strong>
        {descriptionLines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </span>
      {buttonLabel && (
        <span className="categories-promo-card__corner">
          <span className="categories-promo-card__button">
            {buttonLabel}
            <ChevronRight size={18} strokeWidth={1.8} />
          </span>
        </span>
      )}
    </>
  );

  if (href && isExternal) {
    return (
      <a
        key={card.id || `promo-${index}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="categories-promo-card"
        style={style}
      >
        {content}
      </a>
    );
  }

  if (href) {
    return (
      <Link
        key={card.id || `promo-${index}`}
        to={href}
        className="categories-promo-card"
        style={style}
      >
        {content}
      </Link>
    );
  }

  return (
    <article
      key={card.id || `promo-${index}`}
      className="categories-promo-card categories-promo-card--static"
      style={style}
    >
      {content}
    </article>
  );
};

const HomeCategoriesSection = ({ categories, promoCards = [] }) => {
  if (!categories.length) {
    return null;
  }

  return (
    <section className="categories" aria-labelledby="home-categories-title">
      <div className="categories__inner">
        <div className="categories__header">
          <h2 id="home-categories-title">Categorias de Produtos</h2>
          <p>Todas as categorias voce encontra aqui</p>
        </div>

        <div className="category-grid">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categoria/${cat.slug}`}
              className="category-card"
              aria-label={`Ver produtos de ${cat.name}`}
            >
              <img
                src={getCategoryBackground(cat)}
                alt=""
                aria-hidden="true"
                className="category-card-media"
                loading="lazy"
                fetchPriority="low"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = assetPath(DEFAULT_CATEGORY_BACKGROUND);
                }}
              />
              {cat.icon_url && (
                <span className="category-icon-wrapper" aria-hidden="true">
                  <img
                    src={apiAssetPath(cat.icon_url)}
                    alt=""
                    className="category-custom-icon"
                    loading="lazy"
                    fetchPriority="low"
                    decoding="async"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                </span>
              )}
              {!cat.icon_url && (
                <span className="category-icon-wrapper category-icon-wrapper--fallback" aria-hidden="true">
                  <Package size={108} strokeWidth={1.55} />
                </span>
              )}
              <h3>{cat.name}</h3>
              <span className="category-card-corner" aria-hidden="true">
                <span className="category-card-corner-icon">
                  <ChevronRight size={22} strokeWidth={2.05} />
                </span>
              </span>
            </Link>
          ))}
        </div>

        {promoCards.length > 0 && (
          <div className="categories-promo">
            <Swiper
              modules={[Autoplay, Pagination]}
              className="categories-promo__swiper"
              spaceBetween={24}
              slidesPerView={1}
              loop={promoCards.length > 1}
              autoplay={promoCards.length > 1 ? { delay: 3600, disableOnInteraction: false } : false}
              pagination={promoCards.length > 1 ? { clickable: true } : false}
              breakpoints={{
                980: {
                  slidesPerView: Math.min(promoCards.length, 2),
                  spaceBetween: 54
                }
              }}
            >
              {promoCards.map((card, index) => (
                <SwiperSlide key={card.id || `promo-slide-${index}`}>
                  {renderPromoCard(card, index)}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeCategoriesSection;
