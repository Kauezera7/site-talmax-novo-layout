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
  Layers,
  Settings,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const [prodRes, allRes] = await Promise.all([
          fetch(`http://localhost:5000/api/products/${id}`),
          fetch('http://localhost:5000/api/products')
        ]);
        
        if (!prodRes.ok) {
          navigate('/produtos');
          return;
        }

        const data = await prodRes.json();
        const others = await allRes.json();
        
        let extra = {};
        try {
          extra = typeof data.extra_data === 'string' ? JSON.parse(data.extra_data) : data.extra_data;
        } catch(e) { extra = {}; }

        const formattedProduct = {
          id: data.id,
          name: data.name,
          category: data.category_name,
          description: data.description,
          image: data.main_image || '/img/placeholder.png',
          modelHeaders: extra.modelHeaders || ['Tipo / Referência', 'Código'],
          ...extra
        };

        setProduct(formattedProduct);
        setActiveImage(formattedProduct.image);
        setAllProducts(others.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category_name,
          image: p.main_image || '/img/placeholder.png'
        })));

      } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const handleNextImage = () => {
    if (!product || !product.images) return;
    const currentIndex = product.images.indexOf(activeImage);
    const nextIndex = (currentIndex + 1) % product.images.length;
    setActiveImage(product.images[nextIndex]);
  };

  const handlePrevImage = () => {
    if (!product || !product.images) return;
    const currentIndex = product.images.indexOf(activeImage);
    const prevIndex = (currentIndex - 1 + product.images.length) % product.images.length;
    setActiveImage(product.images[prevIndex]);
  };

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, allProducts]);

  if (loading) return <div className="detail-loader">Carregando...</div>;
  if (!product) return null;

  const whatsappMessage = encodeURIComponent(`Olá! Gostaria de mais informações sobre o produto: ${product.name}`);
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
                  <div key={idx} className={`thumb-item ${activeImage === img ? 'active' : ''}`} onClick={() => setActiveImage(img)}>
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
                  {product.description.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                    <li key={idx}><CheckCircle2 size={16} className="text-primary" /> {line}</li>
                  ))}
                </ul>
              ) : (
                product.description
              )}
            </div>

            {product.features && product.features.length > 0 && (
              <div className="product-features">
                <h3><Info size={18} /> Características Principais</h3>
                <ul>
                  {product.features.map((feature, idx) => (
                    <li key={idx}><CheckCircle2 size={16} className="text-primary" /><span>{feature}</span></li>
                  ))}
                </ul>
              </div>
            )}

            <div className="product-actions">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp-quote">
                <MessageCircle size={20} /> Solicitar Orçamento
              </a>
            </div>
          </motion.div>
        </div>

        {/* TABELA DE MODELOS - LARGURA TOTAL */}
        {((product.models && product.models.length > 0) || product.modelTable) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="full-width-models-section"
          >
            <div className="section-title-group">
              <Package size={24} className="text-primary" />
              <h2>{product.modelTitle || "Modelos / Códigos"}</h2>
            </div>

            <div className="table-container">
              <table className={`models-table ${product.hideModelData ? 'strip-mode' : ''}`}>
                {product.modelTable ? (
                  <>
                    <thead>
                      <tr>
                        {product.modelTable.headers.map((h, i) => <th key={i}>{h}</th>)}
                      </tr>
                    </thead>
                    {!product.hideModelData && (
                      <tbody>
                        {product.modelTable.rows.map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    )}
                  </>
                ) : (
                  <>
                    <thead>
                      <tr>
                        {product.modelHeaders.map((h, i) => <th key={i}>{h}</th>)}
                      </tr>
                    </thead>
                    {!product.hideModelData && (
                      <tbody>
                        {product.models.map((m, i) => (
                          <tr key={i}>
                            {Array.isArray(m) ? (
                              m.map((cell, ci) => <td key={ci}>{cell}</td>)
                            ) : (
                              <>
                                <td>{m.type}</td>
                                <td>{m.code}</td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    )}
                  </>
                )}
              </table>
            </div>

          </motion.div>
        )}

        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <div className="section-header">
              <h2><Sparkles size={24} className="text-primary" /> Produtos Relacionados</h2>
              <p>Confira outras soluções da categoria <strong>{product.category}</strong></p>
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
