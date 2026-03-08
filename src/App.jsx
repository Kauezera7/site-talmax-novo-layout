import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { 
  Search, 
  Box, 
  Layers, 
  Droplets, 
  Shield, 
  Snowflake, 
  Zap, 
  Hammer, 
  Scissors, 
  Search as SearchIcon, 
  Monitor, 
  Palette, 
  Battery,
  Facebook,
  Youtube,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { categories, slides, services } from './data';
import './App.css';

const iconMap = {
  Box, Layers, Droplets, Shield, Snowflake, Zap, Hammer, Scissors, Search: SearchIcon, Monitor, Palette, Battery
};

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Router>
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header-top">
            <a href="/" className="logo">TALMAX</a>
            <div className="search-bar">
              <Search size={20} color="#666" />
              <input type="text" placeholder="Pesquisar produtos..." />
            </div>
            <div className="social-links hide-mobile">
              <Facebook size={20} />
              <Instagram size={20} />
              <Youtube size={20} />
            </div>
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
          <nav className={`nav ${menuOpen ? 'active' : ''}`}>
            <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="/talmax" onClick={() => setMenuOpen(false)}>Talmax</a>
            <a href="/produtos" onClick={() => setMenuOpen(false)}>Produtos</a>
            <a href="/downloads" onClick={() => setMenuOpen(false)}>Downloads</a>
            <a href="/contatos" onClick={() => setMenuOpen(false)}>Contatos</a>
            {menuOpen && (
              <div className="social-links mobile-only">
                <Facebook size={24} />
                <Instagram size={24} />
                <Youtube size={24} />
              </div>
            )}
          </nav>
        </header>

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
                <a key={cat.id} href={`/categoria/${cat.id}`} className="category-card" style={{ backgroundColor: cat.bg }}>
                  <IconComponent size={32} color="#004a99" />
                  <h3>{cat.name}</h3>
                </a>
              );
            })}
          </div>
        </section>

        {/* Service Banners */}
        <section className="service-banners">
          {services.map((service) => (
            <a key={service.id} href="#" className="service-banner" style={{ backgroundColor: service.color }}>
              <span>{service.name}</span>
            </a>
          ))}
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-grid">
            <div className="footer-section">
              <h4>TALMAX</h4>
              <p>Inovação e qualidade em produtos odontológicos.</p>
              <div className="social-links">
                <Facebook size={20} />
                <Instagram size={20} />
                <Youtube size={20} />
              </div>
            </div>
            <div className="footer-section">
              <h4>Contato</h4>
              <p><Mail size={16} inline /> contato@talmax.com.br</p>
              <p><Phone size={16} inline /> (41) 3012-3456</p>
            </div>
            <div className="footer-section">
              <h4>Endereço</h4>
              <p><MapPin size={16} inline /> Rua Dr. Pedrosa, 151</p>
              <p>Centro, Curitiba - PR</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Talmax. Todos os direitos reservados. | <a href="/privacidade">Política de Privacidade</a></p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
