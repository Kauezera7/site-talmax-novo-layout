import React from 'react';
import { Link } from 'react-router-dom';
import { apiAssetPath } from '../../../utils/assets';

const HomeCategoriesSection = ({ categories }) => {
  if (!categories.length) {
    return null;
  }

  return (
    <section className="categories">
      <h2 className="section-title">Categorias de Produtos</h2>
      <div className="category-grid">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/categoria/${cat.slug}`}
            className="category-card"
          >
            {cat.icon_url && (
              <div className="category-icon-wrapper">
                <img
                  src={apiAssetPath(cat.icon_url)}
                  alt={cat.name}
                  className="category-custom-icon"
                  loading="lazy"
                  fetchPriority="low"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <h3>{cat.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HomeCategoriesSection;
