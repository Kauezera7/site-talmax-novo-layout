/**
 * Componente: PagePlaceholder
 * Uso: páginas ainda não implementadas
 * Responsabilidade: exibir uma tela provisória para rotas em construção
 */
import React from 'react';
import { assetPath } from '../../utils/assets';
import './PagePlaceholder.css';

const PagePlaceholder = ({ title }) => {
  return (
    <div className="page-placeholder">
      <h1 className="page-placeholder-title">{title}</h1>
      <p className="page-placeholder-text">
        Esta página está em desenvolvimento e em breve estará disponível com todo o conteúdo da Talmax.
      </p>
      <div className="page-placeholder-logo">
        <img src={assetPath('img/Talmaxlogo.logo.webp')} alt="TALMAX" />
      </div>
    </div>
  );
};

export default PagePlaceholder;
