import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Facebook,
  Youtube,
  Instagram,
  Search,
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

import Home from './components/Home/Home';
import QuemSomos from './components/QuemSomos/QuemSomos';
import PrivacyPolicy from './components/PrivacyPolicy/PrivacyPolicy';
import CookieBanner from './components/CookieBanner/CookieBanner';
import PagePlaceholder from './components/PagePlaceholder/PagePlaceholder';
import ProductCatalog from './components/ProductCatalog/ProductCatalog';
import ProductDetail from './components/ProductDetail/ProductDetail';
import Support from './components/Support/Support';
import HistoriaDiretoria from './components/HistoriaDiretoria/HistoriaDiretoria';
import TalmaxDigital from './components/TalmaxDigital/TalmaxDigital';
import Upcera from './components/Upcera/Upcera';
import Scanners from './components/Scanners/Scanners';
import Impressoras3D from './components/Impressoras3D/Impressoras3D';
import Admin from './pages/Admin/AdminDashboard';
import AdminLogin from './components/AdminLogin/AdminLogin';
import { validateAdminSession } from './services/adminAuth';
import './App.css';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const ProtectedAdminRoute = ({ children }) => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let mounted = true;

    validateAdminSession()
      .then((result) => {
        if (mounted) {
          setStatus(result.authenticated ? 'authenticated' : 'unauthenticated');
        }
      })
      .catch(() => {
        if (mounted) {
          setStatus('unauthenticated');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (status === 'checking') {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Carregando...</div>;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
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
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);
  const searchRoutes = [
    { path: '/', keywords: ['home', 'inicio', 'principal'] },
    { path: '/quem-somos', keywords: ['quem somos', 'empresa', 'talmax'] },
    { path: '/historia-diretoria', keywords: ['historia', 'diretoria', 'institucional'] },
    { path: '/produtos', keywords: ['produtos', 'catalogo', 'produto'] },
    { path: '/categoria/talmax-digital', keywords: ['talmax digital', 'digital', 'cad cam'] },
    { path: '/upcera', keywords: ['upcera', 'zirconia'] },
    { path: '/scanners', keywords: ['scanner', 'scanners'] },
    { path: '/impressoras-3d', keywords: ['impressora 3d', 'impressoras 3d', '3d'] },
    { path: '/suporte', keywords: ['suporte', 'ajuda'] },
    { path: '/contato', keywords: ['contato', 'fale conosco', 'comercial'] },
    { path: '/cursos', keywords: ['cursos', 'curso', 'treinamento'] },
    { path: '/sac', keywords: ['sac', 'troca', 'politicas'] }
  ];

  const normalizeSearchText = (value) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const normalizedTerm = normalizeSearchText(searchTerm);
    if (!normalizedTerm) return;

    const productTerms = [
      'produto',
      'produtos',
      'catalogo',
      'catalog',
      'upcera',
      'scanner',
      'scanners',
      'impressora',
      'impressoras',
      'impressora 3d',
      'impressoras 3d',
      'resina',
      'zirconia',
      'cad cam',
      'protese',
      'odontologica',
      'odontologico'
    ];

    const shouldGoToCatalog = productTerms.some((term) => {
      const normalizedKeyword = normalizeSearchText(term);
      return (
        normalizedKeyword === normalizedTerm ||
        normalizedKeyword.includes(normalizedTerm) ||
        normalizedTerm.includes(normalizedKeyword)
      );
    });

    if (shouldGoToCatalog) {
      navigate(`/produtos?busca=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setSearchTerm('');
      setMenuOpen(false);
      return;
    }

    const matchedRoute = searchRoutes.find((item) =>
      item.keywords.some((keyword) => {
        const normalizedKeyword = normalizeSearchText(keyword);
        return (
          normalizedKeyword === normalizedTerm ||
          normalizedKeyword.includes(normalizedTerm) ||
          normalizedTerm.includes(normalizedKeyword)
        );
      })
    );

    navigate(matchedRoute ? matchedRoute.path : `/produtos?busca=${encodeURIComponent(searchTerm.trim())}`);
    setSearchOpen(false);
    setSearchTerm('');
    setMenuOpen(false);
  };

  return (
    <div className="app">
      {!isAdmin && (
        <header className="header">
          <div className="header-top">
            <Link to="/" className="logo">
              <img src="/img/Talmaxlogo.webp" alt="TALMAX" />
            </Link>

            <nav className="nav-desktop hide-mobile">
              <div className="nav-item nav-search-item">
                <button
                  className="search-trigger nav-search-button"
                  onClick={() => setSearchOpen((current) => !current)}
                  aria-label="Abrir busca"
                >
                  <Search size={18} />
                </button>
              </div>

              <div className="nav-item">
                <Link to="/">Home</Link>
              </div>

              <div className="nav-item">
                <span>Institucional <ChevronDown size={14} /></span>
                <div className="dropdown">
                  <Link to="/quem-somos">Quem Somos</Link>
                  <Link to="/historia-diretoria">Historia & Diretoria</Link>
                  <Link to="/depoimentos">Depoimentos</Link>
                </div>
              </div>

              <div className="nav-item">
                <span>Produtos <ChevronDown size={14} /></span>
                <div className="dropdown">
                  <Link to="/produtos" className="highlight-link">Ver Todos os Produtos</Link>
                  <hr />
                  <Link to="/categoria/talmax-digital" style={{ fontWeight: '700', color: 'var(--primary)' }}>Talmax Digital</Link>
                  <Link to="/categoria/protese-dentaria" style={{ fontWeight: '700', color: 'var(--primary)' }}>Protese Dentaria</Link>
                  <Link to="/categoria/nail-e-podologia" style={{ fontWeight: '700', color: 'var(--primary)' }}>Nail e Podologia</Link>
                </div>
              </div>

              <div className="nav-item">
                <a href="https://mobywork.com.br" target="_blank" rel="noopener noreferrer">Moby Work</a>
              </div>

              <div className="nav-item">
                <Link to="/blog">Blog</Link>
              </div>

              <div className="nav-item">
                <span>Servicos <ChevronDown size={14} /></span>
                <div className="dropdown">
                  <Link to="/suporte">Suporte</Link>
                  <Link to="/assistencia-tecnica">Assistencia Tecnica</Link>
                </div>
              </div>

              <div className="nav-item">
                <span>Contato <ChevronDown size={14} /></span>
                <div className="dropdown">
                  <Link to="/contato">Formulario de Contato</Link>
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
                  <Link to="/politicas-troca">Politicas de Troca</Link>
                </div>
              </div>
            </nav>

            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {searchOpen && (
            <div className="header-search-bar">
              <form className="header-search-input-wrap" onSubmit={handleSearchSubmit}>
                <Search size={18} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Digite o que voce procura..."
                />
                <button
                  type="button"
                  className="header-search-close"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchTerm('');
                  }}
                  aria-label="Fechar busca"
                >
                  <X size={16} />
                </button>
              </form>
            </div>
          )}

          <nav className={`nav-mobile ${menuOpen ? 'active' : ''}`}>
            <button
              className="search-trigger mobile-search-trigger"
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen((current) => !current);
              }}
              aria-label="Abrir busca"
            >
              <Search size={18} />
              <span>Buscar no site</span>
            </button>

            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>

            <div className="nav-mobile-item">
              <span>Institucional</span>
              <div className="nav-mobile-sub">
                <Link to="/quem-somos" onClick={() => setMenuOpen(false)}>Quem Somos</Link>
                <Link to="/historia-diretoria" onClick={() => setMenuOpen(false)}>Historia & Diretoria</Link>
              </div>
            </div>

            <div className="nav-mobile-item">
              <span>Produtos</span>
              <div className="nav-mobile-sub">
                <Link to="/produtos" onClick={() => setMenuOpen(false)} style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Ver Todos os Produtos</Link>
                <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '5px 0' }} />
                <Link to="/categoria/talmax-digital" onClick={() => setMenuOpen(false)} style={{ fontWeight: '700' }}>Talmax Digital</Link>
                <Link to="/categoria/protese-dentaria" onClick={() => setMenuOpen(false)} style={{ fontWeight: '700' }}>Protese Dentaria</Link>
                <Link to="/categoria/nail-e-podologia" onClick={() => setMenuOpen(false)} style={{ fontWeight: '700' }}>Nail e Podologia</Link>
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
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/painel"
            element={
              <ProtectedAdminRoute>
                <Admin />
              </ProtectedAdminRoute>
            }
          />
          <Route path="/privacidade" element={<PrivacyPolicy />} />

          <Route path="/quem-somos" element={<QuemSomos />} />
          <Route path="/historia-diretoria" element={<HistoriaDiretoria />} />
          <Route path="/depoimentos" element={<PagePlaceholder title="Depoimentos" />} />

          <Route path="/produtos" element={<ProductCatalog />} />
          <Route path="/categoria/talmax-digital" element={<TalmaxDigital />} />
          <Route path="/upcera" element={<Upcera />} />
          <Route path="/scanners" element={<Scanners />} />
          <Route path="/impressoras-3d" element={<Impressoras3D />} />
          <Route path="/categoria/:slug" element={<ProductCatalog />} />
          <Route path="/produto/:id" element={<ProductDetail />} />

          <Route path="/blog" element={<PagePlaceholder title="Blog" />} />

          <Route path="/suporte" element={<Support />} />
          <Route path="/assistencia-tecnica" element={<PagePlaceholder title="Assistencia Tecnica" />} />

          <Route path="/contato" element={<PagePlaceholder title="Formulario de Contato" />} />
          <Route path="/comercial-comex" element={<PagePlaceholder title="Comercial / Comex" />} />

          <Route path="/cursos" element={<PagePlaceholder title="Cursos" />} />
          <Route path="/portal-cliente" element={<PagePlaceholder title="Portal do Cliente" />} />
          <Route path="/sac" element={<PagePlaceholder title="SAC - Fale Conosco" />} />
          <Route path="/politicas-troca" element={<PagePlaceholder title="Politicas de Troca" />} />
        </Routes>
      </main>

      {!isAdmin && (
        <footer className="footer">
          <div className="footer-grid">
            <div className="footer-section">
              <img src="/img/Talmaxlogo.webp" alt="TALMAX" className="footer-logo" />
              <p>Inovacao e qualidade em produtos odontologicos.</p>
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
              <h4>Endereco</h4>
              <p><MapPin size={16} /> Rua Benedito Carollo, 890 - Cidade Industrial de Curitiba</p>
              <p>Curitiba - PR - 81290-060</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Talmax. Todos os direitos reservados. | <Link to="/privacidade">Politica de Privacidade</Link></p>
          </div>
        </footer>
      )}

      {!isAdmin && <CookieBanner />}
    </div>
  );
};

export default App;
