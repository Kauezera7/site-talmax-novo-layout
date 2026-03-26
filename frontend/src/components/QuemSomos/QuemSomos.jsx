import React, { useState } from 'react';
import { assetPath } from '../../utils/assets';
import './QuemSomos.css';

const valores = [
  'Compromisso com o Respeito e Ética nas relações.',
  'Integridade nas atitudes e senso de Justiça ao tomar decisões.',
  'Empatia pelo semelhante e Gratidão pela vida.',
  'Transparência nas comunicações e Lealdade no vínculo com a empresa.',
  'Incentivo a Qualidade de Vida para o bem-estar de todos.',
  'Sabedoria do Alto onde o conhecimento humano não seja suficiente.'
];

const QuemSomos = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="quem-somos-page">
      <section className="quem-somos-hero">
        <div className="quem-somos-hero-content">
          <span className="quem-somos-tag">Institucional</span>
          <h1>Quem Somos</h1>
          <p>
            Uma trajetória com três décadas, cercada de muitos momentos que continuarão
            se repetindo.
          </p>
        </div>
      </section>

      <section className="quem-somos-showcase">
        <div className="quem-somos-image-card">
          <img src={assetPath('img/talmax-fachada.jpg')} alt="Fachada Talmax" />
        </div>
      </section>

      <section className="quem-somos-content">
        <div className="quem-somos-text-card">
          <p>
            Com 30 anos de experiência, a Talmax é uma das principais empresas do país no
            segmento de prótese odontológica. Sempre em busca de soluções para a excelência
            dos trabalhos realizados pelo técnico, oferece o que há de melhor no mercado
            odontológico em mais de 300 itens na sua linha de produtos.
          </p>

          <p>
            Referência na área de sistemas CAD/CAM no Brasil, a Talmax é a representante
            oficial da empresa chinesa UPCERA. Com esses diferenciais, a Talmax está
            presente com estas tecnologias em diversos laboratórios e clínicas, totalizando
            quase 100% do território nacional.
          </p>
        </div>

        <div className="quem-somos-info-card quem-somos-info-card-single">
          <h2>Propósito</h2>
          <p>
            Tornar possível aos profissionais de prótese dentária assinar seus talentos
            como resultado da sua obra de arte.
          </p>

          <h2>Missão</h2>
          <p>
            A Talmax tem como missão ser uma empresa focada nas necessidades laboratoriais,
            a qual busca soluções aos profissionais da odontologia em todo Brasil,
            oferecendo o melhor em tecnologia com produtos certificados e qualidade
            comprovada.
          </p>
          <p>
            Fazer com que a promoção do conhecimento esteja presente nos serviços
            prestados pela Talmax, bem como na formação de colaboradores preparados e
            comprometidos, gerando relacionamentos éticos e duradouros com fornecedores e
            clientes.
          </p>

          <h2>Visão</h2>
          <p>
            Criação de uma parceria com o cliente, onde o passar dos anos se transforme
            em uma relação de credibilidade e confiança.
          </p>
        </div>

        <div className="quem-somos-values-card">
          <h2>Valores</h2>
          <div className="quem-somos-values-list">
            {valores.map((valor) => (
              <div key={valor} className="quem-somos-value-item">
                <span className="quem-somos-value-dot" />
                <p>{valor}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="quem-somos-video-card">
          <button
            type="button"
            className="quem-somos-video-trigger"
            onClick={() => setIsVideoOpen(true)}
          >
            <img src={assetPath('img/imagemyoutube.webp')} alt="Abrir vídeo institucional Talmax" />
            <span className="quem-somos-video-overlay">
              <span className="quem-somos-video-play" aria-hidden="true">
                <span className="quem-somos-video-play-triangle" />
              </span>
            </span>
          </button>
        </div>
      </section>

      {isVideoOpen && (
        <div className="quem-somos-video-modal" onClick={() => setIsVideoOpen(false)}>
          <div
            className="quem-somos-video-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="quem-somos-video-close"
              onClick={() => setIsVideoOpen(false)}
              aria-label="Fechar vídeo"
            >
              ×
            </button>
            <div className="quem-somos-video-frame">
              <iframe
                src="https://www.youtube.com/embed/Im5i6RDIoRo?autoplay=1"
                title="Vídeo institucional Talmax"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuemSomos;
