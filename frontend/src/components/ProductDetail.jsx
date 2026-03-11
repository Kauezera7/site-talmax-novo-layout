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
        
        // Formata o produto atual
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
          ...extra
        };

        setProduct(formattedProduct);
        setActiveImage(formattedProduct.image);
        
        // Formata a lista completa para os relacionados
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
        {/* Breadcrumbs */}
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
          {/* ... (resto da estrutura do grid permanece igual até o final da seção de info) ... */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="product-images-section"
          >
            <div className="main-image-card">
              <img src={activeImage} alt={product.name} />
              
              {product.images && product.images.length > 1 && (
                <>
                  <button className="img-nav-btn prev" onClick={handlePrevImage}>
                    <ChevronLeft size={24} />
                  </button>
                  <button className="img-nav-btn next" onClick={handleNextImage}>
                    <ChevronRight size={24} />
                  </button>
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
                    <img src={img} alt={`${product.name} thumbnail ${idx}`} />
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
              <p>{product.description}</p>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="product-features">
                <h3><Info size={18} /> Características Principais</h3>
                <ul>
                  {product.features.map((feature, idx) => (
                    <li key={idx}>
                      <CheckCircle2 size={16} className="text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.techInfo && (
              <div className="tech-info-card">
                <h3><Settings size={18} /> Informações Técnicas</h3>
                <div className="tech-specs">
                  {Object.entries(product.techInfo).map(([key, value]) => (
                    <div key={key} className="spec-item">
                      <span className="spec-label">{key}:</span>
                      <span className="spec-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.models && product.models.length > 0 && (
              <div className="product-models">
                <h3><Package size={18} /> Modelos / Opções</h3>
                <div className="models-list">
                  {product.models.map((model, idx) => (
                    <div key={idx} className="model-item">
                      <Layers size={14} />
                      {Object.entries(model).map(([key, value]) => (
                        <span key={key}><strong>{key}:</strong> {value}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="product-actions">
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-whatsapp-quote"
              >
                <MessageCircle size={20} />
                Solicitar Orçamento
              </a>
            </div>
          </motion.div>
        </div>

        {/* Seção de Produtos Relacionados */}
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
