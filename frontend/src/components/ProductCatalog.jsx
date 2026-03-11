import React, { useState, useMemo, useEffect } from 'react';
import { products } from '../products';
import { 
  Search, 
  ChevronRight, 
  SlidersHorizontal, 
  X, 
  PackageSearch,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductCatalog.css';

const ProductCatalog = () => {
  // Estados para controle de busca e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  
  // Estados de Interface (UI)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Categorias únicas baseadas nos produtos
  const categoriesList = useMemo(() => {
    return ['Todas', ...new Set(products.map(p => p.category))];
  }, []);

  // Efeito para simular carregamento suave
  useEffect(() => {
    if (searchTerm || activeCategory !== 'Todas') {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 400);
      return () => clearTimeout(timer);
    }
  }, [activeCategory, searchTerm]);

  // Lógica de Filtragem
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeCategory === 'Todas' || product.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  // Se o usuário não pesquisou nada e não filtrou categoria, mostramos a GRADE DE CATEGORIAS
  const showCategoryGrid = searchTerm === '' && activeCategory === 'Todas';

  const resetFilters = () => {
    setSearchTerm('');
    setActiveCategory('Todas');
    window.scrollTo(0, 0);
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    window.scrollTo(0, 0);
  };

  return (
    <div className="catalog-container">
      {/* Header Superior (Busca e Botão de Filtro) */}
      <header className="catalog-top-nav">
        <div className="top-nav-inner">
          <div className="catalog-title">
            <span className="subtitle">Talmax Soluções</span>
            <h1 onClick={resetFilters} style={{ cursor: 'pointer' }}>Catálogo</h1>
          </div>
          
          <div className="catalog-actions">
            <div className="search-minimalist">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className={`btn-filter-toggle ${activeCategory !== 'Todas' ? 'has-filters' : ''}`} 
              onClick={() => setIsDrawerOpen(true)}
            >
              <SlidersHorizontal size={18} />
              <span>Filtros</span>
              {activeCategory !== 'Todas' && <span className="filter-badge">1</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer Lateral de Filtros */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="drawer-overlay"
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.aside 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="filter-drawer"
            >
              <div className="drawer-header">
                <h2>Categorias</h2>
                <button className="btn-close-drawer" onClick={() => setIsDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <div className="drawer-content">
                <div className="drawer-section">
                  <h3>Selecione uma área</h3>
                  <div className="options-stack">
                    {categoriesList.map(cat => (
                      <button 
                        key={cat} 
                        className={activeCategory === cat ? 'active' : ''} 
                        onClick={() => {
                          setActiveCategory(cat);
                          if (window.innerWidth < 768) setIsDrawerOpen(false);
                        }}
                      >
                        {cat}
                        <ChevronRight size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="drawer-footer">
                <button className="btn-apply" onClick={() => setIsDrawerOpen(false)}>
                  Ver Resultados
                </button>
                <button className="btn-clear-all" onClick={resetFilters}>
                  Limpar Tudo
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="catalog-viewport">
        {/* VIEW 1: GRADE DE CATEGORIAS (Início) */}
        {showCategoryGrid ? (
          <div className="category-selection-grid">
            {categoriesList.filter(c => c !== 'Todas').map(cat => {
              const firstProduct = products.find(p => p.category === cat);
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={cat} 
                  className="category-select-card" 
                  onClick={() => handleCategoryClick(cat)}
                >
                  <div className="category-product-preview">
                    <img 
                      src={firstProduct?.image || '/img/placeholder.webp'} 
                      alt={cat} 
                    />
                  </div>
                  <div className="category-select-info">
                    <span className="category-label">{cat}</span>
                    <h3>{firstProduct?.name}</h3>
                    <div className="category-card-footer">
                      Ver Produtos <ChevronRight size={16} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* VIEW 2: LISTA DETALHADA DE PRODUTOS (Após filtro ou busca) */
          <div className="product-list-container">
            <div className="viewport-header" style={{ marginBottom: '40px' }}>
              <p>Exibindo <strong>{filteredProducts.length}</strong> resultados para "{searchTerm || activeCategory}"</p>
            </div>

            {isLoading ? (
              <div className="loader-placeholder" style={{ textAlign: 'center', padding: '50px' }}>
                <p>Carregando produtos...</p>
              </div>
            ) : (
              <div className="product-list">
                <AnimatePresence>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <motion.div 
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="product-card"
                      >
                        <div className="product-image">
                          <img src={product.image} alt={product.name} onError={(e) => e.target.src = '/img/placeholder.webp'} />
                        </div>
                        <div className="product-info">
                          <span className="product-category-tag">{product.category}</span>
                          <h2>{product.name}</h2>
                          <p className="product-description">{product.description}</p>
                          
                          {product.features && (
                            <ul className="product-features">
                              {product.features.map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                          )}

                          {product.techInfo && (
                            <div className="tech-info-box">
                              <div className="tech-grid">
                                {Object.entries(product.techInfo).map(([key, val]) => (
                                  <div key={key}><strong>{key}:</strong> {val}</div>
                                ))}
                              </div>
                            </div>
                          )}

                          {product.models && (
                            <div className="models-table-container">
                              <table className="models-table">
                                <thead>
                                  <tr>
                                    {Object.keys(product.models[0]).map(key => (
                                      <th key={key}>{key.replace('code', 'Código ')}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {product.models.map((m, i) => (
                                    <tr key={i}>
                                      {Object.values(m).map((val, j) => <td key={j}>{val}</td>)}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          <a 
                            href={`https://wa.me/554130123456?text=Olá! Gostaria de mais informações sobre o produto: ${product.name}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-quote"
                          >
                            Solicitar Orçamento
                          </a>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="empty-lux" style={{ textAlign: 'center', padding: '100px 0' }}>
                      <PackageSearch size={64} strokeWidth={1} color="#ccc" style={{ marginBottom: '20px' }} />
                      <h3>Nenhum produto encontrado</h3>
                      <button onClick={resetFilters} className="btn-apply" style={{ marginTop: '20px' }}>Ver tudo</button>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductCatalog;
