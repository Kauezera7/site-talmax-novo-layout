import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiAssetPath } from '../../../utils/assets';

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
      {product.description || 'Produto selecionado para esta página personalizada.'}
    </p>
  );
};

const CustomPageHeroLeft = ({ page, navigate }) => {
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
                    {product.main_image && (
                      <motion.img
                        src={apiAssetPath(product.main_image)}
                        alt={product.name}
                        className="custom-page__showcase-image"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                        onClick={() => navigate(`/produto/${product.id}`)}
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
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
            <div className="custom-page__empty-products">Nenhum produto foi vinculado a esta página ainda.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CustomPageHeroLeft;
