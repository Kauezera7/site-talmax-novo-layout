/**
 * Pagina: ProductDetail
 * Rota: /produto/:id
 * Responsabilidade: exibir detalhes do produto, galeria, modelos e relacionados
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Package,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../ProductCard/ProductCard';
import API_URL from '../../services/api';
import { apiAssetPath, assetPath } from '../../utils/assets';
import { getVisibleCategoryLabel } from '../../utils/productCategories';
import 'swiper/css';
import 'swiper/css/navigation';
import './ProductDetail.css';

const shouldShowQuoteButton = (value) => !(
  value === false ||
  value === 'false' ||
  value === 0 ||
  value === '0'
);

const normalizeModelTable = (modelTable) => {
  const fallback = {
    headers: ['Tipo / Referencia', 'Codigo'],
    rows: [['', '']]
  };

  if (!modelTable || !Array.isArray(modelTable.headers) || !Array.isArray(modelTable.rows)) {
    return fallback;
  }

  const headers = modelTable.headers.length > 0
    ? modelTable.headers.map((header) => (typeof header === 'string' ? header : ''))
    : fallback.headers;

  const rows = modelTable.rows.length > 0
    ? modelTable.rows.map((row) => {
      const normalizedRow = Array.isArray(row) ? row.map((cell) => (typeof cell === 'string' ? cell : '')) : [];
      while (normalizedRow.length < headers.length) {
        normalizedRow.push('');
      }
      return normalizedRow.slice(0, headers.length);
    })
    : fallback.rows;

  return { headers, rows };
};

const normalizeDynamicSections = (sections, legacySections = []) => {
  const source = Array.isArray(sections) && sections.length > 0 ? sections : legacySections;

  return Array.isArray(source)
    ? source
      .map((section, index) => ({
        id: section?.id ? `dynamic-${section.id}` : `dynamic-${index}`,
        title: typeof section?.title === 'string' ? section.title.trim() : '',
        content: typeof section?.content === 'string' ? section.content : '',
        contentAsList: Boolean(section?.contentAsList || section?.content_as_list),
        type: section?.type === 'table' ? 'table' : 'content',
        showModelSection: section?.showModelSection !== false,
        hideModelData: Boolean(section?.hideModelData),
        singleCellFirstRow: Boolean(section?.singleCellFirstRow),
        modelTitle: typeof section?.modelTitle === 'string' ? section.modelTitle : '',
        modelTable: section?.type === 'table' ? normalizeModelTable(section?.modelTable) : null
      }))
      .filter((section) => (
        section.title && (
          (section.type === 'table' && section.modelTable)
          || (section.type !== 'table' && section.content.trim())
        )
      ))
    : [];
};

const renderSectionContent = (content, asList = false) => {
  if (asList) {
    return (
      <ul className="description-list">
        {content.split('\n').filter((line) => line.trim() !== '').map((line, idx) => (
          <li key={idx}><CheckCircle2 size={16} className="text-primary" /> {line}</li>
        ))}
      </ul>
    );
  }

  return <p>{content}</p>;
};

const isLegacyDefaultDescriptionTabLabel = (label) => {
  const normalizedLabel = String(label || '')
    .trim()
    .toLocaleLowerCase('pt-BR');

  return normalizedLabel === 'descricao detalhada';
};

const isLegacyDefaultTechnicalTabLabel = (label) => {
  const normalizedLabel = String(label || '')
    .trim()
    .toLocaleLowerCase('pt-BR');

  return normalizedLabel === 'informacao tecnica';
};

const normalizeCategoryIds = (value) => (
  Array.isArray(value)
    ? value.map(Number).filter((id) => Number.isFinite(id))
    : []
);

const shuffleProducts = (products) => {
  const shuffled = [...products];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [isFeaturesCollapsed, setIsFeaturesCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const [prodRes, allRes] = await Promise.all([
          fetch(`${API_URL}/products/${id}`),
          fetch(`${API_URL}/products`)
        ]);

        if (!prodRes.ok) {
          navigate('/produtos');
          return;
        }

        const data = await prodRes.json();
        const others = await allRes.json();

        let extra = {};
        try {
          if (data.extra_data) {
            extra = typeof data.extra_data === 'string' ? JSON.parse(data.extra_data) : data.extra_data;
          }
        } catch (e) {
          console.error('Erro ao processar dados extras:', e);
          extra = {};
        }

        if (!extra) extra = {};

        let finalTable = extra.modelTable;
        if (!finalTable && extra.models && extra.models.length > 0) {
          finalTable = {
            headers: extra.modelHeaders || ['Tipo / Referencia', 'Codigo'],
            rows: (typeof extra.models[0] === 'object' && !Array.isArray(extra.models[0]))
              ? extra.models.map((model) => [model.type || '', model.code || ''])
              : extra.models
          };
        }

        const fixedSegmentNames = ['Talmax Digital', 'Protese Dentaria', 'Nail e Podologia'];

        const formattedProduct = {
          id: data.id,
          name: data.name,
          category: getVisibleCategoryLabel(data.category_names || data.category_name || '', fixedSegmentNames),
          categoryIds: normalizeCategoryIds(data.category_ids),
          description: data.description,
          image: data.main_image ? apiAssetPath(data.main_image) : assetPath('img/placeholder.png'),
          product_tabs: Array.isArray(data.product_tabs) ? data.product_tabs : [],
          ...extra,
          images: Array.isArray(extra.images) ? extra.images.map((image) => apiAssetPath(image)) : extra.images,
          modelTable: finalTable
        };

        setProduct(formattedProduct);
        setActiveImage(formattedProduct.image);
        setIsFeaturesCollapsed(true);
        setActiveTab('description');
        setAllProducts(others.map((currentProduct) => ({
          id: currentProduct.id,
          name: currentProduct.name,
          category: getVisibleCategoryLabel(
            currentProduct.category_names || currentProduct.category_name || '',
            fixedSegmentNames
          ),
          categoryIds: normalizeCategoryIds(currentProduct.category_ids),
          image: currentProduct.main_image
            ? apiAssetPath(currentProduct.main_image)
            : assetPath('img/placeholder.png'),
          images: []
        })));
      } catch (err) {
        console.error('Erro ao carregar detalhes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const handleNextImage = () => {
    if (!product || !Array.isArray(product.images) || product.images.length === 0) return;
    const currentIndex = product.images.indexOf(activeImage);
    const nextIndex = (currentIndex + 1) % product.images.length;
    setActiveImage(product.images[nextIndex]);
  };

  const handlePrevImage = () => {
    if (!product || !Array.isArray(product.images) || product.images.length === 0) return;
    const currentIndex = product.images.indexOf(activeImage);
    const prevIndex = (currentIndex - 1 + product.images.length) % product.images.length;
    setActiveImage(product.images[prevIndex]);
  };

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    const currentCategoryIds = normalizeCategoryIds(product.categoryIds);

    const matchingProducts = allProducts
      .filter((currentProduct) => {
        if (currentProduct.id === product.id) {
          return false;
        }

        const relatedCategoryIds = normalizeCategoryIds(currentProduct.categoryIds);

        if (currentCategoryIds.length > 0 && relatedCategoryIds.length > 0) {
          return relatedCategoryIds.some((categoryId) => currentCategoryIds.includes(categoryId));
        }

        return currentProduct.category === product.category;
      });
    
    return shuffleProducts(matchingProducts).slice(0, 6);
  }, [product, allProducts]);

  const modelRowsToRender = useMemo(() => {
    if (!product?.modelTable?.rows) {
      return [];
    }

    if (product.hideModelData) {
      return [];
    }

    return product.modelTable.rows;
  }, [product]);

  const dynamicSections = useMemo(
    () => normalizeDynamicSections(product?.product_tabs, product?.dynamicSections),
    [product]
  );

  const descriptionTabLabel = useMemo(
    () => {
      const rawLabel = product?.descriptionTabLabel?.trim() || '';

      if (!rawLabel) {
        return '';
      }

      if (dynamicSections.length === 0 && isLegacyDefaultDescriptionTabLabel(rawLabel)) {
        return '';
      }

      return rawLabel;
    },
    [dynamicSections.length, product?.descriptionTabLabel]
  );

  const technicalTabLabel = useMemo(() => {
    const rawLabel = product?.technicalTabLabel?.trim() || '';

    if (!rawLabel) {
      return '';
    }

    if (isLegacyDefaultTechnicalTabLabel(rawLabel)) {
      return '';
    }

    return rawLabel;
  }, [product?.technicalTabLabel]);

  const shouldUseCustomTabs = dynamicSections.length > 0;

  const hasTechnicalContent = useMemo(() => (
    Boolean(
      (Array.isArray(product?.techSpecs) && product.techSpecs.length > 0)
      || (product?.modelTable && product.showModelSection !== false)
    )
  ), [product]);

  const availableTabs = useMemo(() => {
    const tabs = [];

    if (!shouldUseCustomTabs && descriptionTabLabel && product?.description?.trim()) {
      tabs.push({
        id: 'description',
        label: descriptionTabLabel
      });
    }

    dynamicSections.forEach((section) => {
      if (section.type === 'table' && section.showModelSection === false) {
        return;
      }

      tabs.push({ id: section.id, label: section.title });
    });

    if (hasTechnicalContent) {
      tabs.push({
        id: 'specs',
        label: technicalTabLabel || 'Informacoes Tecnicas'
      });
    }

    return tabs;
  }, [descriptionTabLabel, dynamicSections, hasTechnicalContent, product?.description, shouldUseCustomTabs, technicalTabLabel]);

  useEffect(() => {
    if (!availableTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(availableTabs[0]?.id || 'description');
    }
  }, [activeTab, availableTabs]);

  if (loading) return <div className="detail-loader">Carregando...</div>;
  if (!product) return null;

  const whatsappMessage = encodeURIComponent(`Ola! Gostaria de mais informacoes sobre o produto: ${product.name}`);
  const whatsappUrl = `https://wa.me/554130123456?text=${whatsappMessage}`;

  return (
    <div className="product-detail-container">
      <div className="container-inner">
        <nav className="breadcrumb">
          <Link to="/produtos">Produtos</Link>
          <ChevronRight size={14} />
          <span>{product.category}</span>
          <ChevronRight size={14} />
          <span className="current">{product.name}</span>
        </nav>

        <button onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        <div className="product-detail-grid">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="product-images-section"
          >
            <div className="main-image-card">
              <img src={activeImage} alt={product.name} />
              {product.images && product.images.length > 1 && (
                <>
                  <button className="img-nav-btn prev" onClick={handlePrevImage}><ChevronLeft size={24} /></button>
                  <button className="img-nav-btn next" onClick={handleNextImage}><ChevronRight size={24} /></button>
                </>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-grid">
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`thumb-item ${activeImage === img ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img src={img} alt={`${product.name} ${idx}`} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="product-info-section"
          >
            <span className="product-category-tag">{product.category}</span>
            <h1 className="product-title">{product.name}</h1>
            <div className="product-description">
              {product.descriptionAsList ? (
                <ul className="description-list">
                  {product.description.split('\n').filter((line) => line.trim() !== '').map((line, idx) => (
                    <li key={idx}><CheckCircle2 size={16} className="text-primary" /> {line}</li>
                  ))}
                </ul>
              ) : (
                product.description
              )}
            </div>

            {product.features && product.features.length > 0 && (
              <div className="product-features">
                <button
                  type="button"
                  className="product-features__toggle"
                  onClick={() => setIsFeaturesCollapsed((current) => !current)}
                  aria-expanded={!isFeaturesCollapsed}
                >
                  <span className="product-features__title">
                    <Info size={18} /> Caracteristicas Principais
                  </span>
                  <span className="product-features__action">
                    {isFeaturesCollapsed ? 'Expandir' : 'Recolher'}
                    <ChevronRight
                      size={18}
                      className={`product-features__chevron ${isFeaturesCollapsed ? 'is-collapsed' : ''}`}
                    />
                  </span>
                </button>
                {!isFeaturesCollapsed && (
                  <ul>
                    {product.features.map((feature, idx) => (
                      <li key={idx}><CheckCircle2 size={16} className="text-primary" /><span>{feature}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {shouldShowQuoteButton(product.showQuoteButton) && (
              <div className="product-actions">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp-quote">
                  <MessageCircle size={20} /> Solicitar Orcamento
                </a>
              </div>
            )}
          </motion.div>
        </div>

        {availableTabs.length > 0 && (
          <div className="product-tabs-section">
            <div className="tabs-header">
              {availableTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="tab-content"
            >
              {!shouldUseCustomTabs && activeTab === 'description' && (
                <div className="detailed-description-content">
                  {renderSectionContent(product.description, product.descriptionAsList)}
                </div>
              )}

              {dynamicSections.map((section) => (
                activeTab === section.id && (
                  <div key={section.id} className="detailed-description-content">
                    {section.type === 'table' ? (
                      section.showModelSection !== false && section.modelTable && (
                        <div className="models-table-wrapper">
                          <div className="section-title-group">
                            <Package size={24} className="text-primary" />
                            <h2>{section.modelTitle || section.title}</h2>
                          </div>

                          <div className="table-container">
                            <table className={`models-table ${section.hideModelData ? 'strip-mode' : ''}`}>
                              <thead>
                                <tr>
                                  {section.singleCellFirstRow ? (
                                    <th colSpan={section.modelTable.headers.length} className="models-table__single-cell-row">
                                      {section.modelTable.headers[0]}
                                    </th>
                                  ) : (
                                    section.modelTable.headers.map((header, index) => <th key={index}>{header}</th>)
                                  )}
                                </tr>
                              </thead>
                              {!section.hideModelData && (
                                <tbody>
                                  {section.modelTable.rows.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                      {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
                                    </tr>
                                  ))}
                                </tbody>
                              )}
                            </table>
                          </div>
                        </div>
                      )
                    ) : (
                      renderSectionContent(section.content, section.contentAsList)
                    )}
                  </div>
                )
              ))}

              {activeTab === 'specs' && (
                <div className="specs-content">
                  {product.techSpecs && product.techSpecs.length > 0 && (
                    <div className="tech-specs-grid">
                      {product.techSpecs.map((spec, idx) => (
                        <div key={idx} className="spec-item">
                          <span className="spec-label">{spec.label}</span>
                          <span className="spec-value">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {(product.modelTable && product.showModelSection !== false) && (
                    <div className="models-table-wrapper">
                      <div className="section-title-group">
                        <Package size={24} className="text-primary" />
                        <h2>{product.modelTitle || 'Modelos / Codigos'}</h2>
                      </div>

                      <div className="table-container">
                        <table className={`models-table ${product.hideModelData ? 'strip-mode' : ''}`}>
                          <thead>
                            <tr>
                              {product.singleCellFirstRow ? (
                                <th colSpan={product.modelTable.headers.length} className="models-table__single-cell-row">
                                  {product.modelTable.headers[0]}
                                </th>
                              ) : (
                                product.modelTable.headers.map((header, index) => <th key={index}>{header}</th>)
                              )}
                            </tr>
                          </thead>
                          {!product.hideModelData && (
                            <tbody>
                              {modelRowsToRender.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
                                </tr>
                              ))}
                            </tbody>
                          )}
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <div className="section-header">
              <h2><Sparkles size={24} className="text-primary" /> Produtos Relacionados</h2>
              <p>Confira outras solucoes da categoria <strong>{product.category}</strong></p>
            </div>

            <div className="related-products-carousel">
              <button
                type="button"
                className="related-products__nav related-products__nav-prev"
                aria-label="Produto relacionado anterior"
              />
              <button
                type="button"
                className="related-products__nav related-products__nav-next"
                aria-label="Próximo produto relacionado"
              />

              <Swiper
                modules={[Autoplay, Navigation]}
                spaceBetween={24}
                slidesPerView={1}
                loop={relatedProducts.length > 1}
                navigation={{
                  prevEl: '.related-products__nav-prev',
                  nextEl: '.related-products__nav-next'
                }}
                autoplay={{ delay: 3500, disableOnInteraction: false }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                  1400: { slidesPerView: 4 }
                }}
              >
                {relatedProducts.map((related, index) => (
                  <SwiperSlide key={related.id}>
                    <ProductCard product={related} index={index} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
