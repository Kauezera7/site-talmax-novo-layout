import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy" style={{ padding: '5rem 5%', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>Política de Privacidade</h1>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2>1. Introdução</h2>
        <p>A TALMAX está comprometida em proteger a sua privacidade e em conformidade com a Lei Geral de Proteção de Dados (LGPD).</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>2. Coleta de Dados</h2>
        <p>Coletamos apenas os dados necessários para fornecer nossos produtos e serviços, como nome, e-mail e telefone, quando fornecidos voluntariamente por você em nossos formulários.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>3. Uso de Cookies</h2>
        <p>Utilizamos cookies para melhorar o desempenho do site e sua experiência de navegação. Você pode gerenciar suas preferências a qualquer momento.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>4. Seus Direitos</h2>
        <p>De acordo com a LGPD, você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>5. Contato</h2>
        <p>Para dúvidas sobre nossa política de privacidade, entre em contato através do e-mail: contato@talmax.com.br</p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
