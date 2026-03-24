import React from 'react';
import { assetPath } from '../../utils/assets';
import './HistoriaDiretoria.css';

const HistoriaDiretoria = () => {
  const diretoriaCards = [
    {
      image: assetPath('img/imagejohnypresidente.png'),
      name: 'Johny de Oliveira',
      role: 'Presidente',
      quote: 'Como presidente e responsavel pelas areas Comercial e Comercio Exterior, estou muito entusiasmado com os proximos passos da empresa que visam dar enfase a centralidade do cliente, oferecendo produtos, servicos e facilidades que otimizem o trabalho diario dos profissionais.',
      responsibilities: 'Comercial | Comercio Exterior'
    },
    {
      image: assetPath('img/imagevorleidiretoradm.png'),
      name: 'Vorlei de Oliveira',
      role: 'Diretor Administrativo',
      quote: 'Estar a frente de setores que focam no atendimento ao cliente e um grande desafio, mas precisamos seguir a versatilidade do mercado, oferecendo nao apenas bons produtos e servicos, mas a confianca de uma empresa que se preocupa com detalhes que fazem a diferenca na vida e nos negocios dos nossos clientes.',
      responsibilities: 'Logistica | Producao | Marketing | Regulatorio | Recursos Humanos | Talmax Cursos'
    },
    {
      image: assetPath('img/imageclaudineyopera.png'),
      name: 'Claudiney Franco',
      role: 'Diretor Financeiro Operacional',
      quote: 'O objetivo e implantar novas tecnologias e processos que visem melhorar nao apenas o atendimento, mas tambem os servicos oferecidos aos clientes, desde a realizacao de pedidos, emissao de notas, ate a entrega dos produtos. Queremos oferecer a melhor experiencia aqui na Talmax.',
      responsibilities: 'Financeiro | Contabilidade | Tecnologia da Informacao | Compras | Pos-Vendas'
    },
    {
      image: assetPath('img/imagediogomob.png'),
      name: 'Diogo de Oliveira',
      role: 'Diretor Mobiliario',
      quote: 'Estar a frente da area Moby Work, uma linha completa de moveis, acessorios e projetos planejados e um grande desafio. Queremos atender todas as clinicas e laboratorios do Brasil, oferecendo solucoes inteligentes que dinamizam o trabalho e aumentem a produtividade dos profissionais deste segmento.',
      responsibilities: 'Moby Work'
    }
  ];

  return (
    <div className="historia-diretoria-page">
    
      <section className="historia-diretoria-hero">
        <div className="historia-diretoria-content">
          <span className="historia-diretoria-tag">Institucional</span>
          <h1>Historia & Diretoria</h1>
          <p>
            Conheça a trajetória da Talmax e a liderança que construiu nossa história com
            visão, inovação e compromisso com a excelência.
          </p>
        </div>
      </section>

      <section className="historia-diretoria-image-section">
        <div className="historia-diretoria-image-card">
          <img src={assetPath('img/diretoria.png')} alt="Historia e Diretoria Talmax" />
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
            <div key={card.image} className="flip-card">
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
                  <p className="flip-card-label">Responsavel pelas areas:</p>
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
