/**
 * Pagina: Upcera
 * Rota: /upcera
 * Responsabilidade: exibir a pagina especial da linha Upcera e produtos relacionados
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import ProductCard from '../ProductCard/ProductCard';
import './Upcera.css';
import '../ProductCatalog/ProductCatalog.css';

const Upcera = () => {
  const [products, setProducts] = useState([]);
  const [cadCamProducts, setCadCamProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Cor de destaque para Upcera (Vermelho Profissional)
  const accentColor = '#cf222e';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();

        // 1. Filtra e Ordena os produtos Upcera pelo upcera_order
        const upceraItems = data
          .filter(p => p.is_upcera)
          .sort((a, b) => (a.upcera_order || 0) - (b.upcera_order || 0))
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

        // 2. Filtra produtos relacionados da Linha CAD/CAM / Insumos Upcera
        const relatedItems = data.filter(p => 
          (p.category_names && (
            p.category_names.toLowerCase().includes('zirconia') || 
            p.category_names.toLowerCase().includes('upcera') ||
            p.category_names.toLowerCase().includes('cad') ||
            p.category_names.toLowerCase().includes('cam')
          )) && !p.is_upcera
        );

        setProducts(upceraItems);
        setCadCamProducts(relatedItems);
      } catch (err) {
        console.error("Erro ao carregar produtos Upcera:", err);
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
              <img src="/img/logo-upcera-.webp" alt="Upcera Logo" style={{ height: '70px', marginBottom: '30px', maxWidth: '100%', objectFit: 'contain' }} />
              <div style={{ width: '50px', height: '4px', background: accentColor, margin: '0 auto 40px' }}></div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '6px', textTransform: 'uppercase', color: accentColor, marginBottom: '20px' }}>Innovation in Restorative Dentistry</h1>
              <p style={{ fontSize: '1.5rem', fontWeight: '300', color: '#000', maxWidth: '850px', margin: '0 auto', lineHeight: '1.4' }}>Líder mundial em cerâmicas odontológicas de alta performance, unindo estética natural e resistência extrema.</p>
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
                      <span style={{ fontSize: '0.85rem', fontWeight: '900', letterSpacing: '4px', color: accentColor, textTransform: 'uppercase' }}>High Tech Ceramics</span>
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

      {/* Seção de Banner CAD/CAM (Apenas esta parte preta) */}
      {!isLoading && cadCamProducts.length > 0 && (
        <div style={{ width: '100%', background: '#000000', overflow: 'hidden' }}>
          <motion.img 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            src="/img/na-pagina-dauoceracad-cam.webp"
            alt="Linha CAD/CAM e Insumos"
            style={{ width: '25%', height: 'auto', display: 'block', margin: '0 auto' }}
            />        </div>
      )}

      {/* Seção de Carrossel Produtos Relacionados (Fundo Branco) */}
      {!isLoading && cadCamProducts.length > 0 && (
        <section style={{ background: '#ffffff', padding: '80px 0 100px 0' }}>
          <div className="container-inner" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: accentColor, letterSpacing: '2px', textTransform: 'uppercase' }}>Portfólio Completo</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '5px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#000000', margin: 0 }}>PRODUTOS RELACIONADOS</h2>
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => navigate('/produtos?categoria=upcera')}
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

            {/* Swiper Carrossel */}
            <div className="special-products-carousel">
              <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                spaceBetween={30}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                  1400: { slidesPerView: 4 }
                }}
                className="mySwiper"
              >
                {cadCamProducts.map((p, index) => (
                  <SwiperSlide key={p.id}>
                    <ProductCard 
                      product={{
                        ...p,
                        image: p.main_image || '/img/placeholder.png'
                      }} 
                      index={index} 
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default Upcera;
