import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Facebook,
  Youtube,
  Instagram,
  Search,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';

import Home from './components/Home/Home';
import AdminLogin from './components/AdminLogin/AdminLogin';
import CookieBanner from './components/CookieBanner/CookieBanner';
import PagePlaceholder from './components/PagePlaceholder/PagePlaceholder';
import SearchBar from './components/SearchBar/SearchBar';
import { useProductSearch } from './hooks/useProductSearch';
import { validateAdminSession } from './services/adminAuth';
import { syncAnalyticsWithConsent } from './services/analytics';
import {
  readCookieConsentStatus,
  subscribeToCookieConsentStatus
} from './services/cookieConsent';
import { subscribeToAdminSessionExpired } from './services/adminSessionEvents';
import { assetPath } from './utils/assets';
import './App.css';

const QuemSomos = lazy(() => import('./components/QuemSomos/QuemSomos'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy/PrivacyPolicy'));
const ProductCatalog = lazy(() => import('./components/ProductCatalog/ProductCatalog'));
const ProductDetail = lazy(() => import('./components/ProductDetail/ProductDetail'));
const Support = lazy(() => import('./components/Support/Support'));
const HistoriaDiretoria = lazy(() => import('./components/HistoriaDiretoria/HistoriaDiretoria'));
const TalmaxDigital = lazy(() => import('./components/TalmaxDigital/TalmaxDigital'));
const DigitalGroupPage = lazy(() => import('./components/TalmaxDigital/DigitalGroupPage'));
const Upcera = lazy(() => import('./components/Upcera/Upcera'));
const Scanners = lazy(() => import('./components/Scanners/Scanners'));
const Impressoras3D = lazy(() => import('./components/Impressoras3D/Impressoras3D'));
const CustomPage = lazy(() => import('./components/CustomPage/CustomPage'));
const TechnicalAssistance = lazy(() => import('./components/TechnicalAssistance/TechnicalAssistance'));
const Admin = lazy(() => import('./pages/Admin/AdminDashboard'));

const THEME_STORAGE_KEY = 'talmax-theme';
const LOADER_DELAY_MS = 1000;

const FullScreenLoader = ({ label = 'Carregando...' }) => (
  <div className="app-loader-overlay" role="status" aria-live="polite" aria-label={label}>
    <div className="app-loader-shell">
      <div className="loader loader_bubble" aria-hidden="true" />
      <span className="app-loader-text">{label}</span>
    </div>
  </div>
);

const DelayedFullScreenLoader = ({ label = 'Carregando...', delay = LOADER_DELAY_MS }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delay]);

  if (!visible) {
    return null;
  }

  return <FullScreenLoader label={label} />;
};

const RouteLoader = ({ children, label = 'Carregando pagina...' }) => (
  <Suspense fallback={<DelayedFullScreenLoader label={label} />}>
    {children}
  </Suspense>
);

const withRouteLoader = (element, label) => (
  <RouteLoader label={label}>
    {element}
  </RouteLoader>
);

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

    validateAdminSession({
      timeoutMs: 2500
    })
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
    return <DelayedFullScreenLoader label="Carregando painel..." />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [appReady, setAppReady] = useState(() => {
    if (typeof document === 'undefined') {
      return false;
    }

    return document.readyState === 'complete';
  });
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    return window.localStorage.getItem(THEME_STORAGE_KEY) || 'light';
  });
  const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '');

  useEffect(() => {
    if (appReady) {
      return undefined;
    }

    const releaseApp = () => {
      setAppReady(true);
    };

    window.addEventListener('load', releaseApp, { once: true });

    return () => {
      window.removeEventListener('load', releaseApp);
    };
  }, [appReady]);

  return (
    <Router basename={routerBasename}>
      <ScrollToTop />
      <AppContent
        appReady={appReady}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      />
    </Router>
  );
}

const AppContent = ({ appReady, menuOpen, setMenuOpen, theme, onToggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');
  const showGlobalLoader = !appReady && !isAdmin;
  const [navVisible, setNavVisible] = useState(true);
  const [activeMobileSection, setActiveMobileSection] = useState(null);
  const [cookieConsentStatus, setCookieConsentStatus] = useState(() => readCookieConsentStatus());
  const lastScrollYRef = useRef(0);
  const tickingScrollRef = useRef(false);

  const closeMobileMenu = () => {
    setMenuOpen(false);
    setActiveMobileSection(null);
  };

  const handleMenuToggle = () => {
    if (menuOpen) {
      closeMobileMenu();
      return;
    }

    setMenuOpen(true);
  };

  const toggleMobileSection = (section) => {
    setActiveMobileSection((current) => (current === section ? null : section));
  };

  const {
    closeSearch,
    handleProductSuggestionSelect,
    handleSearchInputChange,
    handleSearchInputFocus,
    handleSearchInputKeyDown,
    handleSearchSubmit,
    previewProduct,
    productSuggestions,
    searchInputRef,
    searchMatchesTotal,
    searchOpen,
    searchTerm,
    setSearchPreviewId,
    shouldShowSearchDropdown,
    toggleSearch
  } = useProductSearch({
    isAdmin,
    onNavigateComplete: closeMobileMenu
  });

  const sharedSearchBarProps = {
    onInputChange: handleSearchInputChange,
    onInputFocus: handleSearchInputFocus,
    onInputKeyDown: handleSearchInputKeyDown,
    onPreviewChange: setSearchPreviewId,
    onSelectProduct: handleProductSuggestionSelect,
    onSubmit: handleSearchSubmit,
    previewProduct,
    searchTerm,
    shouldShowDropdown: shouldShowSearchDropdown,
    suggestions: productSuggestions,
    totalMatches: searchMatchesTotal
  };

  useEffect(() => {
    const unsubscribe = subscribeToAdminSessionExpired(() => {
      if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
        navigate('/admin/login', {
          replace: true,
          state: { sessionExpired: true }
        });
      }
    });

    return unsubscribe;
  }, [location.pathname, navigate]);

  useEffect(() => {
    const unsubscribe = subscribeToCookieConsentStatus((nextStatus) => {
      setCookieConsentStatus(nextStatus);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    syncAnalyticsWithConsent({
      consentStatus: cookieConsentStatus,
      enabled: !isAdmin
    });
  }, [cookieConsentStatus, isAdmin]);

  useEffect(() => {
    if (isAdmin) return undefined;
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      if (tickingScrollRef.current) return;

      tickingScrollRef.current = true;

      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollYRef.current;

        if (currentScrollY <= 24) {
          setNavVisible(true);
        } else if (delta > 14 && currentScrollY > 160) {
          setNavVisible((current) => (current ? false : current));
        } else if (delta < -14) {
          setNavVisible((current) => (current ? current : true));
        }

        lastScrollYRef.current = currentScrollY;
        tickingScrollRef.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdmin]);

  useEffect(() => {
    const appliedTheme = isAdmin ? theme : 'light';
    document.body.dataset.theme = appliedTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, appliedTheme);
  }, [isAdmin, theme]);

  return (
    <div className="app">
      {showGlobalLoader && <DelayedFullScreenLoader label="Carregando site..." />}

      {isAdmin && (
        <button
          type="button"
          className="theme-toggle-button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
        >
          <span className="theme-toggle-icon">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </span>
        </button>
      )}

      {!isAdmin && (
        <header className={`header ${navVisible ? 'nav-expanded' : 'nav-collapsed'} ${menuOpen ? 'menu-active' : ''}`}>
          <div className="header-top">
            <Link to="/" className="logo">
              <img src={assetPath('img/Talmaxlogo.logo.webp')} alt="TALMAX" />
            </Link>

            <div className="header-search-desktop hide-mobile">
              <SearchBar variant="desktop" {...sharedSearchBarProps} />
            </div>

            <div className="header-socials hide-mobile">
              <a href="https://www.instagram.com/talmaxprodutosodontologicos/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a href="https://www.facebook.com/talmaxprodutosodontologicos" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook size={16} />
              </a>
              <a href="https://www.youtube.com/@talmaxdigital" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <Youtube size={16} />
              </a>
            </div>

            <button
              className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
              onClick={handleMenuToggle}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
            >
              <span className="menu-toggle-bar" />
              <span className="menu-toggle-bar" />
              <span className="menu-toggle-bar" />
            </button>
          </div>

          <div className={`sub-header hide-mobile ${navVisible ? 'is-visible' : 'is-hidden'}`}>
            <div className="sub-header-inner">
              <nav className="nav-desktop">
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
                    <Link to="/categoria/talmax-digital" style={{ fontWeight: '700', color: 'var(--primary)' }}>Talmax Digital</Link>
                    <Link to="/categoria/protese-dentaria" style={{ fontWeight: '700', color: 'var(--primary)' }}>Prótese Dentária</Link>
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
            </div>
          </div>

          {searchOpen && (
            <SearchBar
              {...sharedSearchBarProps}
              variant="mobile"
              inputRef={searchInputRef}
              onClose={closeSearch}
            />
          )}

          <nav className={`nav-mobile ${menuOpen ? 'active' : ''}`}>
            <button
              className="search-trigger mobile-search-trigger"
              onClick={() => {
                closeMobileMenu();
                toggleSearch();
              }}
              aria-label={searchOpen ? 'Fechar busca' : 'Abrir busca'}
            >
              <Search size={18} />
              <span>Buscar no site</span>
            </button>

            <Link to="/" onClick={closeMobileMenu}>Home</Link>

            <div className="nav-mobile-item">
              <button
                type="button"
                className={`nav-mobile-trigger ${activeMobileSection === 'institucional' ? 'is-open' : ''}`}
                onClick={() => toggleMobileSection('institucional')}
                aria-expanded={activeMobileSection === 'institucional'}
              >
                <span>Institucional</span>
                <ChevronDown size={18} />
              </button>
              <div className={`nav-mobile-sub ${activeMobileSection === 'institucional' ? 'is-open' : ''}`}>
                <Link to="/quem-somos" onClick={closeMobileMenu}>Quem Somos</Link>
                <Link to="/historia-diretoria" onClick={closeMobileMenu}>História & Diretoria</Link>
                <Link to="/depoimentos" onClick={closeMobileMenu}>Depoimentos</Link>
              </div>
            </div>

            <div className="nav-mobile-item">
              <button
                type="button"
                className={`nav-mobile-trigger ${activeMobileSection === 'produtos' ? 'is-open' : ''}`}
                onClick={() => toggleMobileSection('produtos')}
                aria-expanded={activeMobileSection === 'produtos'}
              >
                <span>Produtos</span>
                <ChevronDown size={18} />
              </button>
              <div className={`nav-mobile-sub ${activeMobileSection === 'produtos' ? 'is-open' : ''}`}>
                <Link to="/produtos" onClick={closeMobileMenu} style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Ver Todos os Produtos</Link>
                <hr style={{ border: '0', borderTop: '1px solid rgba(255, 255, 255, 0.2)', margin: '5px 0' }} />
                <Link to="/categoria/talmax-digital" onClick={closeMobileMenu} style={{ fontWeight: '700' }}>Talmax Digital</Link>
                <Link to="/categoria/protese-dentaria" onClick={closeMobileMenu} style={{ fontWeight: '700' }}>Prótese Dentária</Link>
                <Link to="/categoria/nail-e-podologia" onClick={closeMobileMenu} style={{ fontWeight: '700' }}>Nail e Podologia</Link>
              </div>
            </div>

            <a href="https://mobywork.com.br" target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu}>Moby Work</a>
            <Link to="/blog" onClick={closeMobileMenu}>Blog</Link>

            <div className="nav-mobile-item">
              <button
                type="button"
                className={`nav-mobile-trigger ${activeMobileSection === 'servicos' ? 'is-open' : ''}`}
                onClick={() => toggleMobileSection('servicos')}
                aria-expanded={activeMobileSection === 'servicos'}
              >
                <span>Serviços</span>
                <ChevronDown size={18} />
              </button>
              <div className={`nav-mobile-sub ${activeMobileSection === 'servicos' ? 'is-open' : ''}`}>
                <Link to="/suporte" onClick={closeMobileMenu}>Suporte</Link>
                <Link to="/assistencia-tecnica" onClick={closeMobileMenu}>Assistência Técnica</Link>
              </div>
            </div>

            <Link to="/contato" onClick={closeMobileMenu}>Contato</Link>
            <Link to="/cursos" onClick={closeMobileMenu}>Cursos</Link>
            <Link to="https://talmax.com.br/portalcliente/" target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu}>Portal do Cliente</Link>

            <div className="nav-mobile-item">
              <button
                type="button"
                className={`nav-mobile-trigger ${activeMobileSection === 'sac' ? 'is-open' : ''}`}
                onClick={() => toggleMobileSection('sac')}
                aria-expanded={activeMobileSection === 'sac'}
              >
                <span>SAC</span>
                <ChevronDown size={18} />
              </button>
              <div className={`nav-mobile-sub ${activeMobileSection === 'sac' ? 'is-open' : ''}`}>
                <Link to="/sac" onClick={closeMobileMenu}>Fale Conosco</Link>
                <Link to="/politicas-troca" onClick={closeMobileMenu}>Políticas de Troca</Link>
              </div>
            </div>

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
                {withRouteLoader(<Admin />, 'Carregando painel...')}
              </ProtectedAdminRoute>
            }
          />
          <Route path="/privacidade" element={withRouteLoader(<PrivacyPolicy />, 'Carregando politica de privacidade...')} />

          <Route path="/quem-somos" element={withRouteLoader(<QuemSomos />, 'Carregando pagina institucional...')} />
          <Route path="/historia-diretoria" element={withRouteLoader(<HistoriaDiretoria />, 'Carregando historia e diretoria...')} />
          <Route path="/depoimentos" element={<PagePlaceholder title="Depoimentos" />} />

          <Route path="/produtos" element={withRouteLoader(<ProductCatalog />, 'Carregando catalogo...')} />
          <Route path="/categoria/talmax-digital" element={withRouteLoader(<TalmaxDigital />, 'Carregando Talmax Digital...')} />
          <Route path="/grupo-digital/:slug" element={withRouteLoader(<DigitalGroupPage />, 'Carregando grupo digital...')} />
          <Route path="/upcera" element={withRouteLoader(<Upcera />, 'Carregando Upcera...')} />
          <Route path="/scanners" element={withRouteLoader(<Scanners />, 'Carregando scanners...')} />
          <Route path="/impressoras-3d" element={withRouteLoader(<Impressoras3D />, 'Carregando impressoras 3D...')} />
          <Route path="/pagina/:slug" element={withRouteLoader(<CustomPage />, 'Carregando pagina...')} />
          <Route path="/categoria/:slug" element={withRouteLoader(<ProductCatalog />, 'Carregando catalogo...')} />
          <Route path="/produto/:id" element={withRouteLoader(<ProductDetail />, 'Carregando produto...')} />

          <Route path="/blog" element={<PagePlaceholder title="Blog" />} />

          <Route path="/suporte" element={withRouteLoader(<Support />, 'Carregando suporte...')} />
          <Route
            path="/assistencia-tecnica"
            element={withRouteLoader(<TechnicalAssistance />, 'Carregando assistencia tecnica...')}
          />

          <Route path="/contato" element={<PagePlaceholder title="Formulário de Contato" />} />
          <Route path="/comercial-comex" element={<PagePlaceholder title="Comercial / Comex" />} />

          <Route path="/cursos" element={<PagePlaceholder title="Cursos" />} />
          <Route path="/portal-cliente" element={<PagePlaceholder title="Portal do Cliente" />} />
          <Route path="/sac" element={<PagePlaceholder title="SAC - Fale Conosco" />} />
          <Route path="/politicas-troca" element={<PagePlaceholder title="Políticas de Troca" />} />
        </Routes>
      </main>

      {!isAdmin && (
        <footer className="footer">
          <div className="footer-grid">
            <div className="footer-section">
              <img src={assetPath('img/Talmaxlogo.logo.webp')} alt="TALMAX" className="footer-logo" />
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
              <p><MapPin size={16} /> Rua Benedito Carollo, 890 - Cidade Industrial de Curitiba</p>
              <p>Curitiba - PR - 81290-060</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Talmax. Todos os direitos reservados. | <Link to="/privacidade">Política de Privacidade</Link></p>
          </div>
        </footer>
      )}

      {!isAdmin && <CookieBanner />}
    </div>
  );
};

export default App;
