import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiAssetPath } from '../../../utils/assets';

const CustomPageHeroCentered = ({ page, navigate }) => {
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
            <span className="custom-page__launch-kicker">Produto de lançamento</span>
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
              <Link to="/produtos" className="custom-page__launch-link">Catálogo completo</Link>
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
                  {featuredProduct.main_image && (
                    <motion.img
                      src={apiAssetPath(featuredProduct.main_image)}
                      alt={featuredProduct.name}
                      className="custom-page__launch-product-image"
                      whileHover={{ scale: 1.04, rotate: -1.2 }}
                      transition={{ duration: 0.35 }}
                      onClick={() => navigate(`/produto/${featuredProduct.id}`)}
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <div className="custom-page__launch-product-panel">
                  <span style={{ color: accentColor }}>LANÇAMENTO</span>
                  <h2 onClick={() => navigate(`/produto/${featuredProduct.id}`)}>{featuredProduct.name}</h2>
                  <p>{featuredProduct.description || 'Produto principal selecionado para esta página.'}</p>
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
              <div className="custom-page__empty-products">Nenhum produto foi vinculado a esta página ainda.</div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CustomPageHeroCentered;
