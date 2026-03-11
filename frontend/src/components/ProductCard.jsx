import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const ProductCard = ({ product, index }) => {
  const [activeImage, setActiveImage] = React.useState(product.image);
  const navigate = useNavigate();

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
      <div className="card-image-box">
        <img 
          src={activeImage} 
          alt={product.name} 
          onError={(e) => e.target.src = '/img/placeholder.webp'} 
        />
        
        {product.images && product.images.length > 1 && (
          <div className="product-thumbnails">
            {product.images.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt="thumb" 
                className={activeImage === img ? 'active' : ''}
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
