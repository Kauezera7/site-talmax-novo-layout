import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Globe,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Wrench
} from 'lucide-react';
import { assetPath } from '../../utils/assets';
import technicalAssistanceService from '../../services/technicalAssistanceService';
import './TechnicalAssistance.css';

const detailIcons = {
  address: MapPin,
  phone: Phone,
  email: Mail
};

const TECHNICAL_TICKET_URL = 'https://talmax.tomticket.com/';

const buildTelHref = (value = '') => {
  const digits = String(value || '').replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : '';
};

const buildAddressLine = (item) => {
  const addressParts = [item.address, item.city && item.state_code ? `${item.city} - ${item.state_code}` : item.city || item.state_code]
    .filter(Boolean);

  return addressParts.join(', ');
};

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
  const [status, setStatus] = useState('loading');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let active = true;

    const loadItems = async () => {
      try {
        const data = await technicalAssistanceService.getAll();

        if (!active) {
          return;
        }

        setItems(Array.isArray(data) ? data : []);
        setStatus('ready');
      } catch (error) {
        console.error('Erro ao carregar cards da assistencia tecnica:', error);

        if (active) {
          setItems([]);
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

  return (
    <div
      className="technical-assistance-page"
      style={{ '--technical-hero-image': `url("${assetPath('img/assistenciatecnica-2.jpg.webp')}")` }}
    >
      <section className="technical-assistance-hero">
        <div className="technical-assistance-hero-inner">
          <div className="technical-assistance-brand" aria-label="Logo Assistencia Talmax">
            <div className="technical-assistance-brand-mark" aria-hidden="true">
              <ShieldCheck size={38} strokeWidth={1.7} />
              <span>Assist&ecirc;ncia</span>
              <strong>Talmax</strong>
            </div>
            <p>Assist&ecirc;ncia t&eacute;cnica autorizada</p>
          </div>

          <p className="technical-assistance-hero-tagline">
            Confian&ccedil;a em cada servi&ccedil;o, com pe&ccedil;as originais e alto padr&atilde;o de qualidade.
          </p>
        </div>
      </section>

      <section className="technical-assistance-service-banner">
        <a
          href={TECHNICAL_TICKET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="technical-assistance-info-card"
        >
          <span className="technical-assistance-info-card__content">
            <strong>Assist&ecirc;ncia T&eacute;cnica</strong>
            <span>
              Um time altamente especializado em qualidade, pronto para entregar rapidez,
              precis&atilde;o e seguran&ccedil;a na manuten&ccedil;&atilde;o dos seus equipamentos.
            </span>
            <span>
              Trabalhamos para reduzir o tempo de parada e garantir o m&aacute;ximo desempenho,
              levando mais confian&ccedil;a e excel&ecirc;ncia a cada atendimento.
            </span>
          </span>

          <span className="technical-assistance-info-card__corner" aria-hidden="true">
            <span className="technical-assistance-info-card__button">
              Abrir chamado
              <ArrowRight size={18} strokeWidth={1.8} />
            </span>
          </span>
        </a>
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
              onChange={(event) => setSearchTerm(event.target.value)}
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
          <div className="technical-assistance-card-grid">
            {visibleCards.length === 0 ? (
              <div className="technical-assistance-empty-state technical-assistance-empty-state-wide">
                <Search size={28} />
                <p>Nenhuma assist&ecirc;ncia autorizada encontrada para a busca informada.</p>
              </div>
            ) : visibleCards.map((card) => (
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
        )}
      </section>
    </div>
  );
};

export default TechnicalAssistance;
