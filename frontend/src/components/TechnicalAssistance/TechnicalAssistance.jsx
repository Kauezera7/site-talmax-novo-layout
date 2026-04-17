import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Globe,
  Mail,
  MapPin,
  Phone,
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

  if (buildAddressLine(item)) {
    details.push({
      icon: 'address',
      text: buildAddressLine(item)
    });
  }

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
    actions
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

  return (
    <div className="technical-assistance-page">
      <section className="technical-assistance-hero">
        <div className="technical-assistance-hero-copy">
          <span className="technical-assistance-eyebrow">Assistencia Tecnica Talmax</span>
          <h1>Encontre um ponto de atendimento tecnico com leitura rapida e contato direto.</h1>
          <p>
            A pagina agora consome os cards cadastrados no painel administrativo para voce adicionar,
            editar e remover empresas quando precisar.
          </p>

          <div className="technical-assistance-hero-badges">
            <span>
              <ShieldCheck size={16} />
              Rede credenciada
            </span>
            <span>
              <Wrench size={16} />
              Contato direto por card
            </span>
          </div>
        </div>

        <div className="technical-assistance-hero-visual">
          <div className="technical-assistance-hero-photo-frame">
            <img
              src={assetPath('img/assistenciatecnica-2.jpg.webp')}
              alt="Equipe da assistencia tecnica Talmax"
            />
          </div>
        </div>
      </section>

      <section className="technical-assistance-directory">
        <div className="technical-assistance-directory-copy">
          <span className="technical-assistance-section-label">Pontos e canais</span>
          <h2>Encontre uma empresa, confira os contatos e abra o mapa ou site em um clique.</h2>
          <p>
            Cada card abaixo vem direto da tabela de assistencia tecnica no banco de dados.
          </p>
        </div>

        {status === 'loading' ? (
          <div className="technical-assistance-empty-state">
            <Wrench size={28} />
            <p>Carregando cards da assistencia tecnica...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="technical-assistance-empty-state">
            <Globe size={28} />
            <p>
              {status === 'error'
                ? 'Nao foi possivel carregar os cards da assistencia tecnica agora.'
                : 'Nenhum card de assistencia tecnica foi cadastrado ainda.'}
            </p>
          </div>
        ) : (
          <div className="technical-assistance-card-grid">
            {cards.map((card) => (
              <article key={card.id} className="technical-assistance-card">
                <div className="technical-assistance-card-glow" aria-hidden="true" />
                <span className="technical-assistance-card-eyebrow">
                  {card.eyebrowPrefix} <strong>{card.eyebrowHighlight}</strong>
                </span>
                <h3>{card.title}</h3>

                <div className="technical-assistance-card-details">
                  {card.details.map(renderDetail)}
                </div>

                {card.actions.length > 0 && (
                  <div className="technical-assistance-card-actions">
                    {card.actions.map((action) => (
                      <a
                        key={`${card.id}-${action.label}`}
                        href={action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="technical-assistance-card-action"
                      >
                        {action.label}
                        <ArrowUpRight size={16} />
                      </a>
                    ))}
                  </div>
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
