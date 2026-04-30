/**
 * Componente: HeroSlider
 * Uso: pagina Home
 * Responsabilidade: banner principal da pagina inicial
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import { slides as staticSlides } from '../../data';
import API_URL from '../../services/api';
import { apiAssetPath } from '../../utils/assets';
import { isExternalNavigationTarget, sanitizeNavigationTarget } from '../../utils/contentSafety';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './HeroSlider.css';

const LOADER_DELAY_MS = 1000;

const HeroSlider = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [sliderHeight, setSliderHeight] = useState(null);
  const swiperRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const measureActiveBanner = () => {
    const swiper = swiperRef.current;
    const container = containerRef.current;
    if (!swiper || !container) return;

    const activeSlide = swiper.slides?.[swiper.activeIndex];
    const activeImage = activeSlide?.querySelector('.banner-img');
    if (!activeImage) return;

    const updateHeight = () => {
      const containerWidth = container.clientWidth;
      const naturalWidth = activeImage.naturalWidth;
      const naturalHeight = activeImage.naturalHeight;

      if (!containerWidth || !naturalWidth || !naturalHeight) return;

      const nextHeight = Math.ceil(containerWidth * (naturalHeight / naturalWidth));
      if (nextHeight > 0) {
        setSliderHeight(nextHeight);
      }
    };

    if (activeImage.complete) {
      window.requestAnimationFrame(updateHeight);
    } else {
      activeImage.addEventListener('load', updateHeight, { once: true });
    }
  };

  const handleBannerClick = (linkUrl) => {
    const safeTarget = sanitizeNavigationTarget(linkUrl, { allowExternal: true, allowRelative: true });

    if (!safeTarget) return;

    if (isExternalNavigationTarget(safeTarget)) {
      window.location.href = safeTarget;
      return;
    }

    navigate(safeTarget);
  };

  useEffect(() => {
    if (!loading) {
      setShowLoadingIndicator(false);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setShowLoadingIndicator(true);
    }, LOADER_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loading]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_URL}/banners`);

        if (response.ok) {
          const data = await response.json();
          const activeBanners = data.filter((banner) => banner.active);
          setBanners(activeBanners.length > 0 ? activeBanners : staticSlides);
        } else {
          setBanners(staticSlides);
        }
      } catch (error) {
        console.error('Erro ao buscar banners:', error);
        setBanners(staticSlides);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    const handleResize = () => measureActiveBanner();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    if (!showLoadingIndicator) {
      return null;
    }

    return (
      <section className="hero-slider-container hero-slider-loading">
        <div className="spinner"></div>
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section
      ref={containerRef}
      className="hero-slider-container hero-slider-container--with-actions"
      style={sliderHeight ? { height: `${sliderHeight}px` } : undefined}
    >
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          window.requestAnimationFrame(measureActiveBanner);
        }}
        onAfterInit={measureActiveBanner}
        onSlideChangeTransitionEnd={measureActiveBanner}
        onResize={measureActiveBanner}
        spaceBetween={0}
        autoHeight={true}
        observer={true}
        observeParents={true}
        updateOnWindowResize={true}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1200}
        loop={banners.length > 1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: false,
        }}
        navigation={banners.length > 1}
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        className="hero-swiper"
        style={sliderHeight ? { height: `${sliderHeight}px` } : undefined}
      >
        {banners.map((slide, index) => {
          const safeLinkUrl = sanitizeNavigationTarget(slide.link_url, { allowExternal: true, allowRelative: true });

          return (
            <SwiperSlide key={slide.id}>
              <div
                className="slide-content"
                style={{ cursor: safeLinkUrl ? 'pointer' : 'default' }}
                onClick={() => handleBannerClick(slide.link_url)}
              >
                <img
                  src={slide.image_url ? apiAssetPath(slide.image_url) : slide.image}
                  alt={slide.title}
                  className="banner-img"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'low'}
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                  onLoad={measureActiveBanner}
                />
                <span className="hero-slide-action-corner" aria-hidden="true">
                  <span className="hero-slide-cta">
                    Saiba Mais
                    <ChevronRight size={30} strokeWidth={1.8} />
                  </span>
                </span>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
};

export default HeroSlider;
