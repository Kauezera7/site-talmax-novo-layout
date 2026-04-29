/**
 * Pagina: Impressoras3D
 * Rota: /impressoras-3d
 * Responsabilidade: exibir a pagina especial de impressoras 3D e materiais relacionados
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../ProductCard/ProductCard';
import API_URL from '../../services/api';
import { apiAssetPath, assetPath } from '../../utils/assets';
import { parseSafeExtraData } from '../../utils/contentSafety';
import pageSettingsService, { DEFAULT_SPECIAL_PAGE_SETTINGS, normalizeSpecialPageSettings } from '../../services/pageSettingsService';
import './Impressoras3D.css';
import '../ProductCatalog/ProductCatalog.css';

const getSectionDisplayMode = (product, sectionKey) => (
  product.specialSectionDisplay?.[sectionKey] || 'features'
);

const renderSpecialSectionContent = (product, accentColor, sectionKey) => {
  const preferredDisplayMode = getSectionDisplayMode(product, sectionKey);
  const descriptionItems = (product.description || '').split('\n').map((item) => item.trim()).filter(Boolean);
  const hasDescription = Boolean((product.description || '').trim());
  const hasFeatures = Array.isArray(product.features) && product.features.length > 0;

  const displayMode = preferredDisplayMode === 'none'
    ? 'none'
    : preferredDisplayMode === 'description'
      ? (hasDescription ? 'description' : (hasFeatures ? 'features' : 'none'))
      : (hasFeatures ? 'features' : (hasDescription ? 'description' : 'none'));

  if (displayMode === 'none') {
    return null;
  }

  if (displayMode === 'description') {
    if (product.descriptionAsList && descriptionItems.length > 0) {
      return (
        <div className="features-container" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {descriptionItems.slice(0, 5).map((item, index) => (
            <div key={index} className="feature-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
              <div style={{ width: '10px', height: '10px', background: accentColor, borderRadius: '2px', marginTop: '8px', flexShrink: 0 }}></div>
              <span className="feature-text" style={{ fontSize: '1.4rem', color: '#000', fontWeight: '300', lineHeight: '1.2' }}>{item}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <p style={{ fontSize: '1.2rem', color: '#000', fontWeight: '300', lineHeight: '1.7', maxWidth: '720px' }}>
        {product.description}
      </p>
    );
  }

  return (
    <div className="features-container" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      {(product.features || []).slice(0, 5).map((feat, i) => (
        <div key={i} className="feature-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
          <div style={{ width: '10px', height: '10px', background: accentColor, borderRadius: '2px', marginTop: '8px', flexShrink: 0 }}></div>
          <span className="feature-text" style={{ fontSize: '1.4rem', color: '#000', fontWeight: '300', lineHeight: '1.2' }}>{feat}</span>
        </div>
      ))}
    </div>
  );
};

const Impressoras3D = () => {
  const [products, setProducts] = useState([]);
  const [resinsProducts, setResinsProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSettings, setPageSettings] = useState(DEFAULT_SPECIAL_PAGE_SETTINGS.printers);
  const navigate = useNavigate();

  const accentColor = '#374c92';

  const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [res, pageSettingsItems] = await Promise.all([
          fetch(`${API_URL}/products`),
          pageSettingsService.getAll().catch(() => [])
        ]);
        const data = await res.json();

        const printerItems = data
          .filter((p) => p.is_3d_printer)
          .sort((a, b) => (a.printer_order || 0) - (b.printer_order || 0))
          .map((p) => {
            const extra = parseSafeExtraData(p.extra_data);

            return {
              id: p.id,
              name: p.name,
              description: p.description,
              category_names: p.category_names || '',
              is_3d_printer: p.is_3d_printer === true || Number(p.is_3d_printer) === 1,
              image: p.main_image ? apiAssetPath(p.main_image) : '',
              ...extra
            };
          });

        const relatedItems = data.filter((p) =>
          (p.category_names && (
            p.category_names.toLowerCase().includes('resina')
            || p.category_names.toLowerCase().includes('insumo')
          )) && !p.is_3d_printer
        );

        setProducts(printerItems);
        setResinsProducts(shuffleArray(relatedItems).slice(0, 4));
        setPageSettings(normalizeSpecialPageSettings(pageSettingsItems).printers);
      } catch (err) {
        console.error('Erro ao carregar produtos Impressoras 3D:', err);
        setPageSettings(DEFAULT_SPECIAL_PAGE_SETTINGS.printers);
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
      fontFamily: "'Acumin', 'Acumin Pro', 'Acumin Variable Concept', Arial, sans-serif",
      overflowX: 'hidden'
    }}>
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
            <img src={apiAssetPath(pageSettings.logo_url) || assetPath('img/impressoras3d.png')} alt={pageSettings.label || 'Impressoras 3D'} style={{ height: '80px', marginBottom: '30px', maxWidth: '100%' }} />
            <div style={{ width: '50px', height: '4px', background: accentColor, margin: '0 auto 40px' }}></div>
            {pageSettings.overline && (
              <div style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '4px', textTransform: 'uppercase', color: accentColor, marginBottom: '16px' }}>
                {pageSettings.overline}
              </div>
            )}
            <h1 style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '6px', textTransform: 'uppercase', color: accentColor, marginBottom: '20px' }}>{pageSettings.title}</h1>
            <p style={{ fontSize: '1.5rem', fontWeight: '300', color: '#000', maxWidth: '850px', margin: '0 auto', lineHeight: '1.4' }}>{pageSettings.description}</p>
          </div>
        </div>
      </section>

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
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 1 }}
                  className="product-showcase-item"
                  style={{ flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' }}
                >
                  <div className="image-stage" style={{ flex: '1', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', width: '100%', maxWidth: '400px', aspectRatio: '1/1', background: `radial-gradient(circle, ${accentColor}14 0%, transparent 70%)`, zIndex: 0, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
                    {product.image && (
                      <motion.img
                        src={product.image}
                        alt={product.name}
                        style={{ width: '100%', maxWidth: '550px', height: 'auto', zIndex: 1, filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.2))', cursor: 'pointer' }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                        onClick={() => navigate(`/produto/${product.id}`)}
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <div className="product-details" style={{ flex: '1.2' }}>
                    <div className="feature-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                      <div style={{ width: '40px', height: '2px', background: accentColor }}></div>
                      <span style={{ fontSize: '0.85rem', fontWeight: '900', letterSpacing: '4px', color: accentColor, textTransform: 'uppercase' }}>Additive Manufacturing</span>
                    </div>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: '900', lineHeight: '1', letterSpacing: '-2px', marginBottom: '40px', color: '#020202', textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => navigate(`/produto/${product.id}`)}>{product.name}</h2>
                    {renderSpecialSectionContent(product, accentColor, 'printers')}
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
                    image: p.main_image ? apiAssetPath(p.main_image) : ''
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
