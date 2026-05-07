import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Globe,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Wrench
} from 'lucide-react';
import { apiAssetPath, assetPath } from '../../utils/assets';
import pageSettingsService, { DEFAULT_SPECIAL_PAGE_SETTINGS, normalizeSpecialPageSettings } from '../../services/pageSettingsService';
import technicalAssistanceService from '../../services/technicalAssistanceService';
import './TechnicalAssistance.css';

const detailIcons = {
  address: MapPin,
  phone: Phone,
  email: Mail
};

const DEFAULT_TECHNICAL_PAGE_SETTINGS = DEFAULT_SPECIAL_PAGE_SETTINGS['assistencia-tecnica'];
const ITEMS_PER_PAGE = 10;

const CustomPagination = ({ total, current, onChange }) => {
  const pages = [];

  for (let i = 1; i <= total; i += 1) {
    pages.push(i);
  }

  const visiblePages = pages.filter((page) => (
    page === 1 || page === total || (page >= current - 2 && page <= current + 2)
  ));
  const renderPages = [];
  let lastPage = 0;

  visiblePages.forEach((page) => {
    if (lastPage !== 0 && page - lastPage > 1) {
      renderPages.push(
        <span key={`dots-${page}`} className="technical-assistance-pagination__dots">...</span>
      );
    }

    renderPages.push(
      <button
        key={page}
        type="button"
        className={`technical-assistance-pagination__button${current === page ? ' is-active' : ''}`}
        onClick={() => onChange(page)}
        aria-current={current === page ? 'page' : undefined}
      >
        {page}
      </button>
    );

    lastPage = page;
  });

  return (
    <div className="technical-assistance-pagination__nav">
      <button
        type="button"
        className="technical-assistance-pagination__arrow"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        aria-label="Pagina anterior"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="technical-assistance-pagination__numbers">
        {renderPages}
      </div>

      <button
        type="button"
        className="technical-assistance-pagination__arrow"
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        aria-label="Proxima pagina"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

const buildTelHref = (value = '') => {
  const digits = String(value || '').replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : '';
};

const buildAddressLine = (item) => {
  const addressParts = [item.address, item.city && item.state_code ? `${item.city} - ${item.state_code}` : item.city || item.state_code]
    .filter(Boolean);

  return addressParts.join(', ');
};

const resolvePageImage = (value, fallbackValue) => {
  const imageValue = String(value || '').trim();

  if (!imageValue) {
    return fallbackValue ? assetPath(fallbackValue.replace(/^\/+/, '')) : '';
  }

  return apiAssetPath(imageValue);
};

const splitSettingText = (value = '') => (
  String(value || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
);

const mapContentCardToServiceCard = (card) => ({
  id: `content-card-${card.id}`,
  href: String(card.link_url || '').trim(),
  title: card.title || DEFAULT_TECHNICAL_PAGE_SETTINGS.card_title,
  buttonLabel: card.button_label || DEFAULT_TECHNICAL_PAGE_SETTINGS.card_button_label,
  descriptionLines: [
    ...splitSettingText(card.description),
    ...splitSettingText(card.description_secondary)
  ]
});

const mapTechnicalAssistanceItemToCard = (item) => {
  const details = [];
  const actions = [];
  const primaryActionHref = item.email
    ? `mailto:${item.email}`
    : buildTelHref(item.phone) || item.site_url || item.map_url || '';

  if (item.phone) {
    details.push({
      icon: 'phone',
      text: item.phone,
      href: buildTelHref(item.phone)
    });
  }

  if (item.phone_2) {
    details.push({
      icon: 'phone',
      text: item.phone_2,
      href: buildTelHref(item.phone_2)
    });
  }

  if (item.phone_3) {
    details.push({
      icon: 'phone',
      text: item.phone_3,
      href: buildTelHref(item.phone_3)
    });
  }

  if (item.email) {
    details.push({
      icon: 'email',
      text: item.email,
      href: `mailto:${item.email}`
    });
  }

  if (buildAddressLine(item)) {
    details.push({
      icon: 'address',
      text: buildAddressLine(item)
    });
  }

  if (item.map_url) {
    actions.push({
      label: 'Como chegar',
      href: item.map_url
    });
  }

  if (item.site_url) {
    actions.push({
      label: 'Abrir site',
      href: item.site_url
    });
  }

  return {
    id: item.id,
    eyebrowPrefix: item.state_code || 'UF',
    eyebrowHighlight: item.city || 'Cidade',
    title: item.company,
    details,
    actions,
    primaryActionHref,
    searchText: [
      item.company,
      item.city,
      item.state_code,
      item.address,
      item.phone,
      item.phone_2,
      item.phone_3,
      item.email
    ]
      .filter(Boolean)
      .join(' ')
  };
};

const renderDetail = (detail, index) => {
  const Icon = detailIcons[detail.icon] || MapPin;
  const content = (
    <>
      <span className="technical-assistance-card-detail-icon" aria-hidden="true">
        <Icon size={15} />
      </span>
      <span>{detail.text}</span>
    </>
  );

  if (detail.href) {
    const isDirectLink = /^(?:tel:|mailto:)/i.test(detail.href);

    return (
      <a
        key={`${detail.text}-${index}`}
        href={detail.href}
        className="technical-assistance-card-detail"
        target={isDirectLink ? undefined : '_blank'}
        rel={isDirectLink ? undefined : 'noopener noreferrer'}
      >
        {content}
      </a>
    );
  }

  return (
    <div key={`${detail.text}-${index}`} className="technical-assistance-card-detail">
      {content}
    </div>
  );
};

const TechnicalAssistance = () => {
  const [items, setItems] = useState([]);
  const [contentCards, setContentCards] = useState([]);
  const [status, setStatus] = useState('loading');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSettings, setPageSettings] = useState(DEFAULT_TECHNICAL_PAGE_SETTINGS);

  useEffect(() => {
    let active = true;

    const loadItems = async () => {
      try {
        const [data, pageSettingsItems, contentCardsData] = await Promise.all([
          technicalAssistanceService.getAll(),
          pageSettingsService.getAll().catch(() => []),
          technicalAssistanceService.getContentCards().catch(() => [])
        ]);

        if (!active) {
          return;
        }

        setItems(Array.isArray(data) ? data : []);
        setContentCards(Array.isArray(contentCardsData) ? contentCardsData : []);
        setPageSettings(
          normalizeSpecialPageSettings(pageSettingsItems)['assistencia-tecnica']
          || DEFAULT_TECHNICAL_PAGE_SETTINGS
        );
        setStatus('ready');
      } catch (error) {
        console.error('Erro ao carregar cards da assistencia tecnica:', error);

        if (active) {
          setItems([]);
          setContentCards([]);
          setStatus('error');
        }
      }
    };

    loadItems();

    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo(
    () => items.map(mapTechnicalAssistanceItemToCard),
    [items]
  );

  const visibleCards = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('pt-BR');

    if (!normalizedSearch) {
      return cards;
    }

    return cards.filter((card) => (
      card.searchText.toLocaleLowerCase('pt-BR').includes(normalizedSearch)
    ));
  }, [cards, searchTerm]);

  const totalPages = Math.ceil(visibleCards.length / ITEMS_PER_PAGE);
  const currentSafePage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedCards = useMemo(() => {
    const startIndex = (currentSafePage - 1) * ITEMS_PER_PAGE;
    return visibleCards.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentSafePage, visibleCards]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const heroImage = resolvePageImage(pageSettings.banner_url, DEFAULT_TECHNICAL_PAGE_SETTINGS.banner_url);
  const logoImage = pageSettings.logo_url ? resolvePageImage(pageSettings.logo_url) : '';
  const heroDescription = pageSettings.description || DEFAULT_TECHNICAL_PAGE_SETTINGS.description;
  const serviceCards = useMemo(() => {
    const mappedContentCards = contentCards
      .map(mapContentCardToServiceCard)
      .filter((card) => card.title || card.descriptionLines.length > 0);

    if (mappedContentCards.length > 0) {
      return mappedContentCards;
    }

    return [{
      id: 'default-service-card',
      href: pageSettings.card_url || DEFAULT_TECHNICAL_PAGE_SETTINGS.card_url,
      title: pageSettings.card_title || DEFAULT_TECHNICAL_PAGE_SETTINGS.card_title,
      buttonLabel: pageSettings.card_button_label || DEFAULT_TECHNICAL_PAGE_SETTINGS.card_button_label,
      descriptionLines: [
        ...splitSettingText(pageSettings.card_description || DEFAULT_TECHNICAL_PAGE_SETTINGS.card_description),
        ...splitSettingText(pageSettings.card_description_secondary || DEFAULT_TECHNICAL_PAGE_SETTINGS.card_description_secondary)
      ]
    }];
  }, [contentCards, pageSettings]);

  return (
    <div className="technical-assistance-page">
      <section className="technical-assistance-hero">
        <img
          src={heroImage}
          alt=""
          className="technical-assistance-hero-media"
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />

        <div className="technical-assistance-hero-inner">
          <div className="technical-assistance-brand" aria-label="Logo Assistencia Talmax">
            <div className="technical-assistance-brand-content">
              {logoImage ? (
                <img
                  src={logoImage}
                  alt={pageSettings.title || 'Assistencia Tecnica'}
                  className="technical-assistance-brand-logo"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="technical-assistance-brand-mark" aria-hidden="true">
                  <ShieldCheck size={38} strokeWidth={1.7} />
                  <span>Assist&ecirc;ncia</span>
                  <strong>Talmax</strong>
                </div>
              )}
              {heroDescription && <p className="technical-assistance-brand-description">{heroDescription}</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="technical-assistance-service-banner">
        <div className="technical-assistance-service-cards">
          {serviceCards.map((serviceCard) => {
            const CardTag = serviceCard.href ? 'a' : 'article';
            const cardProps = serviceCard.href
              ? { href: serviceCard.href, target: '_blank', rel: 'noopener noreferrer' }
              : {};

            return (
              <CardTag
                key={serviceCard.id}
                {...cardProps}
                className={`technical-assistance-info-card${serviceCard.href ? '' : ' technical-assistance-info-card--static'}`}
              >
                <span className="technical-assistance-info-card__content">
                  <strong>{serviceCard.title}</strong>
                  {serviceCard.descriptionLines.map((line, index) => (
                    <span key={`${serviceCard.id}-line-${index}`}>{line}</span>
                  ))}
                </span>

                {serviceCard.href && (
                  <span className="technical-assistance-info-card__corner" aria-hidden="true">
                    <span className="technical-assistance-info-card__button">
                      {serviceCard.buttonLabel}
                      <ArrowRight size={18} strokeWidth={1.8} />
                    </span>
                  </span>
                )}
              </CardTag>
            );
          })}
        </div>
      </section>

      <section className="technical-assistance-directory">
        <div className="technical-assistance-directory-header" id="rede-autorizada">
          <div className="technical-assistance-directory-copy">
            <h2>Assist&ecirc;ncia T&eacute;cnica Autorizada Talmax</h2>
            <strong>Mais agilidade, pe&ccedil;as originais e suporte autorizado sempre ao seu alcance</strong>
            <p>
              Uma rede preparada para oferecer agilidade, seguran&ccedil;a e qualidade em cada atendimento.
              Conte com pe&ccedil;as originais, manuten&ccedil;&atilde;o eficiente e t&eacute;cnicos treinados diretamente pelos fabricantes.
            </p>
            <p>
              Encontre no mapa a assist&ecirc;ncia t&eacute;cnica autorizada mais pr&oacute;xima de voc&ecirc;.
            </p>
          </div>

          <label className="technical-assistance-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Rua Benedito Carollo, 890, Cidade Industrial Curitiba - Paran&aacute;"
              aria-label="Buscar assistencia tecnica autorizada"
            />
          </label>
        </div>

        {status === 'loading' ? (
          <div className="technical-assistance-empty-state">
            <Wrench size={28} />
            <p>Carregando cards da assist&ecirc;ncia t&eacute;cnica...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="technical-assistance-empty-state">
            <Globe size={28} />
            <p>
              {status === 'error'
                ? 'N\u00e3o foi poss\u00edvel carregar os cards da assist\u00eancia t\u00e9cnica agora.'
                : 'Nenhum card de assist\u00eancia t\u00e9cnica foi cadastrado ainda.'}
            </p>
          </div>
        ) : (
          <>
            <div className="technical-assistance-card-grid">
              {visibleCards.length === 0 ? (
                <div className="technical-assistance-empty-state technical-assistance-empty-state-wide">
                  <Search size={28} />
                  <p>Nenhuma assist&ecirc;ncia autorizada encontrada para a busca informada.</p>
                </div>
              ) : paginatedCards.map((card) => (
                <article key={card.id} className="technical-assistance-card">
                  <span className="technical-assistance-card-eyebrow">
                    {card.eyebrowPrefix} <strong>{card.eyebrowHighlight}</strong>
                  </span>
                  <h3>{card.title}</h3>

                  <div className="technical-assistance-card-details">
                    {card.details.map(renderDetail)}
                  </div>

                  {card.primaryActionHref && (
                    <a
                      href={card.primaryActionHref}
                      className="technical-assistance-card-primary"
                      aria-label={`Fale com a assistencia ${card.title}`}
                      target={/^(?:https?:)?\/\//i.test(card.primaryActionHref) ? '_blank' : undefined}
                      rel={/^(?:https?:)?\/\//i.test(card.primaryActionHref) ? 'noopener noreferrer' : undefined}
                    >
                      <ArrowRight size={16} />
                    </a>
                  )}
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="technical-assistance-pagination">
                <CustomPagination
                  total={totalPages}
                  current={currentSafePage}
                  onChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default TechnicalAssistance;
