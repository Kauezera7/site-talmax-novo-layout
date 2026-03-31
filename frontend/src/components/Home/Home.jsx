/**
 * Pagina: Home
 * Rota: /
 * Responsabilidade: montar a pagina inicial e carregar categorias visiveis
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
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
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchHomeServices = async () => {
      try {
        const response = await fetch(`${API_URL}/home-services`);
        if (!response.ok) {
          throw new Error('Falha ao carregar serviços da home');
        }
        const data = await response.json();
        setServices(data.filter(s => s.active));
      } catch (err) {
        console.error('Erro ao carregar serviços da home:', err);
        setServices([]);
      }
    };

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
    fetchHomeServices();
  }, []);

  const renderServiceBanner = (service) => {
    const bannerClassName = 'service-banner';

    const bannerStyle = service.image_url
      ? { backgroundImage: `url(${apiAssetPath(service.image_url)})` }
      : { backgroundImage: `url(${assetPath('img/placeholder.png')})` };

    const bannerContent = (
      <div className="service-banner-overlay">
        <strong>{service.name}</strong>
        <p>{service.description}</p>
      </div>
    );

    if (service.is_external) {
      return (
        <a
          key={service.id}
          href={service.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className={bannerClassName}
          style={bannerStyle}
          aria-label={service.name}
        >
          {bannerContent}
        </a>
      );
    }

    return (
      <Link
        key={service.id}
        to={service.link_url}
        className={bannerClassName}
        style={bannerStyle}
        aria-label={service.name}
      >
        {bannerContent}
      </Link>
    );
  };

  return (
    <>
      <HeroSlider />

      {services.length > 4 ? (
        <section className="service-banners service-banners--carousel">
          <button
            type="button"
            className="service-banners__nav service-banners__nav-prev"
            aria-label="Banner anterior"
          />
          <button
            type="button"
            className="service-banners__nav service-banners__nav-next"
            aria-label="Próximo banner"
          />

          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={16}
            slidesPerView={1}
            loop={services.length > 1}
            navigation={{
              prevEl: '.service-banners__nav-prev',
              nextEl: '.service-banners__nav-next'
            }}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1400: { slidesPerView: 4 }
            }}
          >
            {services.map((service) => (
              <SwiperSlide key={service.id}>
                {renderServiceBanner(service)}
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      ) : (
        <section className="service-banners">
          {services.map((service) => renderServiceBanner(service))}
        </section>
      )}
      
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
                loop={featuredProducts.length > 1}
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

