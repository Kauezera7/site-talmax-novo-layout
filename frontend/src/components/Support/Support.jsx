import React, { useEffect, useMemo, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { assetPath } from '../../utils/assets';
import './Support.css';

const FOUNDATION_DATE = new Date('1994-08-01T00:00:00');
const DAILY_WORK_HOURS = 8;
const COMPANY_BREAK_BUSINESS_DAYS = 10;

const formatDateKey = (date) => date.toISOString().slice(0, 10);

const addDays = (date, amount) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
};

const getEasterSunday = (year) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
};

const getBrazilNationalHolidays = (year) => {
  const easter = getEasterSunday(year);

  return new Set([
    formatDateKey(new Date(year, 0, 1)),
    formatDateKey(new Date(year, 3, 21)),
    formatDateKey(addDays(easter, -48)),
    formatDateKey(addDays(easter, -47)),
    formatDateKey(addDays(easter, -2)),
    formatDateKey(new Date(year, 4, 1)),
    formatDateKey(addDays(easter, 60)),
    formatDateKey(new Date(year, 8, 7)),
    formatDateKey(new Date(year, 9, 12)),
    formatDateKey(new Date(year, 10, 2)),
    formatDateKey(new Date(year, 10, 15)),
    formatDateKey(new Date(year, 11, 25)),
  ]);
};

const getCompanyBreakDays = (year) => {
  const breakDays = new Set();
  const currentDate = new Date(year, 11, 22);

  while (breakDays.size < COMPANY_BREAK_BUSINESS_DAYS) {
    const weekDay = currentDate.getDay();

    if (weekDay !== 0 && weekDay !== 6) {
      breakDays.add(formatDateKey(currentDate));
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return breakDays;
};

const calculateBusinessHours = (startDate, endDate) => {
  const currentDate = new Date(startDate);
  let totalHours = 0;

  while (currentDate <= endDate) {
    const weekDay = currentDate.getDay();
    const year = currentDate.getFullYear();
    const dateKey = formatDateKey(currentDate);
    const isWeekend = weekDay === 0 || weekDay === 6;
    const isHoliday = getBrazilNationalHolidays(year).has(dateKey);
    const isCompanyBreak = getCompanyBreakDays(year).has(dateKey);

    if (!isWeekend && !isHoliday && !isCompanyBreak) {
      totalHours += DAILY_WORK_HOURS;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return totalHours;
};

const calculateCompanyStats = (referenceDate) => {
  const safeDate = referenceDate < FOUNDATION_DATE ? FOUNDATION_DATE : referenceDate;
  let years = safeDate.getFullYear() - FOUNDATION_DATE.getFullYear();
  let months = safeDate.getMonth() - FOUNDATION_DATE.getMonth();

  if (safeDate.getDate() < FOUNDATION_DATE.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return {
    years,
    months: years * 12 + months,
    hours: calculateBusinessHours(FOUNDATION_DATE, safeDate),
  };
};

const Counter = ({ value, duration = 2 }) => {
  const [displayValue, setDisplayValue] = useState('0');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const numericTarget = typeof value === 'string'
    ? parseInt(value.replace(/\./g, ''), 10)
    : value;

  useEffect(() => {
    if (!isInView) {
      return undefined;
    }

    const controls = animate(0, numericTarget, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(Math.floor(latest).toLocaleString('pt-BR'));
      },
    });

    return () => controls.stop();
  }, [duration, isInView, numericTarget]);

  return <span ref={ref}>{displayValue}</span>;
};

const Support = () => {
  const [referenceDate, setReferenceDate] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setReferenceDate(new Date());
    }, 60 * 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const stats = useMemo(() => calculateCompanyStats(referenceDate), [referenceDate]);

  const supportCards = [
    {
      title: 'Suporte Digital',
      image: assetPath('img/suportedigital.webp'),
      description: 'Uma equipe especializada em RESULTADOS, com atendimentos personalizados a partir da compra do Sistema CAD/CAM, no treinamento para utilização correta dos softwares e produtos, até o atendimento pós-venda aos clientes de diversos laboratórios e clínicas, distribuídos em 24 estados e 95 municípios.',
      link: 'https://talmax.com.br/suportetalmax/',
    },
    {
      title: 'Suporte Produtos',
      image: assetPath('img/suporteproduto-2.jpg.webp'),
      description: 'Com o compromisso de oferecer um suporte técnico singular, o time de produtos é especializado em SOLUÇÕES para suprir as mais diversas situações relacionadas ao uso de cada material, os quais passam por criteriosa pesquisa, análise e testes de qualidade e confiabilidade.',
      link: 'https://talmax.tomticket.com/?account=3097344P21072020051958',
    },
    {
      title: 'Assistência Técnica',
      image: assetPath('img/assistenciatecnica-2.jpg.webp'),
      description: 'Um time especializado em QUALIDADE, a Assistência Técnica proporciona rapidez e agilidade no serviço de manutenção técnica de todos os produtos comercializados pela Talmax, além de ministrar treinamentos para a capacitação da rede credenciada no Brasil.',
      link: 'https://talmax.tomticket.com/',
    },
  ];

  return (
    <div className="support-container">
      <section className="support-hero">
        <div className="support-hero-content">
          <img
            src={assetPath('img/logo-talmax-suporte.png.webp')}
            alt="Logo Suporte Talmax"
            className="support-main-logo"
          />
          <p>Estamos com você todos os dias, investindo em soluções, tecnologias e pessoas.</p>
        </div>
      </section>

      <section className="support-grid-section">
        <div className="support-grid">
          {supportCards.map((card) => (
            <div key={card.title} className="support-card">
              <div className="support-card-image">
                <img src={card.image} alt={card.title} />
              </div>
              <div className="support-card-body">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <a
                  href={card.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="support-button"
                >
                  Abrir Chamado <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="support-info">
        <div className="support-description">
          <p>
            <strong>A Talmax está com você todos os dias, investindo em soluções, tecnologias e pessoas.</strong> Por isso contamos com um time que realmente quer entender a sua necessidade, visando agregar mais dinamismo, facilidades e excelência aos trabalhos realizados pelos técnicos e dentistas de laboratórios, clínicas e dentais de todo o Brasil.
          </p>
          <p>
            Com atendimentos online por meio de uma plataforma completa que oferece abertura de ticket e chat, base colaborativa com o histórico de cada caso e portal do conhecimento, o Suporte Talmax é dividido em três áreas: Suporte Digital, Suporte Produtos e Assistência Técnica.
          </p>
        </div>

        <div className="support-stats">
          <div className="stat-item">
            <span className="stat-prefix">+ de</span>
            <h2 className="stat-number">
              <Counter value={stats.years} />
            </h2>
            <span className="stat-label">anos de trabalho</span>
          </div>
          <div className="stat-item">
            <span className="stat-prefix">+ de</span>
            <h2 className="stat-number">
              <Counter value={stats.months} />
            </h2>
            <span className="stat-label">meses de atendimento</span>
          </div>
          <div className="stat-item">
            <span className="stat-prefix">+ de</span>
            <h2 className="stat-number">
              <Counter value={stats.hours} />
            </h2>
            <span className="stat-label">horas de dedicação</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;
