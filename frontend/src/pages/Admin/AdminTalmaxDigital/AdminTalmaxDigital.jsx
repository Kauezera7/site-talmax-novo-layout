import React, { useEffect, useMemo, useState } from 'react';
import { Save, UploadCloud, Image as ImageIcon, RefreshCcw } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';
import homeService from '../../../services/homeService';
import { apiAssetPath } from '../../../utils/assets';
import { DIGITAL_CARD_TEMPLATES, parseDigitalActionsPayload } from '../../../components/TalmaxDigital/digitalCardTemplates';
import SpecialPageSettingsForm from '../SpecialPageSettingsForm/SpecialPageSettingsForm';
import './AdminTalmaxDigital.css';

const buildCardsState = (storedCards = []) => (
  DIGITAL_CARD_TEMPLATES.map((template) => {
    const storedCard = storedCards.find((card) => card?.id === template.id) || {};

    return {
      id: template.id,
      title: storedCard.title || template.title,
      description: storedCard.description || template.description,
      frontImageUrl: storedCard.front_image_url || '',
      backImageUrl: storedCard.back_image_url || '',
      frontImageFile: null,
      backImageFile: null,
      frontImagePreview: storedCard.front_image_url ? apiAssetPath(storedCard.front_image_url) : null,
      backImagePreview: storedCard.back_image_url ? apiAssetPath(storedCard.back_image_url) : null
    };
  })
);

const ButtonSavingIndicator = () => (
  <span className="loader loader_bubble admin-button-loader" aria-hidden="true" />
);

const AdminTalmaxDigital = () => {
  const { addToast } = useAdmin();
  const [segment, setSegment] = useState(null);
  const [cards, setCards] = useState(buildCardsState());
  const [isLoading, setIsLoading] = useState(true);
  const [savingCardId, setSavingCardId] = useState(null);

  const segmentActions = useMemo(
    () => parseDigitalActionsPayload(segment?.actions),
    [segment?.actions]
  );

  const loadSegment = async () => {
    setIsLoading(true);

    try {
      const services = await homeService.getAll();
      const talmaxDigitalSegment = services.find(
        (item) => String(item?.name || '').trim().toLowerCase() === 'talmax digital'
      );

      if (!talmaxDigitalSegment) {
        throw new Error('O segmento Talmax Digital nao foi encontrado em Segmentos (Home).');
      }

      setSegment(talmaxDigitalSegment);
      setCards(buildCardsState(parseDigitalActionsPayload(talmaxDigitalSegment.actions).digital_cards));
    } catch (error) {
      console.error('Erro ao carregar configuracoes da Talmax Digital:', error);
      addToast(error.message || 'Erro ao carregar configuracoes da Talmax Digital', 'error');
      setSegment(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSegment();
  }, []);

  const handleImageChange = (cardId, side, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCards((currentCards) => currentCards.map((card) => {
        if (card.id !== cardId) {
          return card;
        }

        if (side === 'front') {
          return {
            ...card,
            frontImageFile: file,
            frontImagePreview: reader.result
          };
        }

        return {
          ...card,
          backImageFile: file,
          backImagePreview: reader.result
        };
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (cardId, side) => {
    setCards((currentCards) => currentCards.map((card) => {
      if (card.id !== cardId) {
        return card;
      }

      if (side === 'front') {
        return {
          ...card,
          frontImageUrl: '',
          frontImageFile: null,
          frontImagePreview: null
        };
      }

      return {
        ...card,
        backImageUrl: '',
        backImageFile: null,
        backImagePreview: null
      };
    }));
  };

  const handleSaveCard = async (cardId) => {
    if (!segment || savingCardId) return;

    setSavingCardId(cardId);

    try {
      const formData = new FormData();
      const actionsPayload = {
        ...segmentActions,
        digital_cards: cards.map((card) => ({
          id: card.id,
          title: card.title,
          description: card.description,
          front_image_url: card.frontImageUrl || '',
          back_image_url: card.backImageUrl || ''
        }))
      };

      formData.append('name', segment.name || 'Talmax Digital');
      formData.append('description', segment.description || '');
      formData.append('link_url', segment.link_url || '/categoria/talmax-digital');
      formData.append('is_external', String(Boolean(segment.is_external)));
      formData.append('display_order', String(segment.display_order || 0));
      formData.append('active', String(Boolean(segment.active)));
      formData.append('actions', JSON.stringify(actionsPayload));

      if (segment.image_url) {
        formData.append('image_url', segment.image_url);
      }

      const currentCard = cards.find((card) => card.id === cardId);

      if (currentCard?.frontImageFile) {
        formData.append(`digital_card_front_${currentCard.id}`, currentCard.frontImageFile);
      }

      if (currentCard?.backImageFile) {
        formData.append(`digital_card_back_${currentCard.id}`, currentCard.backImageFile);
      }

      await homeService.update(segment.id, formData);
      addToast(`Imagens de ${currentCard?.title || 'Talmax Digital'} atualizadas com sucesso!`);
      await loadSegment();
    } catch (error) {
      console.error('Erro ao salvar imagens da Talmax Digital:', error);
      addToast(error.message || 'Erro ao salvar imagens da Talmax Digital', 'error');
    } finally {
      setSavingCardId(null);
    }
  };

  if (isLoading) {
    return <div className="loading-container">Carregando configuracoes da Talmax Digital...</div>;
  }

  if (!segment) {
    return (
      <div className="admin-card">
        <div className="card-body admin-talmax-digital__empty">
          <ImageIcon size={40} />
          <h3>Segmento Talmax Digital nao encontrado</h3>
          <p>Crie ou ajuste o segmento em Segmentos (Home) e depois volte aqui.</p>
          <button type="button" className="btn-secondary" onClick={loadSegment}>
            <RefreshCcw size={16} />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-talmax-digital">
      <SpecialPageSettingsForm
        pageKey="talmax-digital"
        title="Talmax Digital"
        description="Edite logo, texto superior, titulo e descricao da pagina Talmax Digital."
      />

      <div className="admin-card">
        <div className="card-header admin-talmax-digital__header">
          <div>
            <h2><ImageIcon size={20} /> Talmax Digital</h2>
            <p>Edite separadamente as imagens de frente e verso dos cards da pagina Talmax Digital. Cada bloco tem seu proprio salvar.</p>
          </div>
        </div>

        <div className="card-body">
          <div className="admin-talmax-digital__grid">
            {cards.map((card) => (
              <article key={card.id} className="admin-talmax-digital__card">
                <div className="admin-talmax-digital__card-copy">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>

                <div className="admin-talmax-digital__uploads">
                  <div className="admin-talmax-digital__upload-block">
                    <label>Imagem da Frente</label>
                    <div className="file-upload-area admin-talmax-digital__upload-area">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleImageChange(card.id, 'front', event.target.files?.[0])}
                      />
                      <UploadCloud size={28} color="var(--admin-primary)" />
                      <p>Enviar imagem da frente</p>
                    </div>

                    {card.frontImagePreview && (
                      <div className="admin-talmax-digital__preview">
                        <img src={card.frontImagePreview} alt={`Frente ${card.title}`} />
                        <button type="button" className="btn-secondary" onClick={() => handleRemoveImage(card.id, 'front')}>
                          Remover
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="admin-talmax-digital__upload-block">
                    <label>Imagem do Verso</label>
                    <div className="file-upload-area admin-talmax-digital__upload-area">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleImageChange(card.id, 'back', event.target.files?.[0])}
                      />
                      <UploadCloud size={28} color="var(--admin-primary)" />
                      <p>Enviar imagem do verso</p>
                    </div>

                    {card.backImagePreview && (
                      <div className="admin-talmax-digital__preview admin-talmax-digital__preview--back">
                        <img src={card.backImagePreview} alt={`Verso ${card.title}`} />
                        <button type="button" className="btn-secondary" onClick={() => handleRemoveImage(card.id, 'back')}>
                          Remover
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-talmax-digital__actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleSaveCard(card.id)}
                    disabled={Boolean(savingCardId)}
                  >
                    {savingCardId === card.id ? <ButtonSavingIndicator /> : <Save size={18} />}
                    {savingCardId === card.id ? 'Salvando' : `Salvar ${card.title}`}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTalmaxDigital;
