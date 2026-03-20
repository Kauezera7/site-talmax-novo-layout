import React, { useState } from 'react';
import './QuemSomos.css';

const valores = [
  'Compromisso com o Respeito e Etica nas relacoes.',
  'Integridade nas atitudes e senso de Justica ao tomar decisoes.',
  'Empatia pelo semelhante e Gratidao pela vida.',
  'Transparencia nas comunicacoes e Lealdade no vinculo com a empresa.',
  'Incentivo a Qualidade de Vida para o bem-estar de todos.',
  'Sabedoria do Alto onde o conhecimento humano nao seja suficiente.'
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
            Uma trajetoria com tres decadas, cercada de muitos momentos que continuarao
            se repetindo.
          </p>
        </div>
      </section>

      <section className="quem-somos-showcase">
        <div className="quem-somos-image-card">
          <img src="/img/talmax-fachada.jpg" alt="Fachada Talmax" />
        </div>
      </section>

      <section className="quem-somos-content">
        <div className="quem-somos-text-card">
          <p>
            Com 30 anos de experiencia, a Talmax e uma das principais empresas do pais no
            segmento de protese odontologica. Sempre em busca de solucoes para a excelencia
            dos trabalhos realizados pelo tecnico, oferece o que ha de melhor no mercado
            odontologico em mais de 300 itens na sua linha de produtos.
          </p>

          <p>
            Referencia na area de sistemas CAD/CAM no Brasil, a Talmax e a representante
            oficial da empresa chinesa UPCERA. Com esses diferenciais, a Talmax esta
            presente com estas tecnologias em diversos laboratorios e clinicas, totalizando
            quase 100% do territorio nacional.
          </p>
        </div>

        <div className="quem-somos-info-card quem-somos-info-card-single">
          <h2>Proposito</h2>
          <p>
            Tornar possivel aos profissionais de protese dentaria assinar seus talentos
            como resultado da sua obra de arte.
          </p>

          <h2>Missao</h2>
          <p>
            A Talmax tem como missao ser uma empresa focada nas necessidades laboratoriais,
            a qual busca solucoes aos profissionais da odontologia em todo Brasil,
            oferecendo o melhor em tecnologia com produtos certificados e qualidade
            comprovada.
          </p>
          <p>
            Fazer com que a promocao do conhecimento esteja presente nos servicos
            prestados pela Talmax, bem como na formacao de colaboradores preparados e
            comprometidos, gerando relacionamentos eticos e duradouros com fornecedores e
            clientes.
          </p>

          <h2>Visao</h2>
          <p>
            Criacao de uma parceria com o cliente, onde o passar dos anos se transforme
            em uma relacao de credibilidade e confianca.
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
            <img src="/img/imagemyoutube.webp" alt="Abrir video institucional Talmax" />
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
              aria-label="Fechar video"
            >
              ×
            </button>
            <div className="quem-somos-video-frame">
              <iframe
                src="https://www.youtube.com/embed/Im5i6RDIoRo?autoplay=1"
                title="Video institucional Talmax"
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
