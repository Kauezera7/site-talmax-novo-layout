import React, { useEffect, useMemo, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';
import { ArrowRight, CalendarDays, Clock, Rocket } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { apiAssetPath } from '../../utils/assets';
import pageSettingsService, { DEFAULT_SPECIAL_PAGE_SETTINGS, normalizeSpecialPageSettings } from '../../services/pageSettingsService';
import supportService from '../../services/supportService';
import 'swiper/css';
import 'swiper/css/navigation';
import './Support.css';

const FOUNDATION_DATE = new Date('1994-08-01T00:00:00');
const SUPPORT_MONTHS = 180;
const SUPPORT_HOURS = 131400;
const DEFAULT_SUPPORT_PAGE_SETTINGS = DEFAULT_SPECIAL_PAGE_SETTINGS.support;

const DEFAULT_SUPPORT_CARDS = [
  {
    id: 'support-digital',
    title: 'Suporte Digital',
    descriptionLines: [
      'Uma equipe especializada em gerar resultados reais para o seu negócio. Oferecemos atendimento personalizado desde a aquisição do sistema CAD/CAM, com treinamentos práticos, orientação completa no uso de softwares e produtos, e um suporte pós-venda próximo e contínuo.',
      'Estamos ao lado de laboratórios e clínicas em 24 estados e 95 municípios, garantindo performance, segurança e evolução constante.',
    ],
    href: 'https://talmax.com.br/suportetalmax/',
    buttonLabel: 'Saiba mais',
  },
  {
    id: 'support-produto',
    title: 'Suporte de Produto',
    descriptionLines: [
      'Mais do que suporte, entregamos soluções.',
      'Comprometido em entregar soluções eficientes, nosso time de produtos oferece um suporte técnico especializado para cada necessidade. Trabalhamos com materiais desenvolvidos a partir de rigorosos processos de pesquisa, análise e testes, garantindo qualidade, confiabilidade e segurança em cada aplicação.',
    ],
    href: 'https://talmax.tomticket.com/?account=3097344P21072020051958',
    buttonLabel: 'Saiba mais',
  },
];

const calculateYearsSinceFoundation = (referenceDate) => {
  const safeDate = referenceDate < FOUNDATION_DATE ? FOUNDATION_DATE : referenceDate;
  let years = safeDate.getFullYear() - FOUNDATION_DATE.getFullYear();

  const beforeAnniversary =
    safeDate.getMonth() < FOUNDATION_DATE.getMonth()
    || (
      safeDate.getMonth() === FOUNDATION_DATE.getMonth()
      && safeDate.getDate() < FOUNDATION_DATE.getDate()
    );

  if (beforeAnniversary) {
    years -= 1;
  }

  return years;
};

const formatCounterValue = (value) => value.toLocaleString('pt-BR');

const splitSettingText = (value = '') => (
  String(value || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
);

const splitInfoParagraphs = (value = '') => (
  String(value || '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
);

const resolvePageImage = (value) => {
  const imageValue = String(value || '').trim();
  return imageValue ? apiAssetPath(imageValue) : '';
};

const clampNumber = (value, fallback, min, max) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, numberValue));
};

const mapContentCardToServiceCard = (card, index) => ({
  id: `support-content-card-${card.id}`,
  href: String(card.link_url || '').trim(),
  title: card.title || DEFAULT_SUPPORT_CARDS[index]?.title || 'Suporte',
  buttonLabel: card.button_label || 'Saiba mais',
  descriptionLines: [
    ...splitSettingText(card.description),
    ...splitSettingText(card.description_secondary)
  ]
});

const Counter = ({ value, duration = 1.8 }) => {
  const [displayValue, setDisplayValue] = useState(() => formatCounterValue(value));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) {
      return undefined;
    }

    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(formatCounterValue(Math.floor(latest)));
      },
      onComplete: () => {
        setDisplayValue(formatCounterValue(value));
      },
    });

    return () => controls.stop();
  }, [duration, isInView, value]);

  return <span ref={ref}>{displayValue}</span>;
};

const SupportServiceCard = ({ card }) => {
  const CardTag = card.href ? 'a' : 'article';
  const cardProps = card.href
    ? { href: card.href, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <CardTag
      {...cardProps}
      className={`support-service-card${card.href ? '' : ' support-service-card--static'}`}
    >
      <span className="support-service-card__content">
        <strong>{card.title}</strong>
        {card.descriptionLines.map((line, index) => (
          <span key={`${card.id}-line-${index}`}>{line}</span>
        ))}
      </span>

      {card.href && (
        <span className="support-service-card__corner" aria-hidden="true">
          <span className="support-service-card__button">
            {card.buttonLabel}
            <ArrowRight size={18} strokeWidth={1.8} />
          </span>
        </span>
      )}
    </CardTag>
  );
};

const Support = () => {
  const [pageSettings, setPageSettings] = useState(null);
  const [contentCards, setContentCards] = useState([]);

  useEffect(() => {
    let active = true;

    const loadSupportContent = async () => {
      try {
        const [pageSettingsItems, supportCardsData] = await Promise.all([
          pageSettingsService.getAll().catch(() => []),
          supportService.getContentCards().catch(() => [])
        ]);

        if (!active) {
          return;
        }

        setPageSettings(
          normalizeSpecialPageSettings(pageSettingsItems).support
          || DEFAULT_SUPPORT_PAGE_SETTINGS
        );
        setContentCards(Array.isArray(supportCardsData) ? supportCardsData : []);
      } catch (error) {
        console.error('Erro ao carregar conteudo da pagina de suporte:', error);

        if (active) {
          setPageSettings(null);
          setContentCards([]);
        }
      }
    };

    loadSupportContent();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => ([
    {
      icon: Rocket,
      value: calculateYearsSinceFoundation(new Date()),
      label: 'anos de trabalho',
    },
    {
      icon: CalendarDays,
      value: SUPPORT_MONTHS,
      label: 'meses de atendimento',
    },
    {
      icon: Clock,
      value: SUPPORT_HOURS,
      label: 'horas de dedicação',
    },
  ]), []);

  const serviceCards = useMemo(() => {
    const mappedCards = contentCards
      .map(mapContentCardToServiceCard)
      .filter((card) => card.title || card.descriptionLines.length > 0);

    return mappedCards.length > 0 ? mappedCards : DEFAULT_SUPPORT_CARDS;
  }, [contentCards]);

  const safePageSettings = pageSettings || DEFAULT_SUPPORT_PAGE_SETTINGS;
  const heroImage = pageSettings ? resolvePageImage(pageSettings.banner_url) : '';
  const logoImage = pageSettings?.logo_url ? resolvePageImage(pageSettings.logo_url) : '';
  const heroDescription = pageSettings ? String(pageSettings.description || '').trim() : '';
  const heroContentX = clampNumber(safePageSettings.hero_content_x, DEFAULT_SUPPORT_PAGE_SETTINGS.hero_content_x, 0, 100);
  const heroContentY = clampNumber(safePageSettings.hero_content_y, DEFAULT_SUPPORT_PAGE_SETTINGS.hero_content_y, 0, 100);
  const logoWidth = clampNumber(safePageSettings.logo_width, DEFAULT_SUPPORT_PAGE_SETTINGS.logo_width, 80, 520);
  const heroContentStyle = {
    '--support-hero-content-x': `${heroContentX}%`,
    '--support-hero-content-y': `${heroContentY}%`,
    '--support-hero-logo-width': `${logoWidth}px`
  };
  const infoTitle = safePageSettings.info_title || DEFAULT_SUPPORT_PAGE_SETTINGS.info_title;
  const infoSubtitle = safePageSettings.info_subtitle || DEFAULT_SUPPORT_PAGE_SETTINGS.info_subtitle;
  const infoParagraphs = splitInfoParagraphs(safePageSettings.info_body || DEFAULT_SUPPORT_PAGE_SETTINGS.info_body);
  const shouldUseCardsCarousel = serviceCards.length > 2;

  return (
    <main className="support-page">
      {heroImage && (
        <section className="support-hero support-hero--image" aria-label="Suporte Talmax">
          <img
            src={heroImage}
            alt=""
            className="support-hero-media"
            aria-hidden="true"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />

          <div className="support-hero-inner">
            <div className="support-hero-content" style={heroContentStyle}>
              {logoImage && (
                <img
                  src={logoImage}
                  alt={safePageSettings.title || 'Suporte Talmax'}
                  className="support-main-logo"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              )}
              {heroDescription && <p>{heroDescription}</p>}
            </div>
          </div>
        </section>
      )}

      <section className="support-service-section" aria-label="Canais de suporte">
        {shouldUseCardsCarousel ? (
          <div className="support-service-grid support-service-grid--carousel">
            <button
              type="button"
              className="support-service-grid__nav support-service-grid__nav-prev"
              aria-label="Card anterior"
            />
            <button
              type="button"
              className="support-service-grid__nav support-service-grid__nav-next"
              aria-label="Proximo card"
            />

            <Swiper
              modules={[Autoplay, Navigation]}
              spaceBetween={24}
              slidesPerView={1}
              loop={serviceCards.length > 1}
              navigation={{
                prevEl: '.support-service-grid__nav-prev',
                nextEl: '.support-service-grid__nav-next'
              }}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              breakpoints={{
                760: { slidesPerView: 2 },
                1180: { slidesPerView: 2 }
              }}
            >
              {serviceCards.map((card) => (
                <SwiperSlide key={card.id}>
                  <SupportServiceCard card={card} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className="support-service-grid">
            {serviceCards.map((card) => (
              <SupportServiceCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </section>

      <section className="support-info">
        <div className="support-copy">
          <h1>{infoTitle}</h1>
          {infoSubtitle && <strong>{infoSubtitle}</strong>}
          {infoParagraphs.map((paragraph, index) => (
            <p key={`support-info-${index}`}>{paragraph}</p>
          ))}
        </div>

        <div className="support-stats" aria-label="Números do suporte Talmax">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.label} className="support-stat-item">
                <span className="support-stat-prefix">+ de</span>
                <span className="support-stat-value">
                  <Icon size={28} strokeWidth={1.8} aria-hidden="true" />
                  <strong>
                    <Counter value={stat.value} />
                  </strong>
                </span>
                <span className="support-stat-label">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default Support;
