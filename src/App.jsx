import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
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
            <Link to="/" className="logo">
              <img src="/img/Talmaxlogo.webp" alt="TALMAX" />
            </Link>
            <nav className="nav-desktop hide-mobile">
              <Link to="/">Home</Link>
              <Link to="/talmax">Talmax</Link>
              <Link to="/produtos">Produtos</Link>
              <Link to="/downloads">Downloads</Link>
              <Link to="/contatos">Contatos</Link>
            </nav>
            <div className="social-links hide-mobile">
              <Facebook size={20} />
              <Instagram size={20} />
              <Youtube size={20} />
            </div>
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
          <nav className={`nav-mobile ${menuOpen ? 'active' : ''}`}>
            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/talmax" onClick={() => setMenuOpen(false)}>Talmax</Link>
            <Link to="/produtos" onClick={() => setMenuOpen(false)}>Produtos</Link>
            <Link to="/downloads" onClick={() => setMenuOpen(false)}>Downloads</Link>
            <Link to="/contatos" onClick={() => setMenuOpen(false)}>Contatos</Link>
            <div className="social-links">
              <Facebook size={24} />
              <Instagram size={24} />
              <Youtube size={24} />
            </div>
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

        {/* Footer */}
        <footer className="footer">
          <div className="footer-grid">
            <div className="footer-section">
              <img src="/img/Talmaxlogo.webp" alt="TALMAX" className="footer-logo" />
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
            <p>&copy; {new Date().getFullYear()} Talmax. Todos os direitos reservados. | <Link to="/privacidade">Política de Privacidade</Link></p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
