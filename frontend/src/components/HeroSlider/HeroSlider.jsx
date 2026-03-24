/**
 * Componente: HeroSlider
 * Uso: pagina Home
 * Responsabilidade: banner principal da pagina inicial
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Importação dos componentes core do Swiper (Biblioteca de Slider)
import { Swiper, SwiperSlide } from 'swiper/react';
// Importação dos módulos de funcionalidade (Autoplay, Efeitos, Paginação, Navegação)
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
// Importação dos dados estáticos como fallback
import { slides as staticSlides } from '../../data';
import API_URL from '../../services/api';

// Importação obrigatória dos estilos do Swiper para que ele funcione visualmente
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './HeroSlider.css';

/**
 * HeroSlider: Componente de Banner Principal da Home
 */
const HeroSlider = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleBannerClick = (linkUrl) => {
    if (!linkUrl) return;

    if (/^(?:[a-z]+:)?\/\//i.test(linkUrl)) {
      window.location.href = linkUrl;
      return;
    }

    navigate(linkUrl);
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_URL}/banners`);
        if (response.ok) {
          const data = await response.json();
          // Filtra apenas banners ativos e ordena
          const activeBanners = data.filter(b => b.active);
          setBanners(activeBanners.length > 0 ? activeBanners : staticSlides);
        } else {
          setBanners(staticSlides);
        }
      } catch (error) {
        console.error("Erro ao buscar banners:", error);
        setBanners(staticSlides);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) {
    return (
      <section className="hero-slider-container" style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </section>
    );
  }

  return (
    <section className="hero-slider-container">
      <Swiper
        spaceBetween={0}               // Espaço entre os slides (0 para banners grudados)
        effect={'fade'}               // Efeito de transição suave (esmaecimento)
        fadeEffect={{
          crossFade: true             // Suaviza a sobreposição das imagens na troca
        }}
        speed={1200}                  // Velocidade da transição em milissegundos (1.2s)
        loop={banners.length > 1}      // Faz o slider voltar ao início infinitamente (se houver mais de 1)
        autoplay={{
          delay: 5000,                // Cada slide fica parado por 5 segundos
          disableOnInteraction: false,// Continua rodando mesmo se o usuário clicar
        }}
        pagination={{
          clickable: true,            // Permite clicar nas bolinhas de navegação
          dynamicBullets: true,       // Bolinhas mudam de tamanho conforme a posição
        }}
        navigation={banners.length > 1} // Ativa as setas (Próximo/Anterior)
        modules={[Autoplay, EffectFade, Pagination, Navigation]} // Módulos ativos
        className="hero-swiper"
      >
        {/* Mapeamento dos banners vindos da API ou fallback estático */}
        {banners.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div 
              className="slide-content" 
              style={{ cursor: slide.link_url ? 'pointer' : 'default' }}
              onClick={() => handleBannerClick(slide.link_url)}
            >
              {/* Imagem do Banner */}
              <img 
                src={slide.image_url || slide.image} 
                alt={slide.title} 
                className="banner-img" 
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroSlider;
