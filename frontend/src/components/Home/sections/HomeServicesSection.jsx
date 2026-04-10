import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { apiAssetPath } from '../../../utils/assets';
import 'swiper/css';
import 'swiper/css/navigation';

const ServiceBanner = ({ service }) => {
  const imageSrc = service.image_url
    ? apiAssetPath(service.image_url)
    : '';

  const bannerContent = (
    <>
      {imageSrc && (
        <img
          src={imageSrc}
          alt=""
          aria-hidden="true"
          className="service-banner-media"
          loading="lazy"
          fetchPriority="low"
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      )}
      <div className="service-banner-overlay">
        <strong>{service.name}</strong>
        <p>{service.description}</p>
      </div>
    </>
  );

  if (service.is_external) {
    return (
      <a
        href={service.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="service-banner"
        aria-label={service.name}
      >
        {bannerContent}
      </a>
    );
  }

  return (
    <Link
      to={service.link_url}
      className="service-banner"
      aria-label={service.name}
    >
      {bannerContent}
    </Link>
  );
};

const HomeServicesSection = ({ services }) => {
  if (!services.length) {
    return null;
  }

  if (services.length > 4) {
    return (
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
              <ServiceBanner service={service} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    );
  }

  return (
    <section className="service-banners">
      {services.map((service) => (
        <ServiceBanner key={service.id} service={service} />
      ))}
    </section>
  );
};

export default HomeServicesSection;
