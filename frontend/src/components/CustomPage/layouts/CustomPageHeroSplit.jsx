import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../../ProductCard/ProductCard';
import { apiAssetPath, assetPath } from '../../../utils/assets';
import { getLayoutMeta } from './layoutMeta';

const CustomPageHeroSplit = ({ page, navigate }) => {
  const heroMeta = getLayoutMeta(page?.layout_type);

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
              <Link to="/produtos" className="custom-page__link">Ir para catálogo</Link>
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
          <div className="custom-page__empty-products">Nenhum produto foi vinculado a esta página ainda.</div>
        )}
      </section>
    </div>
  );
};

export default CustomPageHeroSplit;
