import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import customPageService from '../../services/customPageService';
import { apiAssetPath, assetPath } from '../../utils/assets';
import ProductCard from '../ProductCard/ProductCard';
import './CustomPage.css';

const LAYOUT_META = {
  'hero-left': {
    badge: 'Layout 1',
    className: 'custom-page__hero--left'
  },
  'hero-centered': {
    badge: 'Layout 2',
    className: 'custom-page__hero--centered'
  },
  'hero-split': {
    badge: 'Layout 3',
    className: 'custom-page__hero--split'
  }
};

const parseExtraData = (value) => {
  if (!value) return {};

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return {};
    }
  }

  return typeof value === 'object' ? value : {};
};

const renderFeatureContent = (product, accentColor) => {
  const extra = parseExtraData(product.extra_data);
  const features = Array.isArray(extra.features) ? extra.features.filter(Boolean).slice(0, 5) : [];
  const descriptionItems = String(product.description || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);

  if (features.length > 0) {
    return (
      <div className="custom-page__feature-list">
        {features.map((feature, index) => (
          <div key={index} className="custom-page__feature-item">
            <div className="custom-page__feature-dot" style={{ background: accentColor }} />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    );
  }

  if (descriptionItems.length > 1) {
    return (
      <div className="custom-page__feature-list">
        {descriptionItems.map((item, index) => (
          <div key={index} className="custom-page__feature-item">
            <div className="custom-page__feature-dot" style={{ background: accentColor }} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <p className="custom-page__showcase-description">
      {product.description || 'Produto selecionado para esta pagina personalizada.'}
    </p>
  );
};

const CustomPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPage = async () => {
      setIsLoading(true);

      try {
        const data = await customPageService.getPublicBySlug(slug);
        setPage(data);
        setError('');
      } catch (loadError) {
        setError(loadError.message || 'Pagina nao encontrada');
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [slug]);

  const heroMeta = useMemo(
    () => LAYOUT_META[page?.layout_type] || LAYOUT_META['hero-left'],
    [page?.layout_type]
  );

  if (isLoading) {
    return <div className="custom-page__state">Carregando pagina...</div>;
  }

  if (error || !page) {
    return <div className="custom-page__state">{error || 'Pagina nao encontrada.'}</div>;
  }

  if (page.layout_type === 'hero-left') {
    const accentColor = '#0055a5';

    return (
      <div className="custom-page custom-page--special">
        <section className="custom-page__special-header">
          <div className="custom-page__special-inner">
            <motion.button
              type="button"
              className="custom-page__special-back"
              onClick={() => navigate(-1)}
              whileHover={{ x: -5, color: accentColor }}
            >
              <ArrowLeft size={16} />
              VOLTAR
            </motion.button>

            <div className="custom-page__special-brand">
              {page.logo_url && (
                <img
                  className="custom-page__special-logo"
                  src={apiAssetPath(page.logo_url)}
                  alt={page.title}
                />
              )}
              <div className="custom-page__special-line" style={{ background: accentColor }} />
              <div className="custom-page__special-overline"></div>
              <h1 style={{ color: accentColor }}>{page.title}</h1>
              {page.description && <p className="custom-page__special-description">{page.description}</p>}
              {page.sub_description && <p className="custom-page__special-subdescription">{page.sub_description}</p>}
            </div>
          </div>
        </section>

        {page.banner_url && (
          <section className="custom-page__special-banner-wrap">
            <div className="custom-page__special-banner-shell">
              <img
                className="custom-page__special-banner"
                src={apiAssetPath(page.banner_url)}
                alt={page.title}
              />
            </div>
          </section>
        )}

        <section id="produtos" className="custom-page__special-products">
          <div className="custom-page__special-inner">
            {page.products?.length ? (
              <div className="custom-page__showcase-list">
                {page.products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    className="custom-page__showcase-item"
                    style={{ flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' }}
                    initial={{ opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7 }}
                  >
                    <div className="custom-page__showcase-image-stage">
                      <div
                        className="custom-page__showcase-glow"
                        style={{ background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)` }}
                      />
                      <motion.img
                        src={product.main_image ? apiAssetPath(product.main_image) : assetPath('img/placeholder.png')}
                        alt={product.name}
                        className="custom-page__showcase-image"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                        onClick={() => navigate(`/produto/${product.id}`)}
                      />
                    </div>

                    <div className="custom-page__showcase-details">
                      <div className="custom-page__showcase-heading">
                        <div className="custom-page__showcase-heading-line" style={{ background: accentColor }} />
                        <span style={{ color: accentColor }}>Produtos selecionados</span>
                      </div>
                      <h2 onClick={() => navigate(`/produto/${product.id}`)}>{product.name}</h2>
                      {renderFeatureContent(product, accentColor)}
                      <button
                        type="button"
                        className="custom-page__showcase-button"
                        style={{ background: accentColor }}
                        onClick={() => navigate(`/produto/${product.id}`)}
                      >
                        VER DETALHES
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="custom-page__empty-products">Nenhum produto foi vinculado a esta pagina ainda.</div>
            )}
          </div>
        </section>
      </div>
    );
  }

  if (page.layout_type === 'hero-centered') {
    const accentColor = '#ff6a1a';
    const [featuredProduct] = page.products || [];

    return (
      <div className="custom-page custom-page--launch">
        <section className="custom-page__launch-hero">
          <div className="custom-page__launch-orb custom-page__launch-orb--one" />
          <div className="custom-page__launch-orb custom-page__launch-orb--two" />
          <div className="custom-page__launch-grid">
            <motion.button
              type="button"
              className="custom-page__launch-back"
              onClick={() => navigate(-1)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ArrowLeft size={16} />
              Voltar
            </motion.button>

            <motion.div
              className="custom-page__launch-copy"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <span className="custom-page__launch-kicker">Produto de lancamento</span>
              {page.logo_url && (
                <img
                  className="custom-page__launch-logo"
                  src={apiAssetPath(page.logo_url)}
                  alt={page.title}
                />
              )}
              <h1>{page.title}</h1>
              {page.description && <p className="custom-page__launch-description">{page.description}</p>}
              {page.sub_description && <p className="custom-page__launch-subdescription">{page.sub_description}</p>}
              <div className="custom-page__launch-actions">
                <a href="#produto-destaque" className="custom-page__launch-cta">Ver destaque</a>
                <Link to="/produtos" className="custom-page__launch-link">Catalogo completo</Link>
              </div>
            </motion.div>

            <motion.div
              id="produto-destaque"
              className="custom-page__launch-stage"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55 }}
            >
              {featuredProduct ? (
                <>
                  <div className="custom-page__launch-badge">Destaque principal</div>
                  <div className="custom-page__launch-stage-top">
                    <div className="custom-page__launch-ring" />
                    <div className="custom-page__launch-ring custom-page__launch-ring--inner" />
                    <motion.img
                      src={featuredProduct.main_image ? apiAssetPath(featuredProduct.main_image) : assetPath('img/placeholder.png')}
                      alt={featuredProduct.name}
                      className="custom-page__launch-product-image"
                      whileHover={{ scale: 1.04, rotate: -1.2 }}
                      transition={{ duration: 0.35 }}
                      onClick={() => navigate(`/produto/${featuredProduct.id}`)}
                    />
                  </div>
                  <div className="custom-page__launch-product-panel">
                    <span style={{ color: accentColor }}>LANCAMENTO</span>
                    <h2 onClick={() => navigate(`/produto/${featuredProduct.id}`)}>{featuredProduct.name}</h2>
                    <p>{featuredProduct.description || 'Produto principal selecionado para esta pagina.'}</p>
                    <button
                      type="button"
                      className="custom-page__launch-product-button"
                      style={{ background: accentColor }}
                      onClick={() => navigate(`/produto/${featuredProduct.id}`)}
                    >
                      Ver produto
                    </button>
                  </div>
                </>
              ) : (
                <div className="custom-page__empty-products">Nenhum produto foi vinculado a esta pagina ainda.</div>
              )}
            </motion.div>
          </div>
        </section>

      </div>
    );
  }

  return (
    <div className="custom-page">
      <section
        className={`custom-page__hero ${heroMeta.className}`}
        style={{
          backgroundImage: page.banner_url ? `linear-gradient(120deg, rgba(5, 16, 31, 0.82), rgba(15, 63, 117, 0.6)), url(${apiAssetPath(page.banner_url)})` : undefined
        }}
      >
        <div className="custom-page__overlay" />
        <div className="custom-page__hero-inner">
          <motion.button
            type="button"
            className="custom-page__back"
            onClick={() => navigate(-1)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ArrowLeft size={16} />
            Voltar
          </motion.button>

          <motion.div
            className="custom-page__content"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <span className="custom-page__badge">{heroMeta.badge}</span>

            {page.logo_url && (
              <img
                className="custom-page__logo"
                src={apiAssetPath(page.logo_url)}
                alt={page.title}
              />
            )}

            <h1>{page.title}</h1>
            {page.description && <p className="custom-page__description">{page.description}</p>}
            {page.sub_description && <p className="custom-page__sub-description">{page.sub_description}</p>}
            <div className="custom-page__actions">
              <a href="#produtos" className="custom-page__cta">Ver produtos</a>
              <Link to="/produtos" className="custom-page__link">Ir para catalogo</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="produtos" className="custom-page__products-section">
        <div className="custom-page__section-header">
          <span>Produtos selecionados</span>
          <h2>Montados direto no painel administrativo</h2>
        </div>

        {page.products?.length ? (
          <div className="custom-page__products-grid">
            {page.products.map((product, index) => (
              <ProductCard
                key={product.id}
                index={index}
                product={{
                  ...product,
                  image: product.main_image ? apiAssetPath(product.main_image) : assetPath('img/placeholder.png')
                }}
              />
            ))}
          </div>
        ) : (
          <div className="custom-page__empty-products">Nenhum produto foi vinculado a esta pagina ainda.</div>
        )}
      </section>
    </div>
  );
};

export default CustomPage;
