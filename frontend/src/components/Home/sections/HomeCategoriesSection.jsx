import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';
import { apiAssetPath, assetPath } from '../../../utils/assets';

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
  const categoryText = normalizeCategoryText(`${category.name || ''} ${category.slug || ''}`);
  const background = CATEGORY_BACKGROUND.find(({ match }) => (
    match.some((keyword) => categoryText.includes(keyword))
  ));

  return assetPath(background?.image || DEFAULT_CATEGORY_BACKGROUND);
};

const HomeCategoriesSection = ({ categories }) => {
  if (!categories.length) {
    return null;
  }

  return (
    <section className="categories" aria-labelledby="home-categories-title">
      <div className="categories__inner">
        <div className="categories__header">
          <h2 id="home-categories-title">Categorias de Produtos</h2>
          <p>Todas as categorias você encontra aqui</p>
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

        <div className="categories-promo">
          <Link to="/contato" className="categories-promo-card">
            <span className="categories-promo-card__content">
              <strong>Talmax perto de Você</strong>
              <span>Trabalhamos com dentais selecionadas para garantir qualidade, procedência e suporte.</span>
            </span>
            <span className="categories-promo-card__corner">
              <span className="categories-promo-card__button">
                Saiba Mais
                <ChevronRight size={18} strokeWidth={1.8} />
              </span>
            </span>
          </Link>

          <a
            href="https://www.bne.com.br/talmax"
            target="_blank"
            rel="noopener noreferrer"
            className="categories-promo-card"
          >
            <span className="categories-promo-card__content">
              <strong>Trabalhe Conosco</strong>
              <span>Valorizamos ideias, incentivamos o desenvolvimento e acreditamos no trabalho em equipe para ir cada vez mais longe.</span>
              <span>Venha fazer parte do nosso time.</span>
            </span>
            <span className="categories-promo-card__corner">
              <span className="categories-promo-card__button">
                Saiba Mais
                <ChevronRight size={18} strokeWidth={1.8} />
              </span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HomeCategoriesSection;
