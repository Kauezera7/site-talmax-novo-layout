import React from 'react';

const PagePlaceholder = ({ title }) => {
  return (
    <div style={{ padding: '8rem 5%', textAlign: 'center', minHeight: '60vh' }}>
      <h1 style={{ color: 'var(--primary)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>{title}</h1>
      <p style={{ color: '#666', fontSize: '1.1rem' }}>Esta página está em desenvolvimento e em breve estará disponível com todo o conteúdo da Talmax.</p>
      <div style={{ marginTop: '3rem' }}>
        <img src="/img/Talmaxlogo.webp" alt="TALMAX" style={{ height: '50px', opacity: 0.3 }} />
      </div>
    </div>
  );
};

export default PagePlaceholder;
