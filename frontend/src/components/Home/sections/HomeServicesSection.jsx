import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { apiAssetPath } from '../../../utils/assets';
import { isExternalNavigationTarget, sanitizeNavigationTarget } from '../../../utils/contentSafety';
import 'swiper/css';
import 'swiper/css/navigation';

const normalizeServiceText = (value) => (
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
);

const getServiceBannerClassName = (service) => {
  const serviceText = normalizeServiceText(`${service.name || ''} ${service.link_url || ''}`);

  if (serviceText.includes('moby')) {
    return 'service-banner service-banner-moby';
  }

  return 'service-banner';
};

const ServiceBanner = ({ service }) => {
  const imageSrc = service.image_url
    ? apiAssetPath(service.image_url)
    : '';
  const logoSrc = service.logo_url
    ? apiAssetPath(service.logo_url)
    : '';
  const safeLinkUrl = sanitizeNavigationTarget(service.link_url, { allowExternal: true, allowRelative: true });
  const shouldUseExternalLink = Boolean(service.is_external || isExternalNavigationTarget(safeLinkUrl));
  const bannerClassName = getServiceBannerClassName(service);

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
      {logoSrc && (
        <img
          src={logoSrc}
          alt=""
          aria-hidden="true"
          className="service-banner-logo"
          loading="lazy"
          fetchPriority="low"
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      )}
      {safeLinkUrl && (
        <span className="service-banner-corner" aria-hidden="true">
          <span className="service-banner-corner-icon">
            <ChevronRight size={22} strokeWidth={2.15} />
          </span>
        </span>
      )}
    </>
  );

  if (!safeLinkUrl) {
    return (
      <div
        className={bannerClassName}
        aria-label={service.name}
      >
        {bannerContent}
      </div>
    );
  }

  if (shouldUseExternalLink) {
    return (
      <a
        href={safeLinkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={bannerClassName}
        aria-label={service.name}
      >
        {bannerContent}
      </a>
    );
  }

  return (
    <Link
      to={safeLinkUrl}
      className={bannerClassName}
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
          slidesPerView={2}
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
