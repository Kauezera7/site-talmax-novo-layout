import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

const ProductCard = ({ product, onClick }) => {
  const [activeImage, setActiveImage] = React.useState(product.image);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="product-card"
      onClick={() => onClick(product)}
    >
      <div className="product-image-container">
        <div className="product-image">
          <img 
            src={activeImage} 
            alt={product.name} 
            onError={(e) => e.target.src = '/img/placeholder.webp'} 
          />
        </div>
        {product.images && product.images.length > 1 && (
          <div className="product-thumbnails" onClick={(e) => e.stopPropagation()}>
            {product.images.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={`${product.name} thumbnail ${idx}`} 
                className={activeImage === img ? 'active' : ''}
                onClick={() => setActiveImage(img)}
              />
            ))}
          </div>
        )}
      </div>
      <div className="product-info">
        <span className="product-category-tag">{product.category}</span>
        <h2>{product.name}</h2>
        <p className="product-description">{product.description.substring(0, 150)}...</p>
      </div>
    </motion.div>
  );
};

const ProductImmersiveView = ({ product, onClose }) => {
  const [activeImage, setActiveImage] = useState(product.image);

  if (!product) return null;

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      className="immersive-view"
    >
      <header className="immersive-header">
        <button className="btn-back" onClick={onClose}>
          <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          <span>Voltar para o Catálogo</span>
        </button>
        <div className="immersive-logo">
          <img src="/img/Talmaxlogo.webp" alt="Talmax" />
        </div>
        <button className="immersive-close" onClick={onClose}>
          <X size={24} />
        </button>
      </header>

      <div className="immersive-content">
        <div className="immersive-grid">
          {/* Lado Esquerdo: Galeria e CTA fixo */}
          <div className="immersive-gallery">
            <motion.div 
              key={activeImage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="immersive-main-image"
            >
              <img src={activeImage} alt={product.name} />
            </motion.div>
            
            {product.images && product.images.length > 1 && (
              <div className="immersive-thumbnails">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    className={activeImage === img ? 'active' : ''} 
                    onClick={() => setActiveImage(img)}
                  >
                    <img src={img} alt="thumb" />
                  </button>
                ))}
              </div>
            )}

            <div className="immersive-sidebar-actions">
              <a 
                href={`https://wa.me/554130123456?text=Olá! Desejo informações sobre o produto: ${product.name}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-immersive-quote"
              >
                Solicitar Cotação Comercial
              </a>
              <p className="quote-hint">Fale agora com um especialista Talmax</p>
            </div>
          </div>

          {/* Lado Direito: Tudo Exposto (Sem Scroll Interno) */}
          <div className="immersive-info-full">
            <div className="info-main-header">
              <span className="info-category">{product.category}</span>
              <h1 className="info-title">{product.name}</h1>
              <p className="info-description-large">{product.description}</p>
            </div>

            {/* Diferenciais Visíveis de Cara */}
            {product.features && (
              <div className="exposure-group">
                <h3 className="section-label">Diferenciais do Produto</h3>
                <ul className="feature-tags-large">
                  {product.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            )}

            {/* Especificações Técnicas Diretas */}
            {product.techInfo && (
              <div className="exposure-group">
                <h3 className="section-label">Especificações Técnicas</h3>
                <div className="tech-specs-grid-exposed">
                  {Object.entries(product.techInfo).map(([key, val]) => (
                    <div className="spec-item-exposed" key={key}>
                      <span className="spec-label">{key}</span>
                      <span className="spec-value">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabela de Modelos Totalmente Aberta */}
            {product.models && (
              <div className="exposure-group">
                <h3 className="section-label">Modelos e Referências</h3>
                <div className="table-exposed-container">
                  <table className="table-exposed">
                    <thead>
                      <tr>
                        {Object.keys(product.models[0]).map(key => (
                          <th key={key}>{key.replace('code', 'Cód. ')}</th>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProductCatalog = () => {
  const { slug } = useParams();
  
  // Estados para controle de busca e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Estados de Interface (UI)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Categorias únicas baseadas nos produtos
  const categoriesList = useMemo(() => {
    return ['Todas', ...new Set(products.map(p => p.category))];
  }, []);

  // Efeito para lidar com slug da URL (ex: /categoria/talmax-digital)
  useEffect(() => {
    if (slug) {
      // Mapeamento simples de slug para nome da categoria
      const categoryFromSlug = categoriesList.find(
        cat => cat.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
      );
      
      if (categoryFromSlug) {
        setActiveCategory(categoryFromSlug);
      }
    } else {
      setActiveCategory('Todas');
    }
  }, [slug, categoriesList]);

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

  // Se o usuário não pesquisou nada, não filtrou categoria e NÃO VEM via URL (slug), mostramos a GRADE
  const showCategoryGrid = searchTerm === '' && activeCategory === 'Todas' && !slug;

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
            {categoriesList
              .filter(c => c !== 'Todas' && c !== 'Talmax Digital')
              .map(cat => {
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
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onClick={(p) => setSelectedProduct(p)}
                      />
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

      {/* Visão Imersiva do Produto (Full Screen) */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductImmersiveView 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductCatalog;
