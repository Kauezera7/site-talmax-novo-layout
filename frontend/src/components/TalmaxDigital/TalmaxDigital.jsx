/**
 * Pagina: TalmaxDigital
 * Rota: /categoria/talmax-digital
 * Responsabilidade: apresentar a area Talmax Digital e seus acessos principais
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  PackageSearch,
  ArrowRight,
  Cpu,
  Scan,
  Printer,
  Layers,
  Box,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../ProductCard/ProductCard';
import API_URL from '../../services/api';
import { apiAssetPath, assetPath } from '../../utils/assets';
import pageSettingsService, { DEFAULT_SPECIAL_PAGE_SETTINGS, normalizeSpecialPageSettings } from '../../services/pageSettingsService';
import './TalmaxDigital.css';

const DEFAULT_DIGITAL_CATEGORIES = [
  { id: 'upcera', title: 'UPCERA', desc: 'Ceramicas e Discos de alta performance', icon: <Layers size={48} />, image: assetPath('img/upcera.png'), backIcon: assetPath('img/logo-upcera-.webp') },
  { id: 'scanners', title: 'SCANNERS', desc: 'Intraoral e Bancada com Precisao Digital', icon: <Scan size={48} />, image: assetPath('img/box-td-scanners.jpg.webp'), backIcon: assetPath('img/scanner.png') },
  { id: 'impressoras', title: 'IMPRESSORAS 3D', desc: 'Anycubic e Resinas Especializadas', icon: <Printer size={48} />, image: assetPath('img/box-td-impressoras-1-260x300.jpg.webp'), backIcon: assetPath('img/impressoras3d.png') },
  { id: 'componentes', title: 'COMPONENTES', desc: 'Pecas e Estruturas Proteticas', icon: <Cpu size={48} />, image: assetPath('img/box-td-componentes-260x300.jpg.webp'), backIcon: assetPath('img/componentesproteticos.png') },
  { id: 'insumos', title: 'INSUMOS', desc: 'Blocos e Ceras de Alta Qualidade', icon: <Box size={48} />, image: assetPath('img/box-td-insumos-260x300.jpg.webp'), backIcon: assetPath('img/icon-td-insumos.png') },
];

const parseActionsPayload = (value) => {
  if (!value) return {};

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return {};
    }
  }

  return value && typeof value === 'object' ? value : {};
};

const applyDigitalCardOverrides = (cards, actions) => {
  const digitalCards = Array.isArray(actions?.digital_cards) ? actions.digital_cards : [];

  if (digitalCards.length === 0) {
    return cards;
  }

  return cards.map((card) => {
    const override = digitalCards.find((item) => item?.id === card.id);

    if (!override) {
      return card;
    }

    return {
      ...card,
      image: override.front_image_url ? apiAssetPath(override.front_image_url) : card.image,
      backIcon: override.back_image_url ? apiAssetPath(override.back_image_url) : card.backIcon,
      backImage: override.back_image_url ? apiAssetPath(override.back_image_url) : ''
    };
  });
};

const TalmaxDigital = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [categories, setCategories] = useState(DEFAULT_DIGITAL_CATEGORIES);
  const [pageSettings, setPageSettings] = useState(DEFAULT_SPECIAL_PAGE_SETTINGS['talmax-digital']);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [productsResponse, homeServicesResponse, pageSettingsItems] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/home-services`),
          pageSettingsService.getAll().catch(() => [])
        ]);

        const data = await productsResponse.json();
        const services = homeServicesResponse.ok ? await homeServicesResponse.json() : [];

        const digitalProducts = data.filter((p) => {
          const catNames = (p.category_names || '').split(', ');
          return catNames.includes('Talmax Digital');
        }).map((p) => {
          let extra = {};
          try {
            extra = typeof p.extra_data === 'string' ? JSON.parse(p.extra_data) : p.extra_data;
          } catch (e) {
            extra = {};
          }

          return {
            id: p.id,
            name: p.name,
            image: p.main_image ? apiAssetPath(p.main_image) : assetPath('img/placeholder.png'),
            ...extra
          };
        });

        setProducts(digitalProducts);

        const talmaxDigitalService = Array.isArray(services)
          ? services.find((service) => String(service?.name || '').trim().toLowerCase() === 'talmax digital')
          : null;

        if (talmaxDigitalService) {
          const actions = parseActionsPayload(talmaxDigitalService.actions);
          setCategories(applyDigitalCardOverrides(DEFAULT_DIGITAL_CATEGORIES, actions));
        } else {
          setCategories(DEFAULT_DIGITAL_CATEGORIES);
        }

        const normalizedPageSettings = normalizeSpecialPageSettings(pageSettingsItems);
        setPageSettings(normalizedPageSettings['talmax-digital']);
      } catch (err) {
        console.error('Erro ao carregar produtos Talmax Digital:', err);
        setCategories(DEFAULT_DIGITAL_CATEGORIES);
        setPageSettings(DEFAULT_SPECIAL_PAGE_SETTINGS['talmax-digital']);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCategoryClick = (cat) => {
    if (cat.id === 'upcera') {
      navigate('/upcera');
    } else if (cat.id === 'scanners') {
      navigate('/scanners');
    } else if (cat.id === 'impressoras') {
      navigate('/impressoras-3d');
    } else {
      setSelectedCategory(cat.title);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <div className="digital-page">
      <section className="digital-hero-mini">
        <div className="container-inner">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="digital-breadcrumb"
          >
            {pageSettings.overline || 'TECNOLOGIA ODONTOLOGICA'}
          </motion.div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="digital-title-wrapper"
          >
            <div className="line-detail"></div>
            <img src={apiAssetPath(pageSettings.logo_url) || assetPath('img/logo-talmax-digital-pos.png')} alt={pageSettings.title || 'Talmax Digital'} className="digital-logo-header" />
            <div className="line-detail"></div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="digital-hero-title"
          >
            {pageSettings.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {pageSettings.description}
          </motion.p>
        </div>
      </section>

      <section className="digital-categories-section">
        <motion.div
          className="digital-grid-categories"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              variants={itemVariants}
              className="digital-cat-card"
              onClick={() => handleCategoryClick(cat)}
            >
              <div className="digital-cat-card-inner">
                <div
                  className="digital-cat-card-front"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />

                <div
                  className={`digital-cat-card-back ${cat.backImage ? 'digital-cat-card-back--image' : ''}`}
                  style={cat.backImage ? { backgroundImage: `url(${cat.backImage})` } : undefined}
                >
                  {!cat.backImage && (
                    <div className="card-back-content">
                      <div className="card-back-icon">
                        <img src={cat.backIcon} alt={cat.title} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default TalmaxDigital;
