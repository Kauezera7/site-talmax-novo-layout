import React, { useEffect, useRef, useState } from 'react';
import { assetPath } from '../../utils/assets';
import './HistoriaDiretoria.css';

const HistoriaDiretoria = () => {
  const [isMobileCards, setIsMobileCards] = useState(() => (
    typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(max-width: 768px)').matches
  ));
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const cardRefs = useRef([]);
  const activeCardIndexRef = useRef(0);
  const manualSelectionUntilRef = useRef(0);

  const diretoriaCards = [
    {
      image: assetPath('img/imagejohnypresidente.png'),
      name: 'Johny de Oliveira',
      role: 'Presidente',
      quote: 'Como presidente e responsável pelas áreas Comercial e Comércio Exterior, estou muito entusiasmado com os próximos passos da empresa que visam dar ênfase à centralidade do cliente, oferecendo produtos, serviços e facilidades que otimizem o trabalho diário dos profissionais.',
      responsibilities: 'Comercial | Comércio Exterior'
    },
    {
      image: assetPath('img/imagevorleidiretoradm.png'),
      name: 'Vorlei de Oliveira',
      role: 'Diretor Administrativo',
      quote: 'Estar à frente de setores que focam no atendimento ao cliente é um grande desafio, mas precisamos seguir a versatilidade do mercado, oferecendo não apenas bons produtos e serviços, mas a confiança de uma empresa que se preocupa com detalhes que fazem a diferença na vida e nos negócios dos nossos clientes.',
      responsibilities: 'Logística | Produção | Marketing | Regulatório | Recursos Humanos | Talmax Cursos'
    },
    {
      image: assetPath('img/imageclaudineyopera.png'),
      name: 'Claudiney Franco',
      role: 'Diretor Financeiro Operacional',
      quote: 'O objetivo é implantar novas tecnologias e processos que visem melhorar não apenas o atendimento, mas também os serviços oferecidos aos clientes, desde a realização de pedidos, emissão de notas, até a entrega dos produtos. Queremos oferecer a melhor experiência aqui na Talmax.',
      responsibilities: 'Financeiro | Contabilidade | Tecnologia da Informação | Compras | Pós-Vendas'
    },
    {
      image: assetPath('img/imagediogomob.png'),
      name: 'Diogo de Oliveira',
      role: 'Diretor Mobiliário',
      quote: 'Estar à frente da área Moby Work, uma linha completa de móveis, acessórios e projetos planejados é um grande desafio. Queremos atender todas as clínicas e laboratórios do Brasil, oferecendo soluções inteligentes que dinamizam o trabalho e aumentam a produtividade dos profissionais deste segmento.',
      responsibilities: 'Moby Work'
    }
  ];

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const syncMobileState = (event) => {
      setIsMobileCards(event.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncMobileState);
      return () => mediaQuery.removeEventListener('change', syncMobileState);
    }

    mediaQuery.addListener(syncMobileState);
    return () => mediaQuery.removeListener(syncMobileState);
  }, []);

  useEffect(() => {
    activeCardIndexRef.current = activeCardIndex;
  }, [activeCardIndex]);

  useEffect(() => {
    if (!isMobileCards) {
      return undefined;
    }

    let animationFrameId = 0;

    const updateActiveCard = () => {
      animationFrameId = 0;

      if (Date.now() < manualSelectionUntilRef.current) {
        return;
      }

      const availableCards = cardRefs.current.filter(Boolean);

      if (availableCards.length === 0) {
        return;
      }

      const viewportAnchor = window.innerHeight * 0.42;
      let nextIndex = activeCardIndexRef.current;
      let bestScore = Number.POSITIVE_INFINITY;

      availableCards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + (rect.height / 2);
        const distanceToAnchor = Math.abs(cardCenter - viewportAnchor);
        const cardIndex = Number(card.dataset.cardIndex);

        if (Number.isNaN(cardIndex)) {
          return;
        }

        const stabilityBias = cardIndex === activeCardIndexRef.current ? 80 : 0;
        const score = distanceToAnchor - stabilityBias;

        if (score < bestScore) {
          bestScore = score;
          nextIndex = cardIndex;
        }
      });

      if (nextIndex !== activeCardIndexRef.current) {
        activeCardIndexRef.current = nextIndex;
        setActiveCardIndex(nextIndex);
      }
    };

    const requestActiveCardUpdate = () => {
      if (animationFrameId) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(updateActiveCard);
    };

    requestActiveCardUpdate();
    window.addEventListener('scroll', requestActiveCardUpdate, { passive: true });
    window.addEventListener('resize', requestActiveCardUpdate);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener('scroll', requestActiveCardUpdate);
      window.removeEventListener('resize', requestActiveCardUpdate);
    };
  }, [isMobileCards]);

  return (
    <div className="historia-diretoria-page">
    
      <section className="historia-diretoria-hero">
        <div className="historia-diretoria-content">
          <span className="historia-diretoria-tag">Institucional</span>
          <h1>História & Diretoria</h1>
          <p>
            Conheça a trajetória da Talmax e a liderança que construiu nossa história com
            visão, inovação e compromisso com a excelência.
          </p>
        </div>
      </section>

      <section className="historia-diretoria-image-section">
        <div className="historia-diretoria-image-card">
          <img src={assetPath('img/diretoria.png')} alt="História e Diretoria Talmax" />
        </div>

        <div className="historia-diretoria-text-block">
          <p>
            Talmax, transformando ações em novas conquistas aos seus clientes e colaboradores.
            Os novos planos para alcançar resultados diferenciados, vêm de encontro com a
            reestruturação organizacional na alta gestão, visando atender não apenas a evolução,
            mas também as necessidades do mercado.
          </p>
          <p>
            Somos líder no mercado de produtos e serviços para Prótese Odontológica.
          </p>
        </div>

        <div className="historia-diretoria-map-card">
          <img src={assetPath('img/mapadiretoria.png.webp')} alt="Mapa de diretoria Talmax" />
        </div>

        <div className="historia-diretoria-people-grid">
          {diretoriaCards.map((card, index) => (
            <div
              key={card.image}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
              data-card-index={index}
              className={`flip-card ${isMobileCards && activeCardIndex === index ? 'is-active' : ''}`}
              onClick={() => {
                if (isMobileCards) {
                  manualSelectionUntilRef.current = Date.now() + 450;
                  activeCardIndexRef.current = index;
                  setActiveCardIndex(index);
                }
              }}
            >
              <div className="flip-card-inner">
                <div className="flip-card-front historia-diretoria-person-card">
                  <img
                    src={card.image}
                    alt={`Diretoria Talmax ${index + 1}`}
                    className="historia-diretoria-person-image"
                  />
                </div>
                <div className="flip-card-back">
                  <p className="title">{card.name}</p>
                  <p className="flip-card-role">{card.role}</p>
                  <p className="flip-card-quote">"{card.quote}"</p>
                  <p className="flip-card-label">Responsável pelas áreas:</p>
                  <p className="flip-card-responsibilities">{card.responsibilities}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="historia-diretoria-final-text">
          <p>Seja bem-vindo a nova Talmax!</p>
        </div>
      </section>
    </div>
  );
};

export default HistoriaDiretoria;
