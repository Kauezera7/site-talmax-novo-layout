import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Facebook,
  Youtube,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

import Home from './components/Home';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookieBanner from './components/CookieBanner';
import PagePlaceholder from './components/PagePlaceholder';
import ProductCatalog from './components/ProductCatalog';
import ProductDetail from './components/ProductDetail';
import TalmaxDigital from './components/TalmaxDigital';
import Upcera from './components/Upcera';
import Admin from './components/Admin';
import './App.css';

// Scroll to Top helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Router>
      <ScrollToTop />
      <AppContent menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </Router>
  );
}

const AppContent = ({ menuOpen, setMenuOpen }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      {/* Header */}
      {!isAdmin && (
        <header className="header">
          <div className="header-top">
            <Link to="/" className="logo">
              <img src="/img/Talmaxlogo.webp" alt="TALMAX" />
            </Link>
            <nav className="nav-desktop hide-mobile">
              <div className="nav-item">
                <Link to="/">Home</Link>
              </div>

              <div className="nav-item">
                <span>Institucional <ChevronDown size={14} /></span>
                <div className="dropdown">
                  <Link to="/quem-somos">Quem Somos</Link>
                  <Link to="/historia-diretoria">História & Diretoria</Link>
                  <Link to="/depoimentos">Depoimentos</Link>
                </div>
              </div>

              <div className="nav-item">
                <span>Produtos <ChevronDown size={14} /></span>
                <div className="dropdown">
                  <Link to="/produtos" className="highlight-link">Ver Todos os Produtos</Link>
                  <hr />
                  {/* Menu Fixo e Estático (Não vêm do Banco) */}
                  <Link to="/categoria/talmax-digital" style={{fontWeight: '700', color: 'var(--primary)'}}>Talmax Digital</Link>
                  <Link to="/categoria/protese-dentaria" style={{fontWeight: '700', color: 'var(--primary)'}}>Prótese Dentária</Link>
                  <Link to="/categoria/nail-e-podologia" style={{fontWeight: '700', color: 'var(--primary)'}}>Nail e Podologia</Link>
                </div>
              </div>

              <div className="nav-item">
                <a href="https://mobywork.com.br" target="_blank" rel="noopener noreferrer">Moby Work</a>
              </div>

              <div className="nav-item">
                <Link to="/blog">Blog</Link>
              </div>

              <div className="nav-item">
                <span>Serviços <ChevronDown size={14} /></span>
                <div className="dropdown">
                  <Link to="/suporte">Suporte</Link>
                  <Link to="/assistencia-tecnica">Assistência Técnica</Link>
                </div>
              </div>

              <div className="nav-item">
                <span>Contato <ChevronDown size={14} /></span>
                <div className="dropdown">
                  <Link to="/contato">Formulário de Contato</Link>
                  <Link to="/comercial-comex">Comercial / Comex</Link>
                  <a href="https://www.bne.com.br/talmax" target="_blank" rel="noopener noreferrer">Trabalhe Conosco</a>
                </div>
              </div>

              <div className="nav-item">
                <Link to="/cursos">Cursos</Link>
              </div>

              <div className="nav-item">
                <Link to="https://talmax.com.br/portalcliente/" target="_blank" rel="noopener noreferrer">Portal do Cliente</Link>
              </div>

              <div className="nav-item">
                <span>SAC <ChevronDown size={14} /></span>
                <div className="dropdown">
                  <Link to="/sac">Fale Conosco</Link>
                  <Link to="/politicas-troca">Políticas de Troca</Link>
                </div>
              </div>
            </nav>
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
          <nav className={`nav-mobile ${menuOpen ? 'active' : ''}`}>
            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
            
            <div className="nav-mobile-item">
              <span>Institucional</span>
              <div className="nav-mobile-sub">
                <Link to="/quem-somos" onClick={() => setMenuOpen(false)}>Quem Somos</Link>
                <Link to="/historia-diretoria" onClick={() => setMenuOpen(false)}>História & Diretoria</Link>
              </div>
            </div>

            <div className="nav-mobile-item">
              <span>Produtos</span>
              <div className="nav-mobile-sub">
                <Link to="/produtos" onClick={() => setMenuOpen(false)} style={{fontWeight: 'bold', color: 'var(--primary)'}}>Ver Todos os Produtos</Link>
                <hr style={{border: '0', borderTop: '1px solid #eee', margin: '5px 0'}} />
                {/* Menu Fixo no Mobile */}
                <Link to="/categoria/talmax-digital" onClick={() => setMenuOpen(false)} style={{fontWeight: '700'}}>Talmax Digital</Link>
                <Link to="/categoria/protese-dentaria" onClick={() => setMenuOpen(false)} style={{fontWeight: '700'}}>Prótese Dentária</Link>
                <Link to="/categoria/nail-e-podologia" onClick={() => setMenuOpen(false)} style={{fontWeight: '700'}}>Nail e Podologia</Link>
              </div>
            </div>

            <a href="https://mobywork.com.br" target="_blank" rel="noopener noreferrer">Moby Work</a>
            <Link to="/blog" onClick={() => setMenuOpen(false)}>Blog</Link>
            <Link to="/contato" onClick={() => setMenuOpen(false)}>Contato</Link>
            
            <div className="social-links">
              <Facebook size={24} />
              <Instagram size={24} />
              <Youtube size={24} />
            </div>
          </nav>
        </header>
      )}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/privacidade" element={<PrivacyPolicy />} />
          
          {/* Institucional */}
          <Route path="/quem-somos" element={<PagePlaceholder title="Quem Somos" />} />
          <Route path="/historia-diretoria" element={<PagePlaceholder title="História & Diretoria" />} />
          <Route path="/depoimentos" element={<PagePlaceholder title="Depoimentos" />} />
          
          {/* Produtos */}
          <Route path="/produtos" element={<ProductCatalog />} />
          <Route path="/categoria/talmax-digital" element={<TalmaxDigital />} />
          <Route path="/upcera" element={<Upcera />} />
          <Route path="/categoria/:slug" element={<ProductCatalog />} />
          <Route path="/produto/:id" element={<ProductDetail />} />
          
          {/* Blog */}
          <Route path="/blog" element={<PagePlaceholder title="Blog" />} />
          
          {/* Serviços */}
          <Route path="/suporte" element={<PagePlaceholder title="Suporte" />} />
          <Route path="/assistencia-tecnica" element={<PagePlaceholder title="Assistência Técnica" />} />
          
          {/* Contato */}
          <Route path="/contato" element={<PagePlaceholder title="Formulário de Contato" />} />
          <Route path="/comercial-comex" element={<PagePlaceholder title="Comercial / Comex" />} />
          
          {/* Outros */}
          <Route path="/cursos" element={<PagePlaceholder title="Cursos" />} />
          <Route path="/portal-cliente" element={<PagePlaceholder title="Portal do Cliente" />} />
          <Route path="/sac" element={<PagePlaceholder title="SAC - Fale Conosco" />} />
          <Route path="/politicas-troca" element={<PagePlaceholder title="Políticas de Troca" />} />
        </Routes>
      </main>

      {/* Footer */}
      {!isAdmin && (
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
              <p><Mail size={16} /> contato@talmax.com.br</p>
              <p><Phone size={16} /> (41) 3012-3456</p>
            </div>
            <div className="footer-section">
              <h4>Endereço</h4>
              <p><MapPin size={16} /> Rua Dr. Pedrosa, 151</p>
              <p>Centro, Curitiba - PR</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Talmax. Todos os direitos reservados. | <Link to="/privacidade">Política de Privacidade</Link></p>
          </div>
        </footer>
      )}

      {/* LGPD Cookie Banner */}
      {!isAdmin && <CookieBanner />}
    </div>
  );
};

export default App;
