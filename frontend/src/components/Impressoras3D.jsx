import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import './Impressoras3D.css';
import './ProductCatalog.css';

const Impressoras3D = () => {
  const [products, setProducts] = useState([]);
  const [resinsProducts, setResinsProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Cor de destaque para Impressoras 3D (Azul Padrão Talmax)
  const accentColor = '#004a99';

  // Função para sortear os produtos
  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();

        // 1. Filtra e Ordena os produtos marcados MANUALMENTE como Impressora 3D
        const printerItems = data
          .filter(p => p.is_3d_printer)
          .sort((a, b) => (a.printer_order || 0) - (b.printer_order || 0))
          .map(p => {
          let extra = {};
          try { extra = typeof p.extra_data === 'string' ? JSON.parse(p.extra_data) : p.extra_data; } catch(e) { extra = {}; }
          return {
            id: p.id,
            name: p.name,
            description: p.description,
            image: p.main_image || '/img/placeholder.png',
            ...extra
          };
        });

        // 2. Filtra produtos relacionados (Resinas/Insumos 3D) para o grid inferior
        const relatedItems = data.filter(p => 
          (p.category_names && (
            p.category_names.toLowerCase().includes('resina') || 
            p.category_names.toLowerCase().includes('insumo')
          )) && !p.is_3d_printer
        );

        setProducts(printerItems);
        setResinsProducts(shuffleArray(relatedItems).slice(0, 4));
      } catch (err) {
        console.error("Erro ao carregar produtos Impressoras 3D:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="special-page-container" style={{ 
      backgroundColor: '#000000', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      overflowX: 'hidden'
    }}>
      
      {/* Header */}
      <section className="special-page-header" style={{ background: '#ffffff', padding: '140px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div className="container-inner">
           <motion.div 
            className="back-btn"
            style={{ position: 'absolute', top: '-80px', left: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '2px', color: '#000' }}
            onClick={() => navigate(-1)}
            whileHover={{ x: -5, color: accentColor }}
           >
             <ArrowLeft size={16} strokeWidth={3} /> VOLTAR
           </motion.div>
           
           <div style={{ textAlign: 'center' }}>
              <img src="/img/impressoras3d.png" alt="Impressoras 3D" style={{ height: '80px', marginBottom: '30px', maxWidth: '100%' }} />
              <div style={{ width: '50px', height: '4px', background: accentColor, margin: '0 auto 40px' }}></div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '6px', textTransform: 'uppercase', color: accentColor, marginBottom: '20px' }}>High Precision Printing</h1>
              <p style={{ fontSize: '1.5rem', fontWeight: '300', color: '#000', maxWidth: '850px', margin: '0 auto', lineHeight: '1.4' }}>A revolução da manufatura aditiva com precisão industrial para o fluxo digital odontológico.</p>
           </div>
        </div>
      </section>

      {/* Showcase de Produtos Principais (Alternado) */}
      <section style={{ padding: '60px 0', background: '#ffffff' }}>
        <div className="container-inner" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="spinner-digital" style={{ borderTopColor: accentColor }}></div></div>
          ) : (
            <div className="product-showcase-list" style={{ display: 'flex', flexDirection: 'column', gap: '100px' }}>
              {products.map((product, index) => (
                <motion.div 
                  key={product.id} 
                  initial={{ opacity: 0, y: 50 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true, margin: "-100px" }} 
                  transition={{ duration: 1 }} 
                  className="product-showcase-item" 
                  style={{ flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' }}
                >
                  <div className="image-stage" style={{ flex: '1', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', width: '100%', maxWidth: '400px', aspectRatio: '1/1', background: `radial-gradient(circle, ${accentColor}14 0%, transparent 70%)`, zIndex: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
                    <motion.img 
                      src={product.image} 
                      alt={product.name} 
                      style={{ width: '100%', maxWidth: '550px', height: 'auto', zIndex: 1, filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.2))', cursor: 'pointer' }} 
                      whileHover={{ scale: 1.05 }} 
                      transition={{ duration: 0.5 }} 
                      onClick={() => navigate(`/produto/${product.id}`)} 
                    />
                  </div>
                  <div className="product-details" style={{ flex: '1.2' }}>
                    <div className="feature-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                      <div style={{ width: '40px', height: '2px', background: accentColor }}></div>
                      <span style={{ fontSize: '0.85rem', fontWeight: '900', letterSpacing: '4px', color: accentColor, textTransform: 'uppercase' }}>Additive Manufacturing</span>
                    </div>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: '900', lineHeight: '1', letterSpacing: '-2px', marginBottom: '40px', color: '#020202', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => navigate(`/produto/${product.id}`)}>{product.name}</h2>
                    <div className="features-container" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                      {(product.features || []).slice(0, 5).map((feat, i) => (
                        <div key={i} className="feature-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                          <div style={{ width: '10px', height: '10px', background: accentColor, borderRadius: '2px', marginTop: '8px', flexShrink: 0 }}></div>
                          <span className="feature-text" style={{ fontSize: '1.4rem', color: '#000', fontWeight: '300', lineHeight: '1.2' }}>{feat}</span>
                        </div>
                      ))}
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }} 
                      onClick={() => navigate(`/produto/${product.id}`)} 
                      style={{ marginTop: '40px', padding: '12px 35px', background: accentColor, color: '#fff', border: 'none', borderRadius: '5px', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}
                    >
                      VER DETALHES
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Seção de Resinas e Insumos */}
      {!isLoading && resinsProducts.length > 0 && (
        <section style={{ background: '#ffffff', padding: '0 0 80px 0' }}>
          <div style={{ width: '100%', background: '#1a1a1a', padding: '40px 20px', marginBottom: '60px', display: 'flex', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center' }}>
              <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase', margin: 0 }}>RESINAS E INSUMOS 3D</h2>
            </motion.div>
          </div>

          <div className="container-inner" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: accentColor, letterSpacing: '2px', textTransform: 'uppercase' }}>Materiais de Alta Performance</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '5px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#000', margin: 0 }}>LINHA DE MATERIAIS</h2>
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => navigate('/produtos?categoria=resinas')}
                  style={{ 
                    padding: '10px 25px', 
                    background: accentColor, 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '50px', 
                    fontWeight: '800', 
                    fontSize: '0.75rem', 
                    letterSpacing: '1px', 
                    textTransform: 'uppercase', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: `0 10px 20px ${accentColor}33`
                  }}
                >
                  VER TUDO <ArrowUpRight size={16} />
                </motion.button>
              </div>
            </div>

            <div className="cad-cam-responsive-list">
              {resinsProducts.map((p, index) => (
                <ProductCard 
                  key={p.id} 
                  product={{
                    ...p,
                    image: p.main_image || '/img/placeholder.png'
                  }} 
                  index={index} 
                />
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default Impressoras3D;
