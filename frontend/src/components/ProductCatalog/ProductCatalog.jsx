/**
 * Pagina: ProductCatalog
 * Rota: /produtos e /categoria/:slug
 * Responsabilidade: listar produtos e aplicar filtros por busca e categoria
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ChevronRight,
  SlidersHorizontal,
  X,
  PackageSearch
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../ProductCard/ProductCard';
import API_URL from '../../services/api';
import { apiAssetPath } from '../../utils/assets';
import { parseSafeExtraData } from '../../utils/contentSafety';
import { getNormalizedCategoryNames, getVisibleCategoryLabel } from '../../utils/productCategories';
import './ProductCatalog.css';

const normalizeSearchText = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const featuredCategoryOrder = [
  'Troquelizacao',
  'Duplicadores',
  'Ceras',
  'Revestimentos',
  'Zirkon Ice',
  'Ligas Metálicas',
  'Soldas',
  'Corte e Acabamento',
  'Microscópio e Lupa',
  'Equipamentos',
  'Acessórios para Cerâmica',
  'T-Lithium',
  'Talmax Digital',
  'Blocos',
  'Linha Cad/Cam',
  'Linha de Ceramicas',
  'Resinas',
  'Prótese Dentária',
  'Nail e Podologia'
];

const normalizedFeaturedCategoryOrder = featuredCategoryOrder.map(normalizeSearchText);

const ProductCatalog = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategories, setActiveCategories] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/categories`)
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();
        setAllCategories(catData);

        const formattedProducts = prodData.map((product) => {
          const extra = parseSafeExtraData(product.extra_data);

          const segmentSlugs = ['talmax-digital', 'protese-dentaria', 'nail-e-podologia'];
          const segmentNames = catData
            .filter((category) => segmentSlugs.includes(category.slug))
            .map((category) => category.name);

          const productCatNames = getNormalizedCategoryNames(product.category_names);

          return {
            id: product.id,
            name: product.name,
            allCategoryNames: productCatNames,
            category: getVisibleCategoryLabel(productCatNames, segmentNames),
            image: product.main_image ? apiAssetPath(product.main_image) : '',
            ...extra,
            images: Array.isArray(extra.images) ? extra.images.map((image) => apiAssetPath(image)).filter(Boolean) : extra.images
          };
        });

        setProducts(formattedProducts);
      } catch (error) {
        console.error('Erro ao carregar dados do catálogo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryQuery = queryParams.get('categoria');
    const searchQuery = queryParams.get('busca') || '';

    setSearchTerm(searchQuery);

    if (categoryQuery && allCategories.length > 0) {
      const category = allCategories.find((item) => item.slug === categoryQuery);
      if (category) {
        setActiveCategories([category.name]);
        return;
      }
    }

    if (slug && allCategories.length > 0) {
      const category = allCategories.find((item) => item.slug === slug);
      if (category) {
        setActiveCategories([category.name]);
        return;
      }
    }

    setActiveCategories([]);
  }, [slug, location.search, allCategories]);

  const activeCategoryLabel = useMemo(() => {
    if (activeCategories.length === 0) {
      return 'Ver todos';
    }

    if (activeCategories.length === 1) {
      return activeCategories[0];
    }

    return `${activeCategories.length} categorias selecionadas`;
  }, [activeCategories]);

  const categoriesTree = useMemo(() => {
    const filteredCategories = allCategories.filter((category) =>
      normalizedFeaturedCategoryOrder.includes(normalizeSearchText(category.name))
    );

    return filteredCategories.sort(
      (a, b) =>
        normalizedFeaturedCategoryOrder.indexOf(normalizeSearchText(a.name)) -
        normalizedFeaturedCategoryOrder.indexOf(normalizeSearchText(b.name))
    );
  }, [allCategories]);

  const filteredProducts = useMemo(() => {
    const normalizedTerm = normalizeSearchText(searchTerm);

    return products.filter((product) => {
      const searchableContent = [
        product.name,
        product.category,
        ...(product.allCategoryNames || [])
      ]
        .filter(Boolean)
        .map(normalizeSearchText)
        .join(' ');

      const matchesSearch = !normalizedTerm || searchableContent.includes(normalizedTerm);

      if (activeCategories.length === 0) {
        return matchesSearch;
      }

      const categoriesToMatch = activeCategories.flatMap((selectedCategoryName) => {
        const currentCategory = allCategories.find((category) => category.name === selectedCategoryName);
        if (!currentCategory) {
          return [];
        }

        const matchedNames = [currentCategory.name];
        if (!currentCategory.parent_id) {
          const children = allCategories.filter((category) => category.parent_id === currentCategory.id);
          children.forEach((child) => matchedNames.push(child.name));
        }

        return matchedNames;
      });

      const matchesCategory = (product.allCategoryNames || []).some((name) =>
        categoriesToMatch.includes(name)
      );

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategories, products, allCategories]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleCategorySelect = (categoryName) => {
    setActiveCategories((current) =>
      current.includes(categoryName)
        ? current.filter((item) => item !== categoryName)
        : [...current, categoryName]
    );

    if (window.innerWidth < 768) {
      setIsDrawerOpen(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setActiveCategories([]);
    setIsDrawerOpen(false);
    navigate('/produtos');
  };

  return (
    <div className="catalog-container">
      <div className="catalog-hero-minimal">
        <div className="container-inner">
          <span className="top-tag">Tecnologia Odontológica</span>
          {activeCategories.length === 1 && activeCategories[0] === 'Talmax Digital' ? (
            <div className="digital-standard-header">
              <div className="digital-title-standard">
                <div className="line"></div>
                <h1>
                  TALMAX <strong>DIGITAL</strong>
                </h1>
                <div className="line"></div>
              </div>
              <p>O futuro da prótese dentária com tecnologia de ponta e precisão absoluta.</p>
            </div>
          ) : (
            <>
              <h1>
                Catálogo <span className="thin">Digital</span>
              </h1>
              <p>Explore nossa linha completa de soluções para prótese e estética dental.</p>
            </>
          )}
        </div>
      </div>

      {activeCategories.length === 1 && activeCategories[0] === 'Talmax Digital' && (
        <section className="digital-quick-nav">
          <div className="quick-nav-grid">
            {[
              { id: 'upcera', title: 'UPCERA', desc: 'Cerâmicas e Discos', icon: 'U' },
              { id: 'scanners', title: 'SCANNERS', desc: 'Intraoral e Bancada', icon: 'S' },
              { id: 'impressoras', title: 'IMPRESSORAS 3D', desc: 'Anycubic e Resinas', icon: '3D' },
              { id: 'componentes', title: 'COMPONENTES', desc: 'Peças e Estruturas', icon: 'C' },
              { id: 'insumos', title: 'INSUMOS', desc: 'Blocos e Ceras', icon: 'I' }
            ].map((item) => (
              <div
                key={item.id}
                className="quick-card-standard"
                onClick={() => {
                  if (item.id === 'upcera') {
                    navigate('/upcera');
                  } else {
                    setSearchTerm(item.title);
                    setActiveCategories([]);
                  }
                }}
              >
                <div className="card-icon-box">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <div className="card-arrow">
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!(activeCategories.length === 1 && activeCategories[0] === 'Talmax Digital') && (
        <header className="catalog-top-nav">
          <div className="top-nav-inner">
            <div className="category-quick-info">
              <span className="active-cat-label">{activeCategoryLabel}</span>
              <span className="results-count">{filteredProducts.length} itens</span>
            </div>

            <div className="catalog-actions">
              <div className="search-minimalist">
                <Search size={18} color="#86868b" />
                <input
                  type="text"
                  placeholder="O que você procura?"
                  value={searchTerm}
                  onChange={(event) => handleSearchChange(event.target.value)}
                />
              </div>
              <button
                className={`btn-filter-toggle ${activeCategories.length > 0 ? 'has-filters' : ''}`}
                onClick={() => setIsDrawerOpen(true)}
              >
                <SlidersHorizontal size={18} />
                <span>Filtrar</span>
              </button>
            </div>
          </div>
        </header>
      )}

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
                    className={activeCategories.length === 0 ? 'active' : ''}
                    onClick={resetFilters}
                  >
                    Ver todos
                  </button>

                  {categoriesTree.map((category) => (
                    <div key={category.id} className="category-group">
                      <button
                        className={`parent-cat ${activeCategories.includes(category.name) ? 'active' : ''}`}
                        onClick={() => handleCategorySelect(category.name)}
                      >
                        {category.name}
                        {activeCategories.includes(category.name) && <ChevronRight size={14} />}
                      </button>
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

      <main className="catalog-viewport">
        {isLoading ? (
          <div className="pro-loader">
            <div className="spinner-lux"></div>
            <p>Sincronizando catálogo...</p>
          </div>
        ) : activeCategories.length === 1 && activeCategories[0] === 'Talmax Digital' ? null : (
          <div className={`catalog-grid-lux ${activeCategories.length === 1 && activeCategories[0] === 'Talmax Digital' ? 'five-cols' : ''}`}>
            <AnimatePresence mode="popLayout">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))
              ) : (
                <div className="empty-state">
                  <PackageSearch size={60} strokeWidth={1} color="#d2d2d7" />
                  <h3>Nenhum produto encontrado</h3>
                  <p>Tente ajustar sua busca ou filtro para encontrar o que deseja.</p>
                  <button onClick={resetFilters} className="btn-clear-filters">
                    Ver todos os produtos
                  </button>
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
