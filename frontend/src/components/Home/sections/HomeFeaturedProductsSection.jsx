import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import ProductCard from '../../ProductCard/ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';

const HomeFeaturedProductsSection = ({ featuredProducts }) => {
  if (!featuredProducts.length) {
    return null;
  }

  return (
    <section className="home-featured-products">
      <div className="home-featured-products__inner">
        <div className="home-featured-products__header">
          <h2>Produtos em Destaque</h2>
          <p>Produtos para Prótese Odontológica</p>
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
            modules={[Autoplay, Navigation]}
            spaceBetween={10}
            slidesPerView={2}
            loop={featuredProducts.length > 1}
            navigation={{
              prevEl: '.home-featured-products__nav-prev',
              nextEl: '.home-featured-products__nav-next'
            }}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 16 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
              1400: { slidesPerView: 5, spaceBetween: 24 }
            }}
          >
            {featuredProducts.map((product, index) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} index={index} imageLoading="lazy" imageFetchPriority="low" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default HomeFeaturedProductsSection;
