/**
 * Componente: ProductCard
 * Uso: catalogos, paginas especiais e relacionados
 * Responsabilidade: renderizar o card reutilizavel de produto
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import './ProductCard.css';

const getAvailableImages = (product) => (
  [product.image, ...(Array.isArray(product.images) ? product.images : [])]
    .filter(Boolean)
    .filter((image, index, images) => images.indexOf(image) === index)
);

const ProductCard = ({ product, index, imageLoading = 'lazy', imageFetchPriority = 'auto' }) => {
  const availableImages = getAvailableImages(product);
  const [activeImage, setActiveImage] = React.useState(availableImages[0] || '');
  const navigate = useNavigate();

  // Sincroniza a imagem ativa quando o produto muda
  React.useEffect(() => {
    setActiveImage(getAvailableImages(product)[0] || '');
  }, [product]);

  const handleCardClick = () => {
    navigate(`/produto/${product.id}`);
    window.scrollTo(0, 0);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.1 }}
      className="premium-product-card"
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className={`card-image-box${activeImage ? '' : ' is-empty'}`}>
        {activeImage && (
          <img
            src={activeImage}
            alt={product.name}
            loading={imageLoading}
            fetchPriority={imageFetchPriority}
            decoding="async"
            onError={() => {
              setActiveImage(availableImages.find((image) => image !== activeImage) || '');
            }}
          />
        )}
        
        {availableImages.length > 1 && (
          <div className="product-thumbnails">
            {availableImages.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt="thumb" 
                className={activeImage === img ? 'active' : ''}
                loading="lazy"
                fetchPriority="low"
                decoding="async"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage(img);
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="card-details">
        <div className="card-brand">Talmax Soluções</div>
        <h3 className="card-title">{product.name}</h3>

        <div className="card-footer-lux">
          <Link 
            to={`/produto/${product.id}`}
            className="btn-quote-lux"
            onClick={(e) => e.stopPropagation()}
          >
            <span>Ver Detalhes</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
