/**
 * Pagina: Home
 * Rota: /
 * Responsabilidade: montar a pagina inicial e carregar categorias visiveis
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { services } from '../../data';
import HeroSlider from '../HeroSlider/HeroSlider';
import ProductCard from '../ProductCard/ProductCard';
import API_URL from '../../services/api';
import { apiAssetPath, assetPath } from '../../utils/assets';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../ProductCatalog/ProductCatalog.css';
import './Home.css';

const parseExtraData = (value) => {
  if (!value) return {};

  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (error) {
    return {};
  }
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await fetch(`${API_URL}/categories`);
        if (!categoriesResponse.ok) {
          throw new Error('Falha ao carregar categorias');
        }

        const categoriesData = await categoriesResponse.json();

        // Mostra todas as categorias principais que o usuario marcou como visiveis no Admin
        const visibleMainCategories = categoriesData.filter((cat) =>
          !cat.parent_id &&
          (cat.is_visible === 1 || cat.is_visible === true || cat.is_visible === '1')
        );

        setCategories(visibleMainCategories);
      } catch (err) {
        console.error('Erro ao carregar categorias na Home:', err);
        setCategories([]);
      }
    };

    const fetchFeaturedProducts = async () => {
      try {
        const productsResponse = await fetch(`${API_URL}/products`);
        if (!productsResponse.ok) {
          throw new Error('Falha ao carregar produtos em destaque');
        }

        const productsData = await productsResponse.json();

        const mappedFeaturedProducts = productsData
          .filter((product) => product.is_featured)
          .map((product) => {
            const extra = parseExtraData(product.extra_data);
            return {
              ...product,
              featuredOrder: Number(extra.featured_order || 0),
              image: product.main_image ? apiAssetPath(product.main_image) : assetPath('img/placeholder.png'),
              images: Array.isArray(extra.images) ? extra.images.map((image) => apiAssetPath(image)) : []
            };
          })
          .sort((a, b) => {
            if (a.featuredOrder !== b.featuredOrder) {
              return a.featuredOrder - b.featuredOrder;
            }

            return a.name.localeCompare(b.name, 'pt-BR');
          })
          ;

        setFeaturedProducts(mappedFeaturedProducts);
      } catch (err) {
        console.error('Erro ao carregar produtos em destaque na Home:', err);
        setFeaturedProducts([]);
      }
    };

    fetchCategories();
    fetchFeaturedProducts();
  }, []);

  return (
    <>
      <HeroSlider />

      <section className="service-banners">
        {services.map((service) => {
          const bannerClassName = `service-banner${service.name === 'Moby Work' ? ' service-banner-moby' : ''}${service.name === 'Talmax Digital' ? ' service-banner-talmax-digital' : ''}${service.name === 'Cursos' ? ' service-banner-cursos' : ''}${service.name === 'ServiÃ§os' ? ' service-banner-suporte' : ''}`;

          const imageByServiceId = {
            1: { src: assetPath('img/mobywork.png'), alt: 'Moby Work' },
            2: { src: assetPath('img/talmaxdigita1.png'), alt: 'Talmax Digital' },
            3: { src: assetPath('img/cursostalmax.png'), alt: 'Cursos Talmax' },
            4: { src: assetPath('img/testeservicos.png'), alt: 'Servicos Talmax' },
          };

          const image = imageByServiceId[service.id];
          const bannerStyle = image
            ? { backgroundImage: `url(${image.src})` }
            : undefined;

          const bannerContent = (
            <>
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
                style={bannerStyle}
                aria-label={image?.alt || service.name}
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
                style={bannerStyle}
                aria-label={image?.alt || service.name}
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
              style={bannerStyle}
              aria-label={image?.alt || service.name}
            >
              {bannerContent}
            </Link>
          );
        })}
      </section>
      
      {featuredProducts.length > 0 && (
        <section className="home-featured-products">
          <div className="home-featured-products__inner">
            <div className="home-featured-products__header">
              <span className="home-featured-products__eyebrow">Seleção Talmax</span>
              <h2>Produtos em Destaque</h2>
              <p>Escolhidos no painel administrativo para ganhar mais visibilidade na Home.</p>
            </div>

            <div className="home-featured-products__carousel">
              <button
                type="button"
                className="home-featured-products__nav home-featured-products__nav-prev"
                aria-label="Produto anterior"
              />
              <button
                type="button"
                className="home-featured-products__nav home-featured-products__nav-next"
                aria-label="Próximo produto"
              />
              <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                spaceBetween={24}
                slidesPerView={1}
                navigation={{
                  prevEl: '.home-featured-products__nav-prev',
                  nextEl: '.home-featured-products__nav-next'
                }}
                pagination={false}
                autoplay={{ delay: 3500, disableOnInteraction: false }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                  1400: { slidesPerView: 5 }
                }}
              >
                {featuredProducts.map((product, index) => (
                  <SwiperSlide key={product.id}>
                    <ProductCard product={product} index={index} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      )}

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

