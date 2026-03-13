import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { services } from '../data';
import HeroSlider from './HeroSlider';

const Home = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories');
        const data = await response.json();
        // Filtra apenas categorias visíveis (trata 1/0, true/false, '1'/'0')
        const visibleCategories = data.filter(cat => 
          cat.is_visible !== 0 && 
          cat.is_visible !== false && 
          cat.is_visible !== '0'
        );
        setCategories(visibleCategories);
      } catch (err) {
        console.error("Erro ao carregar categorias na Home:", err);
      }
    };
    fetchCategories();
  }, []);

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
              to={`/categoria/${cat.slug}`} 
              className="category-card"
            >
              <div className="category-icon-wrapper">
                <img 
                  src={cat.icon_url || '/img/placeholder.png'} 
                  alt={cat.name} 
                  className="category-custom-icon" 
                />
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
