import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TalmaxDigital.css';

const Upcera = () => {
  const [products, setProducts] = useState([]);
  const [cadCamProducts, setCadCamProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();

        // Filtra APENAS os produtos marcados como Upcera no painel ADM
        const upceraProducts = data.filter(p => p.is_upcera).map(p => {
          let extra = {};
          try {
            extra = typeof p.extra_data === 'string' ? JSON.parse(p.extra_data) : p.extra_data;
          } catch(e) { extra = {}; }
          
          return {
            id: p.id,
            name: p.name,
            description: p.description,
            image: p.main_image || '/img/placeholder.png',
            ...extra
          };
        });

        // Filtra produtos da categoria Linha Cad/Cam (ID 121 ou Slug 'linha-cad-cam')
        const cadCamItems = data.filter(p => 
          (p.category_ids && p.category_ids.includes(121)) || 
          (p.category_names && p.category_names.toLowerCase().includes('linha cad/cam'))
        ).slice(0, 4); // Pega os primeiros 4 para o grid

        setProducts(upceraProducts);
        setCadCamProducts(cadCamItems);
      } catch (err) {
        console.error("Erro ao carregar produtos Upcera:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="upcera-page" style={{ 
      backgroundColor: '#000000', 
      color: '#000000', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' 
    }}>
      
      {/* Header Ultra-Premium em Preto */}
      <section style={{ 
        background: '#ffffff', 
        padding: '140px 0 80px',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div className="container-inner" style={{ position: 'relative', zIndex: 2 }}>
           
           {/* Botão Voltar */}
           <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              position: 'absolute',
              top: '-80px',
              left: '20px',
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              fontSize: '0.75rem',
              fontWeight: '800',
              color: '#000000',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
            onClick={() => navigate(-1)}
            whileHover={{ x: -5, color: '#e31212' }}
           >
             <ArrowLeft size={16} strokeWidth={3} /> VOLTAR
           </motion.div>
           
           <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            style={{ textAlign: 'center' }}
           >
              <img src="/img/logo-upcera-.webp" alt="Upcera" style={{ 
                height: '100px', 
                marginBottom: '40px', 
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.1))'
              }} />
              <div style={{ width: '50px', height: '4px', background: '#e31212', margin: '0 auto 40px' }}></div>
              
              <h1 style={{ 
                fontSize: '1.1rem', 
                fontWeight: '900', 
                letterSpacing: '6px', 
                textTransform: 'uppercase', 
                color: '#e31212',
                marginBottom: '20px'
              }}>
                The Future of Esthetics
              </h1>
              <p style={{ 
                fontSize: '1.5rem', 
                fontWeight: '300', 
                color: '#000000', 
                maxWidth: '850px', 
                margin: '0 auto',
                lineHeight: '1.4'
              }}>
                Ciência, arte e tecnologia em harmonia para restaurações dentárias de precisão absoluta.
              </p>
           </motion.div>
        </div>
      </section>

      {/* Showcase de Produtos - Todo em Preto */}
      <section style={{ padding: '100px 0', background: '#ffffff' }}>
        <div className="container-inner" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
              <div className="spinner-digital" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#e31212' }}></div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '150px' }}>
              {products.map((product, index) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1 }}
                  style={{ 
                    display: 'flex', 
                    flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
                    alignItems: 'center', 
                    gap: '100px',
                  }}
                >
                  {/* Palco da Imagem */}
                  <div style={{ flex: '1', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ 
                      position: 'absolute', 
                      width: '400px', 
                      height: '400px', 
                      background: 'radial-gradient(circle, rgba(227,18,18,0.12) 0%, transparent 70%)',
                      zIndex: 0,
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}></div>
                    
                    <motion.img 
                      src={product.image} 
                      alt={product.name} 
                      style={{ 
                        width: '100%', 
                        maxWidth: '550px', 
                        height: 'auto', 
                        zIndex: 1,
                        filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.9))'
                      }} 
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  {/* Detalhes Técnicos em Tópicos */}
                  <div style={{ flex: '1.2' }}>
                    <motion.div
                      initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                        <div style={{ width: '40px', height: '2px', background: '#e31212' }}></div>
                        <span style={{ fontSize: '0.85rem', fontWeight: '900', letterSpacing: '4px', color: '#e31212', textTransform: 'uppercase' }}>
                          Performance High-Tech
                        </span>
                      </div>

                      <h2 style={{ 
                        fontSize: '4.5rem', 
                        fontWeight: '900', 
                        lineHeight: '0.9', 
                        letterSpacing: '-3px', 
                        marginBottom: '50px',
                        color: '#020202',
                        textTransform: 'uppercase'
                      }}>
                        {product.name}
                      </h2>

                      {/* Tópicos de Descrição */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {product.features && product.features.length > 0 && product.features[0] !== '' ? (
                          product.features.slice(0, 5).map((feat, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                              <div style={{ 
                                width: '12px', 
                                height: '12px', 
                                background: '#e31212', 
                                borderRadius: '2px', 
                                marginTop: '10px',
                                flexShrink: 0,
                                boxShadow: '0 0 15px rgba(227, 18, 18, 0.6)'
                              }}></div>
                              <span style={{ 
                                fontSize: '1.6rem', 
                                color: '#000000', 
                                fontWeight: '300', 
                                lineHeight: '1.3',
                                letterSpacing: '-0.5px'
                              }}>
                                {feat}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#e31212', borderRadius: '2px', marginTop: '10px' }}></div>
                            <span style={{ fontSize: '1.6rem', color: '#000000', fontWeight: '300' }}>
                              {product.description || "Inovação cerâmica de alta performance para os laboratórios mais exigentes."}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Divisor Elegante */}
                      <div style={{ 
                        marginTop: '60px',
                        height: '1px', 
                        width: '100%', 
                        background: 'linear-gradient(to right, rgba(227, 18, 18, 0.3), transparent)' 
                      }}></div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Seção CAD/CAM Relacionados */}
      {!isLoading && cadCamProducts.length > 0 && (
        <section style={{ 
          background: '#ffffff',
          padding: '0 0 120px 0'
        }}>
          {/* FAIXA PRETA DE ALTO IMPACTO - MAIS FINA */}
          <div style={{ 
            width: '100%', 
            background: '#000000', 
            padding: '30px 0', 
            position: 'relative', 
            marginBottom: '60px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
          }}>
            {/* Imagem natural reduzida em cima da faixa */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              style={{
                maxWidth: '350px',
                width: '80%',
                zIndex: 3,
                position: 'relative'
              }}
            >
              <img 
                src="/img/na-pagina-dauoceracad-cam.webp" 
                alt="Sistema CAD/CAM" 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: '20px',
                  display: 'block',
                  boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)'
                }} 
              />
            </motion.div>

            {/* Elementos decorativos de fundo na faixa */}
            <div style={{
              position: 'absolute',
              top: '0',
              right: '-100px',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%'
            }}></div>
          </div>

          <div className="container-inner" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '30px' 
            }}>
              {cadCamProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '30px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                  onClick={() => navigate(`/produto/${p.id}`)}
                >
                  <img 
                    src={p.main_image || '/img/placeholder.png'} 
                    alt={p.name} 
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'contain', 
                      marginBottom: '20px' 
                    }} 
                  />
                  <h3 style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: '800', 
                    color: '#000', 
                    marginBottom: '10px',
                    textTransform: 'uppercase'
                  }}>
                    {p.name}
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '5px',
                    color: '#e31212',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    letterSpacing: '1px'
                  }}>
                    VER DETALHES <ChevronRight size={14} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Rodapé da Página Upcera */}
      <footer style={{ 
        padding: '100px 0', 
        textAlign: 'center', 
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        background: '#ffffff' 
      }}>
      </footer>
    </div>
  );
};

export default Upcera;
