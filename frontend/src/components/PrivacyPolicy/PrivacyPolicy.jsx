/**
 * Pagina: PrivacyPolicy
 * Rota: /privacidade
 * Responsabilidade: exibir a politica de privacidade do site
 */
import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy">
      <h1 className="privacy-policy-title">Politica de Privacidade</h1>

      <section className="privacy-policy-section">
        <h2>1. Introducao</h2>
        <p>
          A TALMAX esta comprometida em proteger a sua privacidade e em conformidade com a Lei Geral de
          Protecao de Dados (LGPD).
        </p>
      </section>

      <section className="privacy-policy-section">
        <h2>2. Coleta de Dados</h2>
        <p>
          Coletamos apenas os dados necessarios para fornecer nossos produtos e servicos, como nome, e-mail e
          telefone, quando fornecidos voluntariamente por voce em nossos formularios.
        </p>
      </section>

      <section className="privacy-policy-section">
        <h2>3. Uso de Cookies</h2>
        <p>
          Utilizamos cookies essenciais para o funcionamento do site. Cookies analiticos sao ativados somente
          apos o seu consentimento para medir acessos e melhorar a experiencia.
        </p>
      </section>

      <section className="privacy-policy-section">
        <h2>4. Seus Direitos</h2>
        <p>
          De acordo com a LGPD, voce tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer
          momento.
        </p>
      </section>

      <section className="privacy-policy-section">
        <h2>5. Contato</h2>
        <p>
          Para duvidas sobre nossa politica de privacidade, entre em contato atraves do e-mail:
          contato@talmax.com.br
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
