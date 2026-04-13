/**
 * Pagina: TalmaxDigital
 * Rota: /categoria/talmax-digital
 * Responsabilidade: apresentar a area Talmax Digital e seus acessos principais
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../services/api';
import { apiAssetPath, assetPath } from '../../utils/assets';
import { isExternalNavigationTarget, sanitizeNavigationTarget } from '../../utils/contentSafety';
import pageSettingsService, { DEFAULT_SPECIAL_PAGE_SETTINGS, normalizeSpecialPageSettings } from '../../services/pageSettingsService';
import { buildTalmaxDigitalCategories, parseDigitalActionsPayload } from './digitalCardTemplates';
import './TalmaxDigital.css';

const DEFAULT_DIGITAL_CATEGORIES = buildTalmaxDigitalCategories();

const TalmaxDigital = () => {
  const [categories, setCategories] = useState(DEFAULT_DIGITAL_CATEGORIES);
  const [pageSettings, setPageSettings] = useState(DEFAULT_SPECIAL_PAGE_SETTINGS['talmax-digital']);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const [homeServicesResponse, pageSettingsItems] = await Promise.all([
          fetch(`${API_URL}/home-services`),
          pageSettingsService.getAll().catch(() => [])
        ]);

        const services = homeServicesResponse.ok ? await homeServicesResponse.json() : [];

        const talmaxDigitalService = Array.isArray(services)
          ? services.find((service) => String(service?.name || '').trim().toLowerCase() === 'talmax digital')
          : null;

        if (talmaxDigitalService) {
          const actions = parseDigitalActionsPayload(talmaxDigitalService.actions);
          setCategories(buildTalmaxDigitalCategories(actions.digital_cards));
        } else {
          setCategories(DEFAULT_DIGITAL_CATEGORIES);
        }

        const normalizedPageSettings = normalizeSpecialPageSettings(pageSettingsItems);
        setPageSettings(normalizedPageSettings['talmax-digital']);
      } catch (err) {
        console.error('Erro ao carregar produtos Talmax Digital:', err);
        setCategories(DEFAULT_DIGITAL_CATEGORIES);
        setPageSettings(DEFAULT_SPECIAL_PAGE_SETTINGS['talmax-digital']);
      }
    };

    fetchPageData();
  }, []);

  const handleCategoryClick = (cat) => {
    const safeTarget = sanitizeNavigationTarget(cat.link_url, { allowExternal: true, allowRelative: true });

    if (safeTarget) {
      if (isExternalNavigationTarget(safeTarget)) {
        window.open(safeTarget, '_blank', 'noopener,noreferrer');
        return;
      }

      navigate(safeTarget);
      return;
    }

    if (cat.id === 'upcera') {
      navigate('/upcera');
    } else if (cat.id === 'scanners') {
      navigate('/scanners');
    } else if (cat.id === 'impressoras') {
      navigate('/impressoras-3d');
    }
  };

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
