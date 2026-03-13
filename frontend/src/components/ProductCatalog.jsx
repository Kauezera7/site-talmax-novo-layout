import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Search, 
  ChevronRight, 
  SlidersHorizontal, 
  X, 
  PackageSearch
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import './ProductCatalog.css';

const ProductCatalog = () => {
  const { slug } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]); 
  const [categories, setCategories] = useState([]); // Nova lista de categorias do banco

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('http://localhost:5000/api/products'),
          fetch('http://localhost:5000/api/categories')
        ]);
        
        const prodData = await prodRes.json();
        const catData = await catRes.json();

        // Formata os produtos
        const formattedProducts = prodData.map(p => {
          let extra = {};
          try {
            extra = typeof p.extra_data === 'string' ? JSON.parse(p.extra_data) : p.extra_data;
          } catch(e) { extra = {}; }

          return {
            id: p.id,
            name: p.name,
            // category agora pode ser uma string como "Gesso, Ceras"
            category: p.category_names || 'Sem categoria',
            image: p.main_image || '/img/placeholder.png',
            ...extra
          };
        });
        
        setProducts(formattedProducts);
        // Filtra apenas categorias marcadas como visíveis no banco
        setCategories(catData.filter(c => c.is_visible !== 0));
      } catch (err) {
        console.error("Erro ao carregar dados do catálogo:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const categoriesTree = useMemo(() => {
    const main = categories.filter(c => !c.parent_id);
    return main.map(parent => ({
      ...parent,
      children: categories.filter(c => c.parent_id === parent.id)
    }));
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeCategory === 'Todas') return matchesSearch;

      // Encontra a categoria ativa no banco para saber se ela tem filhos
      const currentCat = categories.find(c => c.name === activeCategory);
      if (!currentCat) return matchesSearch;

      // Se for uma categoria pai, pegamos o nome dela e de todos os filhos
      const categoriesToMatch = [currentCat.name];
      if (!currentCat.parent_id) {
        const children = categories.filter(c => c.parent_id === currentCat.id);
        children.forEach(child => categoriesToMatch.push(child.name));
      }

      // Verifica se alguma das categorias permitidas está no produto
      const productCategories = product.category.split(', ');
      const matchesCategory = productCategories.some(pc => categoriesToMatch.includes(pc));
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, products, categories]);


  const resetFilters = () => {
    setSearchTerm('');
    setActiveCategory('Todas');
  };

  return (
    <div className="catalog-container">
      {/* 1. Header de Título (Hero Estilo Showroom) */}
      <div className="catalog-hero-minimal">
        <div className="container-inner">
          <span className="top-tag">Tecnologia Odontológica</span>
          <h1>Catálogo <span className="thin">Digital</span></h1>
          <p>Explore nossa linha completa de soluções para prótese e estética dental.</p>
        </div>
      </div>

      {/* 2. Barra de Navegação e Filtros */}
      <header className="catalog-top-nav">
        <div className="top-nav-inner">
          <div className="category-quick-info">
            <span className="active-cat-label">{activeCategory}</span>
            <span className="results-count">{filteredProducts.length} itens</span>
          </div>
          
          <div className="catalog-actions">
            <div className="search-minimalist">
              <Search size={18} color="#86868b" />
              <input 
                type="text" 
                placeholder="O que você procura?" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className={`btn-filter-toggle ${activeCategory !== 'Todas' ? 'has-filters' : ''}`} 
              onClick={() => setIsDrawerOpen(true)}
            >
              <SlidersHorizontal size={18} />
              <span>Filtrar</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Drawer de Filtros */}
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
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              className="filter-drawer"
            >
              <div className="drawer-header">
                <h2>Categorias</h2>
                <button className="btn-close-drawer" onClick={() => setIsDrawerOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="drawer-content">
                <div className="options-stack">
                  <button 
                    className={activeCategory === 'Todas' ? 'active' : ''} 
                    onClick={() => {
                      setActiveCategory('Todas');
                      if (window.innerWidth < 768) setIsDrawerOpen(false);
                    }}
                  >
                    Todas as Categorias
                  </button>
                  
                  {categoriesTree.map(parent => (
                    <div key={parent.id} className="category-group">
                      <button 
                        className={`parent-cat ${activeCategory === parent.name ? 'active' : ''}`} 
                        onClick={() => {
                          setActiveCategory(parent.name);
                          if (window.innerWidth < 768) setIsDrawerOpen(false);
                        }}
                      >
                        {parent.name}
                        {activeCategory === parent.name && <ChevronRight size={14} />}
                      </button>
                      
                      {parent.children && parent.children.length > 0 && (
                        <div className="sub-options">
                          {parent.children.map(child => (
                            <button 
                              key={child.id} 
                              className={`child-cat ${activeCategory === child.name ? 'active' : ''}`} 
                              onClick={() => {
                                setActiveCategory(child.name);
                                if (window.innerWidth < 768) setIsDrawerOpen(false);
                              }}
                            >
                              {child.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="drawer-footer">
                <button className="btn-apply" onClick={() => setIsDrawerOpen(false)}>
                  Ver Resultados
                </button>
                <button className="btn-clear-all" onClick={resetFilters}>
                  Limpar Filtros
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 4. Grade de Produtos */}
      <main className="catalog-viewport">
        {isLoading ? (
          <div className="pro-loader">
            <div className="spinner-lux"></div>
            <p>Sincronizando catálogo...</p>
          </div>
        ) : (
          <div className="catalog-grid-lux">
            <AnimatePresence mode='popLayout'>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={index}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <PackageSearch size={60} strokeWidth={1} color="#d2d2d7" />
                  <h3>Nenhum produto encontrado</h3>
                  <p>Tente ajustar sua busca ou filtro para encontrar o que deseja.</p>
                  <button onClick={resetFilters} className="btn-clear-filters">Ver todos os produtos</button>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductCatalog;
