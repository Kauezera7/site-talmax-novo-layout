/**
 * Componente: PagePlaceholder
 * Uso: paginas ainda nao implementadas
 * Responsabilidade: exibir uma tela provisoria para rotas em construcao
 */
import React from 'react';
import { assetPath } from '../../utils/assets';
import './PagePlaceholder.css';

const PagePlaceholder = ({ title }) => {
  return (
    <div className="page-placeholder">
      <h1 className="page-placeholder-title">{title}</h1>
      <p className="page-placeholder-text">
        Esta pagina esta em desenvolvimento e em breve estara disponivel com todo o conteudo da Talmax.
      </p>
      <div className="page-placeholder-logo">
        <img src={assetPath('img/Talmaxlogo.webp')} alt="TALMAX" />
      </div>
    </div>
  );
};

export default PagePlaceholder;
