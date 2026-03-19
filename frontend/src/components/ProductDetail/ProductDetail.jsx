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
  Layers,
  Settings,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../ProductCard/ProductCard';
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
          if (data.extra_data) {
            extra = typeof data.extra_data === 'string' ? JSON.parse(data.extra_data) : data.extra_data;
          }
        } catch(e) { 
          console.error("Erro ao processar dados extras:", e);
          extra = {}; 
        }

        // Garantir que extra seja um objeto e não null
        if (!extra) extra = {};

        // Normalização de dados: Se o produto é antigo e não tem modelTable, converte aqui para exibição
        let finalTable = extra.modelTable;
        if (!finalTable && extra.models && extra.models.length > 0) {
          finalTable = {
            headers: extra.modelHeaders || ['Tipo / Referência', 'Código'],
            rows: (typeof extra.models[0] === 'object' && !Array.isArray(extra.models[0])) 
                  ? extra.models.map(m => [m.type || '', m.code || ''])
                  : extra.models
          };
        }

        const segmentSlugs = ['talmax-digital', 'protese-dentaria', 'nail-e-podologia'];
        const segmentNames = others
          .filter(p => p.category_name && segmentSlugs.some(slug => p.category_name.toLowerCase().includes(slug.replace('-', ' '))))
          // Na verdade, melhor buscar as categorias reais para ter os nomes exatos
          .map(p => p.category_name);

        // Como não temos a lista de categorias aqui, vamos carregar ou usar um filtro fixo baseado nos nomes conhecidos
        const fixedSegmentNames = ['Talmax Digital', 'Prótese Dentária', 'Nail e Podologia'];

        const formattedProduct = {
          id: data.id,
          name: data.name,
          category: (data.category_names || data.category_name || '')
            .split(', ')
            .filter(name => !fixedSegmentNames.includes(name))
            .join(', ') || 'Sem categoria',
          description: data.description,
          image: data.main_image || '/img/placeholder.png',
          ...extra,
          modelTable: finalTable
        };

        setProduct(formattedProduct);
        setActiveImage(formattedProduct.image);
        setAllProducts(others.map(p => ({
          id: p.id,
          name: p.name,
          category: (p.category_names || p.category_name || '')
            .split(', ')
            .filter(name => !fixedSegmentNames.includes(name))
            .join(', ') || 'Sem categoria',
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
        {product.modelTable && product.showModelSection !== false && (
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
