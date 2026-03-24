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
import { assetPath } from '../../utils/assets';
import './TalmaxDigital.css';

const TalmaxDigital = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const navigate = useNavigate();

  const categories = [
    { id: 'upcera', title: 'UPCERA', desc: 'Cerâmicas e Discos de alta performance', icon: <Layers size={48} />, image: assetPath('img/upcera.png'), backIcon: assetPath('img/logo-upcera-.webp') },
    { id: 'scanners', title: 'SCANNERS', desc: 'Intraoral e Bancada com Precisão Digital', icon: <Scan size={48} />, image: assetPath('img/box-td-scanners.jpg.webp'), backIcon: assetPath('img/scanner.png') },
    { id: 'impressoras', title: 'IMPRESSORAS 3D', desc: 'Anycubic e Resinas Especializadas', icon: <Printer size={48} />, image: assetPath('img/box-td-impressoras-1-260x300.jpg.webp'), backIcon: assetPath('img/impressoras3d.png') },
    { id: 'componentes', title: 'COMPONENTES', desc: 'Peças e Estruturas Protéticas', icon: <Cpu size={48} />, image: assetPath('img/box-td-componentes-260x300.jpg.webp'), backIcon: assetPath('img/componentesproteticos.png') },
    { id: 'insumos', title: 'INSUMOS', desc: 'Blocos e Ceras de Alta Qualidade', icon: <Box size={48} />, image: assetPath('img/box-td-insumos-260x300.jpg.webp'), backIcon: assetPath('img/icon-td-insumos.png') },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products`);
        const data = await res.json();
        
        const digitalProducts = data.filter(p => {
          const catNames = (p.category_names || '').split(', ');
          return catNames.includes('Talmax Digital');
        }).map(p => {
          let extra = {};
          try {
            extra = typeof p.extra_data === 'string' ? JSON.parse(p.extra_data) : p.extra_data;
          } catch(e) { extra = {}; }
          
          return {
            id: p.id,
            name: p.name,
            image: p.main_image || assetPath('img/placeholder.png'),
            ...extra
          };
        });

        setProducts(digitalProducts);
      } catch (err) {
        console.error("Erro ao carregar produtos Talmax Digital:", err);
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
      // Opcional: focar na busca ou rolar para os produtos
    }
  };

  const filteredProducts = products.filter(p => {
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
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="digital-page">
      {/* Hero Header */}
      <section className="digital-hero-mini">
        <div className="container-inner">
           <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="digital-breadcrumb"
           >
             TECNOLOGIA <span>ODONTOLÓGICA</span>
           </motion.div>
           <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="digital-title-wrapper"
           >
              <div className="line-detail"></div>
              <img src={assetPath('img/logo-talmax-digital-pos.png')} alt="Talmax Digital" className="digital-logo-header" />
              <div className="line-detail"></div>
           </motion.div>
           <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
           >
            O futuro da prótese dentária com tecnologia de ponta e precisão absoluta.
           </motion.p>
        </div>
      </section>

      {/* Seção de 5 Cards Estilizados */}
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
                {/* Frente do Card com Imagem de Fundo */}
                <div 
                  className="digital-cat-card-front"
                  style={{ backgroundImage: `url(${cat.image})` }}
                >
                </div>

                {/* Verso do Card */}
                <div className="digital-cat-card-back">
                  <div className="card-back-content">
                    <div className="card-back-icon">
                      <img src={cat.backIcon} alt={cat.title} />
                    </div>
                  </div>
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
