import React from 'react';
// Importação dos componentes core do Swiper (Biblioteca de Slider)
import { Swiper, SwiperSlide } from 'swiper/react';
// Importação dos módulos de funcionalidade (Autoplay, Efeitos, Paginação, Navegação)
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
// Importação dos dados (Caminhos das imagens e títulos)
import { slides } from '../data';

// Importação obrigatória dos estilos do Swiper para que ele funcione visualmente
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

/**
 * HeroSlider: Componente de Banner Principal da Home
 */
const HeroSlider = () => {
  return (
    <section className="hero-slider-container">
      <Swiper
        spaceBetween={0}               // Espaço entre os slides (0 para banners grudados)
        effect={'fade'}               // Efeito de transição suave (esmaecimento)
        fadeEffect={{
          crossFade: true             // Suaviza a sobreposição das imagens na troca
        }}
        speed={1200}                  // Velocidade da transição em milissegundos (1.2s)
        loop={true}                   // Faz o slider voltar ao início infinitamente
        autoplay={{
          delay: 5000,                // Cada slide fica parado por 5 segundos
          disableOnInteraction: false,// Continua rodando mesmo se o usuário clicar
        }}
        pagination={{
          clickable: true,            // Permite clicar nas bolinhas de navegação
          dynamicBullets: true,       // Bolinhas mudam de tamanho conforme a posição
        }}
        navigation={true}             // Ativa as setas (Próximo/Anterior)
        modules={[Autoplay, EffectFade, Pagination, Navigation]} // Módulos ativos
        className="hero-swiper"
      >
        {/* Mapeamento dos slides vindos do arquivo data.js */}
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="slide-content">
              {/* Imagem do Banner */}
              <img src={slide.image} alt={slide.title} className="banner-img" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroSlider;
