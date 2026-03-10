import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, Layers, Droplets, Shield, Snowflake, Zap, Hammer, Scissors, Search as SearchIcon, Monitor, Palette, Battery
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { categories, slides, services } from '../data';

const iconMap = {
  Box, Layers, Droplets, Shield, Snowflake, Zap, Hammer, Scissors, Search: SearchIcon, Monitor, Palette, Battery
};

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Hero Slider */}
      <section className="hero">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="slide"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          >
            <div className="slide-content">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {slides[currentSlide].title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {slides[currentSlide].subtitle}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

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
