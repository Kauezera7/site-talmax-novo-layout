import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Facebook,
  Youtube,
  Instagram,
  Search,
  Mail,
  Phone,
  MapPin,
  X,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';

import Home from './components/Home/Home';
import AdminLogin from './components/AdminLogin/AdminLogin';
import CookieBanner from './components/CookieBanner/CookieBanner';
import PagePlaceholder from './components/PagePlaceholder/PagePlaceholder';
import { validateAdminSession } from './services/adminAuth';
import { readStoredAdminSessionToken } from './services/adminSessionStorage';
import { subscribeToAdminSessionExpired } from './services/adminSessionEvents';
import API_URL from './services/api';
import { parseSafeExtraData } from './utils/contentSafety';
import { apiAssetPath, assetPath } from './utils/assets';
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
const Admin = lazy(() => import('./pages/Admin/AdminDashboard'));

const THEME_STORAGE_KEY = 'talmax-theme';
const LOADER_DELAY_MS = 1000;
const MAX_SEARCH_SUGGESTIONS = 10;
const MIN_SEARCH_TERM_LENGTH = 2;

const truncateSearchText = (value = '', maxLength = 160) => {
  const normalizedValue = String(value || '').replace(/\s+/g, ' ').trim();

  if (!normalizedValue) {
    return '';
  }

  if (normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, maxLength - 3).trim()}...`;
};

const normalizeSearchText = (value = '') =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

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
    if (!readStoredAdminSessionToken()) {
      setStatus('unauthenticated');
      return undefined;
    }

    let mounted = true;

    validateAdminSession({
      skipWhenNoStoredToken: true,
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

const SearchSuggestionsDropdown = ({
  searchTerm,
  suggestions,
  totalMatches,
  previewProduct,
  onPreviewChange,
  onSelectProduct
}) => {
  const trimmedSearchTerm = searchTerm.trim();

  if (!trimmedSearchTerm) {
    return null;
  }

  if (suggestions.length === 0) {
    return (
      <div className="site-search-dropdown" role="presentation">
        <div className="site-search-dropdown-empty">
          <strong>Nenhum produto encontrado</strong>
          <span>Continue digitando ou clique em Buscar para procurar no catalogo completo.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="site-search-dropdown" role="presentation">
      <div className="site-search-dropdown-grid">
        <div className="site-search-dropdown-results">
          <div className="site-search-dropdown-heading">
            <strong>Produtos</strong>
            <span>
              Mostrando {suggestions.length}
              {totalMatches > suggestions.length ? ` de ${totalMatches}` : ''}
            </span>
          </div>

          <div className="site-search-suggestion-list" role="listbox" aria-label="Sugestoes de produtos">
            {suggestions.map((product) => {
              const isActive = previewProduct?.id === product.id;

              return (
                <button
                  key={product.id}
                  type="button"
                  className={`site-search-suggestion-item ${isActive ? 'is-active' : ''}`}
                  onMouseEnter={() => onPreviewChange(product.id)}
                  onFocus={() => onPreviewChange(product.id)}
                  onClick={() => onSelectProduct(product)}
                >
                  <span className="site-search-suggestion-name">{product.name}</span>
                  <span className="site-search-suggestion-meta">{product.categoryLabel || 'Produto Talmax'}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="site-search-preview-panel">
          <div className="site-search-preview-media">
            {previewProduct?.image ? (
              <img src={previewProduct.image} alt={previewProduct.name} />
            ) : (
              <div className="site-search-preview-placeholder">
                <span>{previewProduct?.name || 'Produto'}</span>
              </div>
            )}
          </div>

          <div className="site-search-preview-body">
            <span className="site-search-preview-eyebrow">Pre-visualizacao</span>
            <h4>{previewProduct?.name}</h4>
            <span className="site-search-preview-category">{previewProduct?.categoryLabel || 'Produto Talmax'}</span>
            <p>
              {truncateSearchText(previewProduct?.description, 180) || 'Passe o mouse sobre um nome da lista para visualizar o produto aqui.'}
            </p>
            <button
              type="button"
              className="site-search-preview-cta"
              onClick={() => previewProduct && onSelectProduct(previewProduct)}
            >
              Ver produto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchProducts, setSearchProducts] = useState([]);
  const [searchProductsLoaded, setSearchProductsLoaded] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [searchPreviewId, setSearchPreviewId] = useState(null);
  const [navVisible, setNavVisible] = useState(true);
  const searchInputRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const tickingScrollRef = useRef(false);
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

  const normalizedSearchTerm = normalizeSearchText(searchTerm);
  const shouldShowSearchDropdown = searchDropdownOpen && normalizedSearchTerm.length >= MIN_SEARCH_TERM_LENGTH;

  const productSearchMatches = useMemo(() => {
    if (isAdmin || normalizedSearchTerm.length < MIN_SEARCH_TERM_LENGTH) {
      return [];
    }

    return searchProducts
      .filter((product) => normalizeSearchText(product.name).includes(normalizedSearchTerm))
      .sort((productA, productB) => {
        const normalizedNameA = normalizeSearchText(productA.name);
        const normalizedNameB = normalizeSearchText(productB.name);
        const startsWithA = normalizedNameA.startsWith(normalizedSearchTerm);
        const startsWithB = normalizedNameB.startsWith(normalizedSearchTerm);

        if (startsWithA !== startsWithB) {
          return startsWithA ? -1 : 1;
        }

        const positionA = normalizedNameA.indexOf(normalizedSearchTerm);
        const positionB = normalizedNameB.indexOf(normalizedSearchTerm);

        if (positionA !== positionB) {
          return positionA - positionB;
        }

        return productA.name.localeCompare(productB.name, 'pt-BR');
      });
  }, [isAdmin, normalizedSearchTerm, searchProducts]);

  const productSuggestions = useMemo(
    () => productSearchMatches.slice(0, MAX_SEARCH_SUGGESTIONS),
    [productSearchMatches]
  );
  const searchMatchesTotal = productSearchMatches.length;

  const previewProduct = useMemo(
    () => productSuggestions.find((product) => product.id === searchPreviewId) || productSuggestions[0] || null,
    [productSuggestions, searchPreviewId]
  );

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (isAdmin) {
      setSearchProducts([]);
      setSearchProductsLoaded(false);
      return undefined;
    }

    if (normalizedSearchTerm.length < MIN_SEARCH_TERM_LENGTH) {
      return undefined;
    }

    if (searchProductsLoaded) {
      return undefined;
    }

    const controller = new AbortController();
    let active = true;

    const fetchSearchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar produtos da busca');
        }

        const data = await response.json();

        if (!active) {
          return;
        }

        const items = Array.isArray(data) ? data : (data.items || []);

        setSearchProducts(items.map((product) => {
          const extra = parseSafeExtraData(product.extra_data);
          const fallbackImage = Array.isArray(extra.images) ? extra.images[0] : '';
          const categoryLabel = String(product.category_names || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 2)
            .join(' • ');

          return {
            id: product.id,
            name: product.name || '',
            description: product.description || extra.features?.[0] || '',
            categoryLabel,
            image: product.main_image ? apiAssetPath(product.main_image) : (fallbackImage ? apiAssetPath(fallbackImage) : '')
          };
        }));
        setSearchProductsLoaded(true);
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }

        if (active) {
          console.error('Erro ao carregar produtos da busca:', error);
          setSearchProducts([]);
          setSearchProductsLoaded(false);
        }
      }
    };

    const timeoutId = window.setTimeout(fetchSearchProducts, 180);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [isAdmin, normalizedSearchTerm, searchProductsLoaded]);

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

  useEffect(() => {
    if (!shouldShowSearchDropdown || productSuggestions.length === 0) {
      setSearchPreviewId(null);
      return;
    }

    setSearchPreviewId((currentPreviewId) => (
      currentPreviewId && productSuggestions.some((product) => product.id === currentPreviewId)
        ? currentPreviewId
        : productSuggestions[0].id
    ));
  }, [productSuggestions, shouldShowSearchDropdown]);

  useEffect(() => {
    const handleDocumentPointerDown = (event) => {
      if (event.target instanceof Element && event.target.closest('[data-site-search-root="true"]')) {
        return;
      }

      setSearchDropdownOpen(false);
    };

    document.addEventListener('pointerdown', handleDocumentPointerDown);

    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown);
    };
  }, []);

  useEffect(() => {
    setSearchDropdownOpen(false);
    setSearchPreviewId(null);
    
    // Sincroniza o input do Header com a busca da URL
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('busca') || '';
    if (searchQuery !== searchTerm) {
      setSearchTerm(searchQuery);
    }
  }, [location.pathname, location.search]);

  const resetSearchState = () => {
    setSearchTerm('');
    setSearchDropdownOpen(false);
    setSearchPreviewId(null);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    resetSearchState();
  };

  const handleSearchInputChange = (value) => {
    setSearchTerm(value);
    setSearchDropdownOpen(normalizeSearchText(value).length >= MIN_SEARCH_TERM_LENGTH);

    // BUSCA AO VIVO: Se estiver no catálogo, atualiza a URL enquanto digita
    if (location.pathname === '/produtos' || location.pathname.startsWith('/categoria/')) {
      const params = new URLSearchParams(location.search);
      if (value.trim()) {
        params.set('busca', value.trim());
      } else {
        params.delete('busca');
      }
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  };

  const handleSearchInputFocus = () => {
    if (normalizedSearchTerm.length >= MIN_SEARCH_TERM_LENGTH) {
      setSearchDropdownOpen(true);
    }
  };

  const handleSearchInputKeyDown = (event) => {
    if (event.key === 'Escape') {
      setSearchDropdownOpen(false);

      if (searchOpen) {
        setSearchOpen(false);
      }

      return;
    }

    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && productSuggestions.length > 0) {
      event.preventDefault();
      setSearchDropdownOpen(true);

      const currentIndex = productSuggestions.findIndex((product) => product.id === (searchPreviewId || productSuggestions[0].id));
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex = (currentIndex + direction + productSuggestions.length) % productSuggestions.length;

      setSearchPreviewId(productSuggestions[nextIndex].id);
    }
  };

  const handleProductSuggestionSelect = (product) => {
    navigate(`/produto/${product.id}`);
    setMenuOpen(false);
    setSearchOpen(false);
    resetSearchState();
  };

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
      resetSearchState();
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
    resetSearchState();
    setMenuOpen(false);
  };

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
        <header className={`header ${navVisible ? 'nav-expanded' : 'nav-collapsed'}`}>
          <div className="header-top">
            <Link to="/" className="logo">
              <img src={assetPath('img/Talmaxlogo.webp')} alt="TALMAX" />
            </Link>

            <div className="header-search-desktop hide-mobile">
              <div className="site-search-shell site-search-shell-desktop" data-site-search-root="true">
                <form className="header-search-inline" onSubmit={handleSearchSubmit}>
                  <Search size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => handleSearchInputChange(event.target.value)}
                    onFocus={handleSearchInputFocus}
                    onKeyDown={handleSearchInputKeyDown}
                    placeholder="Buscar produtos pelo nome..."
                    aria-expanded={shouldShowSearchDropdown}
                    aria-haspopup="listbox"
                  />
                  <button type="submit">Buscar</button>
                </form>

                {shouldShowSearchDropdown && (
                  <SearchSuggestionsDropdown
                    searchTerm={searchTerm}
                    suggestions={productSuggestions}
                    totalMatches={searchMatchesTotal}
                    previewProduct={previewProduct}
                    onPreviewChange={setSearchPreviewId}
                    onSelectProduct={handleProductSuggestionSelect}
                  />
                )}
              </div>
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
              onClick={() => setMenuOpen(!menuOpen)}
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
            <div className="header-search-bar">
              <div className="site-search-shell site-search-shell-mobile" data-site-search-root="true">
                <form className="header-search-input-wrap" onSubmit={handleSearchSubmit}>
                  <Search size={18} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(event) => handleSearchInputChange(event.target.value)}
                    onFocus={handleSearchInputFocus}
                    onKeyDown={handleSearchInputKeyDown}
                    aria-expanded={shouldShowSearchDropdown}
                    aria-haspopup="listbox"
                    placeholder="Digite o nome do produto..."
                  />
                  <button
                    type="button"
                    className="header-search-close"
                    onClick={closeSearch}
                    aria-label="Fechar busca"
                  >
                    <X size={16} />
                  </button>
                </form>

                {shouldShowSearchDropdown && (
                  <SearchSuggestionsDropdown
                    searchTerm={searchTerm}
                    suggestions={productSuggestions}
                    totalMatches={searchMatchesTotal}
                    previewProduct={previewProduct}
                    onPreviewChange={setSearchPreviewId}
                    onSelectProduct={handleProductSuggestionSelect}
                  />
                )}
              </div>
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
                <Link to="/historia-diretoria" onClick={() => setMenuOpen(false)}>História & Diretoria</Link>
              </div>
            </div>

            <div className="nav-mobile-item">
              <span>Produtos</span>
              <div className="nav-mobile-sub">
                <Link to="/produtos" onClick={() => setMenuOpen(false)} style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Ver Todos os Produtos</Link>
                <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '5px 0' }} />
                <Link to="/categoria/talmax-digital" onClick={() => setMenuOpen(false)} style={{ fontWeight: '700' }}>Talmax Digital</Link>
                <Link to="/categoria/protese-dentaria" onClick={() => setMenuOpen(false)} style={{ fontWeight: '700' }}>Prótese Dentária</Link>
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
          <Route path="/assistencia-tecnica" element={<PagePlaceholder title="Assistência Técnica" />} />

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
              <img src={assetPath('img/Talmaxlogo.webp')} alt="TALMAX" className="footer-logo" />
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
