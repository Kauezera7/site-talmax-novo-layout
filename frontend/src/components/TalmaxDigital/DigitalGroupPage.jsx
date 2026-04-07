import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import digitalGroupService from '../../services/digitalGroupService';
import { assetPath, resolveStoredAssetPath } from '../../utils/assets';
import './TalmaxDigital.css';

const DEFAULT_HERO = {
  overline: 'TECNOLOGIA ODONTOLÓGICA',
  logo_url: '/img/logo-talmax-digital-pos.png'
};

const buildGroupCategories = (cards = []) => (
  (Array.isArray(cards) ? cards : []).map((card, index) => ({
    id: card.id || `group-card-${index}`,
    title: card.title || '',
    image: resolveStoredAssetPath(card.front_image_url),
    backIcon: resolveStoredAssetPath(card.back_image_url),
    backImage: resolveStoredAssetPath(card.back_image_url),
    link_url: card.link_url || ''
  }))
);

const DigitalGroupPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGroup = async () => {
      setIsLoading(true);

      try {
        const item = await digitalGroupService.getPublicBySlug(slug);
        setGroup(item);
      } catch (error) {
        setGroup(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadGroup();
  }, [slug]);

  const categories = buildGroupCategories(group?.cards || []);
  const resolvedOverline = String(group?.overline || '').trim() || DEFAULT_HERO.overline;
  const resolvedHeroTitle = String(group?.hero_title || '').trim();
  const resolvedHeroDescription = String(group?.hero_description || '').trim();

  const handleCategoryClick = (cat) => {
    if (!cat.link_url) return;

    if (/^https?:\/\//i.test(cat.link_url)) {
      window.open(cat.link_url, '_blank', 'noopener,noreferrer');
      return;
    }

    navigate(cat.link_url);
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

  if (isLoading) {
    return <div className="loading-container">Carregando grupo digital...</div>;
  }

  if (!group) {
    return <div className="loading-container">Grupo digital não encontrado.</div>;
  }

  return (
    <div className="digital-page">
      <section className="digital-hero-mini">
        <div className="container-inner">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="digital-breadcrumb"
          >
            {resolvedOverline}
          </motion.div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="digital-title-wrapper"
          >
            <div className="line-detail"></div>
            <img
              src={resolveStoredAssetPath(group.logo_url) || assetPath(DEFAULT_HERO.logo_url)}
              alt={resolvedHeroTitle || 'Grupo digital'}
              className="digital-logo-header"
            />
            <div className="line-detail"></div>
          </motion.div>
          {resolvedHeroTitle && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="digital-hero-title"
            >
              {resolvedHeroTitle}
            </motion.h1>
          )}
          {resolvedHeroDescription && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {resolvedHeroDescription}
            </motion.p>
          )}
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

export default DigitalGroupPage;
