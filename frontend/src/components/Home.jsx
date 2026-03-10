import React from 'react';
import { 
  Box, Layers, Droplets, Shield, Snowflake, Zap, Hammer, Scissors, Search as SearchIcon, Monitor, Palette, Battery
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { categories, services } from '../data';
import HeroSlider from './HeroSlider';

const iconMap = {
  Box, Layers, Droplets, Shield, Snowflake, Zap, Hammer, Scissors, Search: SearchIcon, Monitor, Palette, Battery
};

const Home = () => {
  return (
    <>
      <HeroSlider />

      {/* Categories */}
      <section className="categories">
        <h2 className="section-title">Categorias de Produtos</h2>
        <div className="category-grid">
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon];
            return (
              <Link key={cat.id} to={`/categoria/${cat.id}`} className="category-card" style={{ backgroundColor: cat.bg }}>
                <IconComponent size={32} color="#004a99" />
                <h3>{cat.name}</h3>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Service Banners */}
      <section className="service-banners">
        {services.map((service) => (
          <Link key={service.id} to="#" className="service-banner" style={{ backgroundColor: service.color }}>
            <span>{service.name}</span>
          </Link>
        ))}
      </section>
    </>
  );
};

export default Home;
