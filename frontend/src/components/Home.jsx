import React from 'react';
import { Link } from 'react-router-dom';
import { categories, services } from '../data';
import HeroSlider from './HeroSlider';

const Home = () => {
  return (
    <>
      <HeroSlider />

      {/* Categories */}
      <section className="categories">
        <h2 className="section-title">Categorias de Produtos</h2>
        <div className="category-grid">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/categoria/${cat.name.toLowerCase().replace(/\s+/g, '-')}`} 
              className="category-card"
            >
              {/* Agora usamos uma imagem personalizada em vez de ícone genérico */}
              <div className="category-icon-wrapper">
                <img src={cat.image} alt={cat.name} className="category-custom-icon" />
              </div>
              <h3>{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Service Banners */}
      <section className="service-banners">
        {services.map((service) => (
          <Link 
            key={service.id} 
            to={service.name === 'Talmax Digital' ? '/categoria/talmax-digital' : '#'} 
            className="service-banner" 
            style={{ backgroundColor: service.color }}
          >
            <span>{service.name}</span>
          </Link>
        ))}
      </section>
    </>
  );
};

export default Home;
