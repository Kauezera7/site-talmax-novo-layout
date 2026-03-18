import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SpecialPages.css';

const Scanners = () => {
  const [products, setProducts] = useState([]);
  const [scannerRelProducts, setScannerRelProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef();
  const controls = useAnimation();
  const navigate = useNavigate();
  const autoPlayRef = useRef();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();

        // 1. Filtra os produtos marcados MANUALMENTE como Scanner
        let scannerProducts = data.filter(p => p.is_scanner);
        if (scannerProducts.length === 0) {
          scannerProducts = data.filter(p => (p.category_names || '').toLowerCase().includes('scanner'));
        }

        // 2. Filtra produtos para o carrossel (subcategoria scanner ID 62 ou nome similar)
        const relItems = data.filter(p => 
          (p.category_ids && p.category_ids.includes(62)) || 
          (p.category_names && p.category_names.toLowerCase().includes('scanner'))
        );

        const formattedProducts = scannerProducts.map(p => {
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

        setProducts(formattedProducts);
        setScannerRelProducts(relItems);
      } catch (err) {
        console.error("Erro ao carregar produtos Scanners:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Lógica de Autoplay
  useEffect(() => {
    if (scannerRelProducts.length > 0) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % scannerRelProducts.length);
      }, 3500);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [scannerRelProducts]);

  // Atualiza largura e limites
  useEffect(() => {
    const updateWidth = () => {
      if (carouselRef.current) {
        setCarouselWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
      }
    };
    if (!isLoading) setTimeout(updateWidth, 100);
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isLoading, scannerRelProducts]);

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
            whileHover={{ x: -5, color: '#0055ff' }}
           >
             <ArrowLeft size={16} strokeWidth={3} /> VOLTAR
           </motion.div>
           
           <div style={{ textAlign: 'center' }}>
              <img src="/img/titulo-pag-scanners.png" alt="Scanners" style={{ height: '60px', marginBottom: '20px', objectFit: 'contain' }} />
              <h1 style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', color: '#000', marginBottom: '20px' }}>SCANNERS</h1>
              <div style={{ width: '50px', height: '4px', background: '#0055ff', margin: '0 auto 40px' }}></div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '6px', textTransform: 'uppercase', color: '#0055ff', marginBottom: '20px' }}>Digital Precision & Workflow</h1>
              <p style={{ fontSize: '1.5rem', fontWeight: '300', color: '#000', maxWidth: '850px', margin: '0 auto', lineHeight: '1.4' }}>A mais alta tecnologia em digitalização intraoral e de bancada para o seu fluxo digital.</p>
           </div>
        </div>
      </section>

      {/* Showcase de Produtos */}
      <section style={{ padding: '60px 0', background: '#ffffff' }}>
        <div className="container-inner" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="spinner-digital" style={{ borderTopColor: '#0055ff' }}></div></div>
          ) : (
            <div className="product-showcase-list" style={{ display: 'flex', flexDirection: 'column', gap: '100px' }}>
              {products.map((product, index) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1 }} className="product-showcase-item" style={{ flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' }}>
                  <div className="image-stage" style={{ flex: '1', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', width: '100%', maxWidth: '400px', aspectRatio: '1/1', background: 'radial-gradient(circle, rgba(0, 85, 255, 0.08) 0%, transparent 70%)', zIndex: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
                    <motion.img src={product.image} alt={product.name} style={{ width: '100%', maxWidth: '550px', height: 'auto', zIndex: 1, filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.2))', cursor: 'pointer' }} whileHover={{ scale: 1.05 }} transition={{ duration: 0.5 }} onClick={() => navigate(`/produto/${product.id}`)} />
                  </div>
                  <div className="product-details" style={{ flex: '1.2' }}>
                    <div className="feature-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}><div style={{ width: '40px', height: '2px', background: '#0055ff' }}></div><span style={{ fontSize: '0.85rem', fontWeight: '900', letterSpacing: '4px', color: '#0055ff', textTransform: 'uppercase' }}>Performance Digital</span></div>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: '900', lineHeight: '1', letterSpacing: '-2px', marginBottom: '40px', color: '#020202', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => navigate(`/produto/${product.id}`)}>{product.name}</h2>
                    <div className="features-container" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                      {(product.features || []).slice(0, 5).map((feat, i) => (
                        <div key={i} className="feature-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}><div style={{ width: '10px', height: '10px', background: '#0055ff', borderRadius: '2px', marginTop: '8px', flexShrink: 0 }}></div><span className="feature-text" style={{ fontSize: '1.4rem', color: '#000', fontWeight: '300', lineHeight: '1.2' }}>{feat}</span></div>
                      ))}
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/produto/${product.id}`)} style={{ marginTop: '40px', padding: '12px 35px', background: '#0055ff', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>VER DETALHES</motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer style={{ padding: '60px 0', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', background: '#ffffff' }}></footer>
    </div>
  );
};

export default Scanners;
