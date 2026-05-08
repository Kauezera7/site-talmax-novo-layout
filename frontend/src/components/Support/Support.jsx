import React, { useEffect, useMemo, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';
import { ArrowRight, CalendarDays, Clock, Rocket } from 'lucide-react';
import { assetPath } from '../../utils/assets';
import './Support.css';

const FOUNDATION_DATE = new Date('1994-08-01T00:00:00');
const SUPPORT_MONTHS = 180;
const SUPPORT_HOURS = 131400;

const supportCards = [
  {
    title: 'Suporte Digital',
    description: [
      'Uma equipe especializada em gerar resultados reais para o seu negócio. Oferecemos atendimento personalizado desde a aquisição do sistema CAD/CAM, com treinamentos práticos, orientação completa no uso de softwares e produtos, e um suporte pós-venda próximo e contínuo.',
      'Estamos ao lado de laboratórios e clínicas em 24 estados e 95 municípios, garantindo performance, segurança e evolução constante.',
    ],
    link: 'https://talmax.com.br/suportetalmax/',
    variant: 'solid',
  },
  {
    title: 'Suporte de Produto',
    description: [
      'Mais do que suporte, entregamos soluções.',
      'Comprometido em entregar soluções eficientes, nosso time de produtos oferece um suporte técnico especializado para cada necessidade. Trabalhamos com materiais desenvolvidos a partir de rigorosos processos de pesquisa, análise e testes, garantindo qualidade, confiabilidade e segurança em cada aplicação.',
    ],
    link: 'https://talmax.tomticket.com/?account=3097344P21072020051958',
    variant: 'outline',
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

const Support = () => {
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

  return (
    <main className="support-page">
      <section className="support-hero" aria-label="Suporte Talmax">
        <div className="support-hero-content">
          <img
            src={assetPath('img/logo-talmax-suporte.png.webp')}
            alt="Suporte Talmax"
            className="support-main-logo"
          />
          <p>Estamos com você todos os dias, investindo em soluções, tecnologias e pessoas.</p>
        </div>
      </section>

      <section className="support-service-section" aria-label="Canais de suporte">
        <div className="support-service-grid">
          {supportCards.map((card) => (
            <a
              key={card.title}
              href={card.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`support-service-card support-service-card--${card.variant}`}
            >
              <span className="support-service-card__content">
                <strong>{card.title}</strong>
                {card.description.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </span>

              <span className="support-service-card__corner" aria-hidden="true">
                <span className="support-service-card__button">
                  Saiba mais
                  <ArrowRight size={18} strokeWidth={1.8} />
                </span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="support-info">
        <div className="support-copy">
          <h1>Ao seu lado em cada resultado</h1>
          <strong>Atendimento especializado, ágil e conectado para impulsionar seus resultados todos os dias</strong>
          <p>
            Na Talmax, suporte vai além do atendimento. É parceria no seu dia a dia. Investimos continuamente em tecnologia,
            processos e pessoas para entregar uma experiência ágil, próxima e realmente eficiente.
          </p>
          <p>
            Nosso time está preparado para entender suas demandas e transformar desafios em soluções, trazendo mais dinamismo,
            segurança e excelência para a rotina de técnicos e dentistas em laboratórios, clínicas e dentais em todo o Brasil.
          </p>
          <p>
            Com uma plataforma digital completa, você tem acesso a abertura de chamados, atendimento via chat, histórico integrado
            e um portal de conhecimento sempre disponível para apoiar sua operação.
          </p>
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
