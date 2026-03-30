/**
 * Pagina: Home
 * Rota: /
 * Responsabilidade: montar a pagina inicial e carregar categorias visiveis
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { services } from '../../data';
import HeroSlider from '../HeroSlider/HeroSlider';
import API_URL from '../../services/api';
import { apiAssetPath, assetPath } from '../../utils/assets';
import testeServicosImage from '../../assets/testeservicos.png';
import './Home.css';

const Home = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);
        const data = await response.json();

        // Mostra todas as categorias principais que o usuario marcou como visiveis no Admin
        const visibleMainCategories = data.filter((cat) =>
          !cat.parent_id &&
          (cat.is_visible === 1 || cat.is_visible === true || cat.is_visible === '1')
        );

        setCategories(visibleMainCategories);
      } catch (err) {
        console.error('Erro ao carregar categorias na Home:', err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      <HeroSlider />

      <section className="service-banners">
        {services.map((service) => {
          const bannerClassName = `service-banner${service.name === 'Moby Work' ? ' service-banner-moby' : ''}${service.name === 'Talmax Digital' ? ' service-banner-talmax-digital' : ''}${service.name === 'Cursos' ? ' service-banner-cursos' : ''}${service.name === 'ServiÃ§os' ? ' service-banner-suporte' : ''}`;

          const imageByService = {
            'Moby Work': { src: assetPath('img/mobywork.png'), alt: 'Moby Work' },
            'Talmax Digital': { src: assetPath('img/talmaxdigita1.png'), alt: 'Talmax Digital' },
            Cursos: { src: assetPath('img/cursostalmax.png'), alt: 'Cursos Talmax' },
            'ServiÃ§os': { src: testeServicosImage, alt: 'ServiÃ§os Talmax' },
          };

          const image = imageByService[service.name];

          const bannerContent = (
            <>
              {image ? (
                <img
                  src={image.src}
                  alt={image.alt}
                  className="service-banner-logo"
                />
              ) : null}

              <div className="service-banner-overlay">
                <strong>{service.name}</strong>
                <p>{service.description}</p>
                {service.actions?.length ? (
                  <div className="service-banner-actions">
                    {service.actions.map((action) => (
                      action.external ? (
                        <a
                          key={action.href}
                          href={action.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="service-banner-action"
                        >
                          {action.label}
                        </a>
                      ) : (
                        <Link
                          key={action.href}
                          to={action.href}
                          className="service-banner-action"
                        >
                          {action.label}
                        </Link>
                      )
                    ))}
                  </div>
                ) : (
                  <span className="service-banner-cta">Clique para acessar</span>
                )}
              </div>
            </>
          );

          if (service.actions?.length) {
            return (
              <div
                key={service.id}
                className={bannerClassName}
              >
                {bannerContent}
              </div>
            );
          }

          if (service.external) {
            return (
              <a
                key={service.id}
                href={service.href}
                target="_blank"
                rel="noopener noreferrer"
                className={bannerClassName}
              >
                {bannerContent}
              </a>
            );
          }

          return (
            <Link
              key={service.id}
              to={service.href}
              className={bannerClassName}
            >
              {bannerContent}
            </Link>
          );
        })}
      </section>

      <section className="categories">
        <h2 className="section-title">Categorias de Produtos</h2>
        <div className="category-grid">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categoria/${cat.slug}`}
              className="category-card"
            >
              <div className="category-icon-wrapper">
                <img
                  src={cat.icon_url ? apiAssetPath(cat.icon_url) : assetPath('img/placeholder.png')}
                  alt={cat.name}
                  className="category-custom-icon"
                />
              </div>
              <h3>{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;

