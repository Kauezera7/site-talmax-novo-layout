/**
 * Pagina: ProductDetail
 * Rota: /produto/:id
 * Responsabilidade: exibir detalhes do produto, galeria, modelos e relacionados
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [isFeaturesCollapsed, setIsFeaturesCollapsed] = useState(true);
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
          description: data.description,
          image: data.main_image ? apiAssetPath(data.main_image) : assetPath('img/placeholder.png'),
          ...extra,
          images: Array.isArray(extra.images) ? extra.images.map((image) => apiAssetPath(image)) : extra.images,
          modelTable: finalTable
        };

        setProduct(formattedProduct);
        setActiveImage(formattedProduct.image);
        setIsFeaturesCollapsed(true);
        setAllProducts(others.map((currentProduct) => ({
          id: currentProduct.id,
          name: currentProduct.name,
          category: getVisibleCategoryLabel(
            currentProduct.category_names || currentProduct.category_name || '',
            fixedSegmentNames
          ),
          image: currentProduct.main_image
            ? apiAssetPath(currentProduct.main_image)
            : assetPath('img/placeholder.png')
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
    return allProducts
      .filter((currentProduct) => currentProduct.category === product.category && currentProduct.id !== product.id)
      .slice(0, 4);
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

            <div className="product-actions">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp-quote">
                <MessageCircle size={20} /> Solicitar Orcamento
              </a>
            </div>
          </motion.div>
        </div>

        {product.modelTable && product.showModelSection !== false && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="full-width-models-section"
          >
            <div className="section-title-group">
              <Package size={24} className="text-primary" />
              <h2>{product.modelTitle || 'Modelos / Codigos'}</h2>
            </div>

            <div className="table-container">
              <table className={`models-table ${product.hideModelData ? 'strip-mode' : ''}`}>
                <thead>
                  <tr>
                    {product.modelTable.headers.map((header, index) => <th key={index}>{header}</th>)}
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
          </motion.div>
        )}

        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <div className="section-header">
              <h2><Sparkles size={24} className="text-primary" /> Produtos Relacionados</h2>
              <p>Confira outras solucoes da categoria <strong>{product.category}</strong></p>
            </div>
            <div className="related-grid">
              {relatedProducts.map((related, index) => (
                <ProductCard key={related.id} product={related} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
