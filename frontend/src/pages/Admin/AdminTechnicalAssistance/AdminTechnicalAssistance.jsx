import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Globe,
  Image as ImageIcon,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Save,
  Search,
  Trash2,
  UploadCloud,
  Wrench,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../../context/useAdmin';
import { apiAssetPath } from '../../../utils/assets';
import pageSettingsService, { DEFAULT_SPECIAL_PAGE_SETTINGS, normalizeSpecialPageSettings } from '../../../services/pageSettingsService';
import technicalAssistanceService from '../../../services/technicalAssistanceService';
import './AdminTechnicalAssistance.css';

const buildEmptyForm = () => ({
  company: '',
  address: '',
  city: '',
  state_code: '',
  phone: '',
  phone_2: '',
  phone_3: '',
  email: '',
  map_url: '',
  site_url: ''
});

const buildEmptyContentCardForm = () => ({
  title: '',
  description: '',
  description_secondary: '',
  button_label: 'Abrir chamado',
  link_url: '',
  display_order: 0,
  is_active: true
});

const DEFAULT_PAGE_SETTINGS = DEFAULT_SPECIAL_PAGE_SETTINGS['assistencia-tecnica'];

const clampNumber = (value, fallback, min, max) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, numberValue));
};

const buildPageSettingsForm = (setting = DEFAULT_PAGE_SETTINGS) => {
  const mergedSetting = {
    ...DEFAULT_PAGE_SETTINGS,
    ...setting
  };

  return {
    ...mergedSetting,
    hero_content_x: clampNumber(mergedSetting.hero_content_x, DEFAULT_PAGE_SETTINGS.hero_content_x, 0, 100),
    hero_content_y: clampNumber(mergedSetting.hero_content_y, DEFAULT_PAGE_SETTINGS.hero_content_y, 0, 100),
    logo_width: clampNumber(mergedSetting.logo_width, DEFAULT_PAGE_SETTINGS.logo_width, 80, 520),
    logoFile: null,
    logoPreview: mergedSetting.logo_url ? apiAssetPath(mergedSetting.logo_url) : null,
    bannerFile: null,
    bannerPreview: mergedSetting.banner_url ? apiAssetPath(mergedSetting.banner_url) : null
  };
};

const buildHeroContentPreviewStyle = (form) => ({
  left: `${clampNumber(form.hero_content_x, DEFAULT_PAGE_SETTINGS.hero_content_x, 0, 100)}%`,
  top: `${clampNumber(form.hero_content_y, DEFAULT_PAGE_SETTINGS.hero_content_y, 0, 100)}%`,
  '--admin-technical-assistance-preview-logo-width': `${clampNumber(form.logo_width, DEFAULT_PAGE_SETTINGS.logo_width, 80, 520)}px`
});

const normalizeFormValue = (field, value) => {
  if (field === 'state_code') {
    return String(value || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
  }

  return value;
};

const AdminTechnicalAssistance = () => {
  const { addToast } = useAdmin();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(buildEmptyForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageSettingsForm, setPageSettingsForm] = useState(buildPageSettingsForm());
  const [isPageSettingsLoading, setIsPageSettingsLoading] = useState(true);
  const [isPageSettingsSaving, setIsPageSettingsSaving] = useState(false);
  const [contentCards, setContentCards] = useState([]);
  const [isContentCardsLoading, setIsContentCardsLoading] = useState(true);
  const [showContentCardModal, setShowContentCardModal] = useState(false);
  const [showContentCardDeleteModal, setShowContentCardDeleteModal] = useState(false);
  const [contentCardToDelete, setContentCardToDelete] = useState(null);
  const [editingContentCard, setEditingContentCard] = useState(null);
  const [contentCardForm, setContentCardForm] = useState(buildEmptyContentCardForm());
  const [isContentCardSubmitting, setIsContentCardSubmitting] = useState(false);

  const loadItems = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await technicalAssistanceService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar cards da assistencia tecnica:', error);
      addToast(error.message || 'Erro ao carregar cards da assistencia tecnica', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const loadPageSettings = useCallback(async () => {
    setIsPageSettingsLoading(true);

    try {
      const items = await pageSettingsService.getAll();
      const normalizedMap = normalizeSpecialPageSettings(items);
      setPageSettingsForm(buildPageSettingsForm(normalizedMap['assistencia-tecnica']));
    } catch (error) {
      console.error('Erro ao carregar conteudo da pagina de assistencia tecnica:', error);
      addToast(error.message || 'Erro ao carregar conteudo da pagina de assistencia tecnica', 'error');
    } finally {
      setIsPageSettingsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadPageSettings();
  }, [loadPageSettings]);

  const loadContentCards = useCallback(async () => {
    setIsContentCardsLoading(true);

    try {
      const data = await technicalAssistanceService.getContentCards({ includeInactive: true });
      setContentCards(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar cards de conteudo da assistencia tecnica:', error);
      addToast(error.message || 'Erro ao carregar cards de conteudo da assistencia tecnica', 'error');
    } finally {
      setIsContentCardsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadContentCards();
  }, [loadContentCards]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return items;
    }

    return items.filter((item) => (
      [
        item.company,
        item.address,
        item.city,
        item.state_code,
        item.phone,
        item.phone_2,
        item.phone_3,
        item.email
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)
    ));
  }, [items, searchTerm]);

  const resetForm = () => {
    setForm(buildEmptyForm());
    setEditingItem(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({
      company: item.company || '',
      address: item.address || '',
      city: item.city || '',
      state_code: item.state_code || '',
      phone: item.phone || '',
      phone_2: item.phone_2 || '',
      phone_3: item.phone_3 || '',
      email: item.email || '',
      map_url: item.map_url || '',
      site_url: item.site_url || ''
    });
    setShowModal(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleInputChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: normalizeFormValue(field, value)
    }));
  };

  const handlePageSettingsInputChange = (field, value) => {
    setPageSettingsForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handlePageSettingsNumberChange = (field, value, min, max) => {
    setPageSettingsForm((current) => ({
      ...current,
      [field]: clampNumber(value, current[field], min, max)
    }));
  };

  const handlePageSettingsImageChange = (field, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPageSettingsForm((current) => ({
        ...current,
        [`${field}File`]: file,
        [`${field}Preview`]: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePageLogo = () => {
    setPageSettingsForm((current) => ({
      ...current,
      logo_url: '',
      logoFile: null,
      logoPreview: null
    }));
  };

  const handleResetBanner = () => {
    setPageSettingsForm((current) => ({
      ...current,
      banner_url: '',
      bannerFile: null,
      bannerPreview: null
    }));
  };

  const resetContentCardForm = () => {
    setContentCardForm(buildEmptyContentCardForm());
    setEditingContentCard(null);
  };

  const handleCreateContentCard = () => {
    resetContentCardForm();
    setShowContentCardModal(true);
  };

  const handleEditContentCard = (card) => {
    setEditingContentCard(card);
    setContentCardForm({
      title: card.title || '',
      description: card.description || '',
      description_secondary: card.description_secondary || '',
      button_label: card.button_label || 'Abrir chamado',
      link_url: card.link_url || '',
      display_order: Number(card.display_order) || 0,
      is_active: card.is_active !== false
    });
    setShowContentCardModal(true);
  };

  const handleContentCardDeleteClick = (card) => {
    setContentCardToDelete(card);
    setShowContentCardDeleteModal(true);
  };

  const handleContentCardInputChange = (field, value) => {
    setContentCardForm((current) => ({
      ...current,
      [field]: field === 'is_active' ? Boolean(value) : value
    }));
  };

  const handleSavePageSettings = async () => {
    if (isPageSettingsSaving) return;

    setIsPageSettingsSaving(true);

    try {
      const formData = new FormData();
      formData.append('overline', pageSettingsForm.overline || '');
      formData.append('title', pageSettingsForm.title || '');
      formData.append('description', pageSettingsForm.description || '');
      formData.append('logo_url', pageSettingsForm.logo_url || '');
      formData.append('banner_url', pageSettingsForm.banner_url || '');
      formData.append('hero_content_x', pageSettingsForm.hero_content_x ?? DEFAULT_PAGE_SETTINGS.hero_content_x);
      formData.append('hero_content_y', pageSettingsForm.hero_content_y ?? DEFAULT_PAGE_SETTINGS.hero_content_y);
      formData.append('logo_width', pageSettingsForm.logo_width ?? DEFAULT_PAGE_SETTINGS.logo_width);
      formData.append('hero_tagline', '');
      formData.append('card_title', pageSettingsForm.card_title || '');
      formData.append('card_description', pageSettingsForm.card_description || '');
      formData.append('card_description_secondary', pageSettingsForm.card_description_secondary || '');
      formData.append('card_button_label', pageSettingsForm.card_button_label || '');
      formData.append('card_url', pageSettingsForm.card_url || '');

      if (pageSettingsForm.logoFile) {
        formData.append('logo', pageSettingsForm.logoFile);
      }

      if (pageSettingsForm.bannerFile) {
        formData.append('banner', pageSettingsForm.bannerFile);
      }

      const result = await pageSettingsService.update('assistencia-tecnica', formData);
      if (result?.item) {
        setPageSettingsForm(buildPageSettingsForm(result.item));
      }
      addToast('Conteudo da pagina de assistencia tecnica atualizado com sucesso!');
      await loadPageSettings();
    } catch (error) {
      console.error('Erro ao salvar conteudo da pagina de assistencia tecnica:', error);
      addToast(error.message || 'Erro ao salvar conteudo da pagina de assistencia tecnica', 'error');
    } finally {
      setIsPageSettingsSaving(false);
    }
  };

  const handleContentCardSubmit = async (event) => {
    event.preventDefault();

    if (isContentCardSubmitting) {
      return;
    }

    const payload = {
      ...contentCardForm,
      display_order: Number(contentCardForm.display_order) || 0,
      is_active: Boolean(contentCardForm.is_active)
    };

    try {
      setIsContentCardSubmitting(true);

      if (editingContentCard?.id) {
        await technicalAssistanceService.updateContentCard(editingContentCard.id, payload);
        addToast('Card de conteudo atualizado com sucesso!');
      } else {
        await technicalAssistanceService.createContentCard(payload);
        addToast('Card de conteudo criado com sucesso!');
      }

      setShowContentCardModal(false);
      resetContentCardForm();
      await loadContentCards();
    } catch (error) {
      console.error('Erro ao salvar card de conteudo da assistencia tecnica:', error);
      addToast(error.message || 'Erro ao salvar card de conteudo da assistencia tecnica', 'error');
    } finally {
      setIsContentCardSubmitting(false);
    }
  };

  const confirmContentCardDelete = async () => {
    if (!contentCardToDelete?.id) {
      return;
    }

    try {
      await technicalAssistanceService.removeContentCard(contentCardToDelete.id);
      addToast('Card de conteudo removido com sucesso!');
      setShowContentCardDeleteModal(false);
      setContentCardToDelete(null);
      await loadContentCards();
    } catch (error) {
      console.error('Erro ao excluir card de conteudo da assistencia tecnica:', error);
      addToast(error.message || 'Erro ao excluir card de conteudo da assistencia tecnica', 'error');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingItem?.id) {
        await technicalAssistanceService.update(editingItem.id, form);
        addToast('Card de assistencia tecnica atualizado com sucesso!');
      } else {
        await technicalAssistanceService.create(form);
        addToast('Card de assistencia tecnica criado com sucesso!');
      }

      setShowModal(false);
      resetForm();
      await loadItems();
    } catch (error) {
      console.error('Erro ao salvar card de assistencia tecnica:', error);
      addToast(error.message || 'Erro ao salvar card de assistencia tecnica', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete?.id) {
      return;
    }

    try {
      await technicalAssistanceService.remove(itemToDelete.id);
      addToast('Card de assistencia tecnica removido com sucesso!');
      setShowDeleteModal(false);
      setItemToDelete(null);
      await loadItems();
    } catch (error) {
      console.error('Erro ao excluir card de assistencia tecnica:', error);
      addToast(error.message || 'Erro ao excluir card de assistencia tecnica', 'error');
    }
  };

  return (
    <div className="admin-technical-assistance">
      <div className="admin-card admin-technical-assistance__page-settings">
        <div className="card-header admin-technical-assistance__header">
          <div className="admin-technical-assistance__header-copy">
            <h2><ImageIcon size={20} /> Conteudo da pagina</h2>
            <p>Edite o banner, logo e texto abaixo do logo da pagina publica.</p>
          </div>
        </div>

        <div className="card-body">
          {isPageSettingsLoading ? (
            <div className="loading-container">Carregando conteudo da pagina...</div>
          ) : (
            <article className="admin-technical-assistance__settings-panel">
              <div className="admin-technical-assistance__settings-grid">
                <div className="form-group admin-technical-assistance__form-group--full">
                  <label>Banner da assistencia</label>
                  <div className="file-upload-area admin-technical-assistance__upload-area admin-technical-assistance__upload-area--banner">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(event) => handlePageSettingsImageChange('banner', event.target.files?.[0])}
                    />
                    <UploadCloud size={28} color="var(--admin-primary)" />
                    <p>Enviar imagem do banner</p>
                  </div>

                  {pageSettingsForm.bannerPreview && (
                    <div className="admin-technical-assistance__preview admin-technical-assistance__preview--banner">
                      <img src={pageSettingsForm.bannerPreview} alt="Preview do banner da assistencia tecnica" />
                      <button type="button" className="btn-secondary" onClick={handleResetBanner}>
                        Remover banner
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group admin-technical-assistance__form-group--full">
                  <label>Previa da posicao no banner</label>
                  <div className="admin-technical-assistance__hero-preview">
                    {pageSettingsForm.bannerPreview ? (
                      <img src={pageSettingsForm.bannerPreview} alt="" aria-hidden="true" />
                    ) : (
                      <div className="admin-technical-assistance__hero-preview-empty">
                        Envie um banner para visualizar a posicao
                      </div>
                    )}

                    <div
                      className="admin-technical-assistance__hero-preview-content"
                      style={buildHeroContentPreviewStyle(pageSettingsForm)}
                    >
                      {pageSettingsForm.logoPreview && (
                        <img
                          src={pageSettingsForm.logoPreview}
                          alt=""
                          aria-hidden="true"
                          className="admin-technical-assistance__hero-preview-logo"
                        />
                      )}
                      {pageSettingsForm.description && (
                        <p>{pageSettingsForm.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Logo do banner</label>
                  <div className="file-upload-area admin-technical-assistance__upload-area">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(event) => handlePageSettingsImageChange('logo', event.target.files?.[0])}
                    />
                    <UploadCloud size={28} color="var(--admin-primary)" />
                    <p>Enviar logo</p>
                  </div>

                  {pageSettingsForm.logoPreview && (
                    <div className="admin-technical-assistance__preview">
                      <img src={pageSettingsForm.logoPreview} alt="Preview do logo da assistencia tecnica" />
                      <button type="button" className="btn-secondary" onClick={handleRemovePageLogo}>
                        Remover logo
                      </button>
                    </div>
                  )}
                </div>

                <div className="admin-technical-assistance__settings-fields">
                  <div className="form-group">
                    <label>Texto abaixo do logo</label>
                    <textarea
                      rows="3"
                      value={pageSettingsForm.description || ''}
                      onChange={(event) => handlePageSettingsInputChange('description', event.target.value)}
                      placeholder="Assistencia tecnica autorizada"
                    />
                  </div>

                  <div className="form-group admin-technical-assistance__form-group--full">
                    <label>Posicao da logo e do texto</label>
                    <div className="admin-technical-assistance__range-grid">
                      <label className="admin-technical-assistance__range-control">
                        <span>Horizontal <strong>{pageSettingsForm.hero_content_x}%</strong></span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={pageSettingsForm.hero_content_x}
                          onChange={(event) => handlePageSettingsNumberChange('hero_content_x', event.target.value, 0, 100)}
                        />
                      </label>

                      <label className="admin-technical-assistance__range-control">
                        <span>Vertical <strong>{pageSettingsForm.hero_content_y}%</strong></span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={pageSettingsForm.hero_content_y}
                          onChange={(event) => handlePageSettingsNumberChange('hero_content_y', event.target.value, 0, 100)}
                        />
                      </label>

                      <label className="admin-technical-assistance__range-control">
                        <span>Tamanho da logo <strong>{pageSettingsForm.logo_width}px</strong></span>
                        <input
                          type="range"
                          min="80"
                          max="520"
                          step="5"
                          value={pageSettingsForm.logo_width}
                          onChange={(event) => handlePageSettingsNumberChange('logo_width', event.target.value, 80, 520)}
                        />
                      </label>
                    </div>
                  </div>

                </div>
              </div>

              <div className="admin-technical-assistance__settings-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSavePageSettings}
                  disabled={isPageSettingsSaving}
                >
                  <Save size={18} />
                  {isPageSettingsSaving ? 'Salvando...' : 'Salvar conteudo da pagina'}
                </button>
              </div>
            </article>
          )}
        </div>
      </div>

      <div className="admin-card admin-technical-assistance__content-section">
        <div className="card-header admin-technical-assistance__header">
          <div className="admin-technical-assistance__header-copy">
            <h2><Wrench size={20} /> Cards Assistencia Tecnica</h2>
            <p>Cadastre quantos cards quiser para o bloco grande exibido abaixo do banner.</p>
          </div>

          <button type="button" className="btn-secondary" onClick={handleCreateContentCard}>
            <Plus size={18} />
            Novo card
          </button>
        </div>

        <div className="card-body">
          {isContentCardsLoading ? (
            <div className="loading-container">Carregando cards de conteudo...</div>
          ) : contentCards.length === 0 ? (
            <div className="empty-state">
              <Wrench size={32} />
              <p>Nenhum card de conteudo cadastrado para a assistencia tecnica.</p>
            </div>
          ) : (
            <div className="admin-technical-assistance__content-grid">
              {contentCards.map((card) => (
                <article key={card.id} className="admin-technical-assistance__content-card">
                  <div className="admin-technical-assistance__content-card-head">
                    <span className={`admin-technical-assistance__content-status${card.is_active ? ' is-active' : ''}`}>
                      {card.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className="admin-technical-assistance__content-order">Ordem {Number(card.display_order) || 0}</span>
                  </div>

                  <h3 title={card.title}>{card.title}</h3>

                  {card.description && <p>{card.description}</p>}
                  {card.description_secondary && <p>{card.description_secondary}</p>}

                  {card.link_url && (
                    <span className="admin-technical-assistance__content-link" title={card.link_url}>
                      <Globe size={15} />
                      <span>{card.link_url}</span>
                    </span>
                  )}

                  <div className="admin-technical-assistance__actions">
                    <button type="button" className="btn-secondary" onClick={() => handleEditContentCard(card)}>
                      <Pencil size={16} />
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn-secondary admin-technical-assistance__danger-button"
                      onClick={() => handleContentCardDeleteClick(card)}
                    >
                      <Trash2 size={16} />
                      Excluir
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header admin-technical-assistance__header">
          <div className="admin-technical-assistance__header-copy">
            <h2><Wrench size={20} /> Assistencia Tecnica</h2>
            <p>Cadastre e remova os cards da pagina publica com empresa, endereco, contatos e URLs de mapa/site.</p>
          </div>

          <div className="admin-technical-assistance__toolbar">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar card..."
              />
              {searchTerm && (
                <button type="button" className="clear-search" onClick={() => setSearchTerm('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <button type="button" className="btn-secondary" onClick={handleCreate}>
              <Plus size={18} />
              Novo card
            </button>
          </div>
        </div>

        <div className="card-body">
          {isLoading ? (
            <div className="loading-container">Carregando cards da assistencia tecnica...</div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <Wrench size={32} />
              <p>Nenhum card cadastrado para a pagina de assistencia tecnica.</p>
            </div>
          ) : (
            <div className="admin-technical-assistance__grid">
              {filteredItems.map((item) => {
                const locationLabel = [item.city, item.state_code].filter(Boolean).join(' - ');
                const detailItems = [
                  item.address
                    ? { key: 'address', icon: MapPin, text: item.address, title: item.address }
                    : null,
                  item.phone
                    ? { key: 'phone', icon: Phone, text: item.phone, title: item.phone }
                    : null,
                  item.phone_2
                    ? { key: 'phone_2', icon: Phone, text: item.phone_2, title: item.phone_2 }
                    : null,
                  item.phone_3
                    ? { key: 'phone_3', icon: Phone, text: item.phone_3, title: item.phone_3 }
                    : null,
                  item.email
                    ? { key: 'email', icon: Mail, text: item.email, title: item.email }
                    : null,
                  item.map_url
                    ? { key: 'map_url', icon: MapPin, text: 'Mapa configurado', title: item.map_url }
                    : null,
                  item.site_url
                    ? { key: 'site_url', icon: Globe, text: 'Site configurado', title: item.site_url }
                    : null
                ].filter(Boolean);

                return (
                  <article key={item.id} className="admin-technical-assistance__card">
                    <div className="admin-technical-assistance__card-head">
                      {item.state_code && (
                        <span className="admin-technical-assistance__state-tag">{item.state_code}</span>
                      )}
                      <h3 title={item.company}>{item.company}</h3>
                      {locationLabel && <p>{locationLabel}</p>}
                    </div>

                    <div className="admin-technical-assistance__details">
                      {detailItems.map(({ key, icon: Icon, text, title }) => (
                        <span
                          key={key}
                          className="admin-technical-assistance__detail"
                          title={title}
                        >
                          <Icon size={15} />
                          <span>{text}</span>
                        </span>
                      ))}
                    </div>

                    <div className="admin-technical-assistance__actions">
                      <button type="button" className="btn-secondary" onClick={() => handleEdit(item)}>
                        <Pencil size={16} />
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn-secondary admin-technical-assistance__danger-button"
                        onClick={() => handleDeleteClick(item)}
                      >
                        <Trash2 size={16} />
                        Excluir
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showContentCardModal && (
          <div className="modal-overlay">
            <motion.div
              className="modal-content admin-technical-assistance__modal"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
            >
              <div className="modal-header">
                <h3>{editingContentCard?.id ? 'Editar card de conteudo' : 'Novo card de conteudo'}</h3>
                <button type="button" className="btn-icon" onClick={() => setShowContentCardModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleContentCardSubmit}>
                <div className="modal-body admin-technical-assistance__modal-body">
                  <div className="admin-technical-assistance__form-grid">
                    <div className="form-group admin-technical-assistance__form-group--full">
                      <label>Titulo do card</label>
                      <input
                        type="text"
                        value={contentCardForm.title}
                        onChange={(event) => handleContentCardInputChange('title', event.target.value)}
                        placeholder="Assistencia Tecnica"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Texto do botao</label>
                      <input
                        type="text"
                        value={contentCardForm.button_label}
                        onChange={(event) => handleContentCardInputChange('button_label', event.target.value)}
                        placeholder="Abrir chamado"
                      />
                    </div>

                    <div className="form-group">
                      <label>Ordem</label>
                      <input
                        type="number"
                        min="0"
                        value={contentCardForm.display_order}
                        onChange={(event) => handleContentCardInputChange('display_order', event.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div className="form-group admin-technical-assistance__form-group--full">
                      <label>Primeiro texto do card</label>
                      <textarea
                        rows="4"
                        value={contentCardForm.description}
                        onChange={(event) => handleContentCardInputChange('description', event.target.value)}
                        placeholder="Texto principal do card"
                      />
                    </div>

                    <div className="form-group admin-technical-assistance__form-group--full">
                      <label>Segundo texto do card</label>
                      <textarea
                        rows="4"
                        value={contentCardForm.description_secondary}
                        onChange={(event) => handleContentCardInputChange('description_secondary', event.target.value)}
                        placeholder="Texto complementar do card"
                      />
                    </div>

                    <div className="form-group admin-technical-assistance__form-group--full">
                      <label>Link do card</label>
                      <input
                        type="url"
                        value={contentCardForm.link_url}
                        onChange={(event) => handleContentCardInputChange('link_url', event.target.value)}
                        placeholder="https://talmax.tomticket.com/"
                      />
                    </div>

                    <label className="admin-technical-assistance__checkbox admin-technical-assistance__form-group--full">
                      <input
                        type="checkbox"
                        checked={contentCardForm.is_active}
                        onChange={(event) => handleContentCardInputChange('is_active', event.target.checked)}
                      />
                      Exibir card na pagina publica
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowContentCardModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={isContentCardSubmitting}>
                    {isContentCardSubmitting ? 'Salvando...' : 'Salvar card'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showContentCardDeleteModal && (
          <div className="modal-overlay">
            <motion.div
              className="modal-content"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
            >
              <div className="modal-body">
                <div className="modal-icon">
                  <AlertCircle size={32} />
                </div>
                <h3>Excluir card de conteudo?</h3>
                <p>Deseja remover o card <strong>{contentCardToDelete?.title}</strong>?</p>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowContentCardDeleteModal(false)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-primary admin-technical-assistance__danger-button"
                  onClick={confirmContentCardDelete}
                >
                  Sim, excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div
              className="modal-content admin-technical-assistance__modal"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
            >
              <div className="modal-header">
                <h3>{editingItem?.id ? 'Editar card' : 'Novo card de assistencia tecnica'}</h3>
                <button type="button" className="btn-icon" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body admin-technical-assistance__modal-body">
                  <div className="admin-technical-assistance__form-grid">
                    <div className="form-group admin-technical-assistance__form-group--full">
                      <label>Empresa</label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(event) => handleInputChange('company', event.target.value)}
                        placeholder="Nome da empresa"
                        required
                      />
                    </div>

                    <div className="form-group admin-technical-assistance__form-group--full">
                      <label>Endereco</label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(event) => handleInputChange('address', event.target.value)}
                        placeholder="Rua, numero e complemento"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Cidade</label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(event) => handleInputChange('city', event.target.value)}
                        placeholder="Cidade"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>UF</label>
                      <input
                        type="text"
                        value={form.state_code}
                        onChange={(event) => handleInputChange('state_code', event.target.value)}
                        placeholder="PR"
                        maxLength={2}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Telefone</label>
                      <input
                        type="text"
                        value={form.phone}
                        onChange={(event) => handleInputChange('phone', event.target.value)}
                        placeholder="Telefone principal"
                      />
                    </div>

                    <div className="form-group">
                      <label>Telefone 2</label>
                      <input
                        type="text"
                        value={form.phone_2}
                        onChange={(event) => handleInputChange('phone_2', event.target.value)}
                        placeholder="Segundo telefone"
                      />
                    </div>

                    <div className="form-group">
                      <label>Telefone 3</label>
                      <input
                        type="text"
                        value={form.phone_3}
                        onChange={(event) => handleInputChange('phone_3', event.target.value)}
                        placeholder="Terceiro telefone"
                      />
                    </div>

                    <div className="form-group admin-technical-assistance__form-group--full">
                      <label>E-mail</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) => handleInputChange('email', event.target.value)}
                        placeholder="contato@empresa.com.br"
                      />
                    </div>

                    <div className="form-group admin-technical-assistance__form-group--full">
                      <label>Mapa</label>
                      <input
                        type="url"
                        value={form.map_url}
                        onChange={(event) => handleInputChange('map_url', event.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="form-group admin-technical-assistance__form-group--full">
                      <label>Site</label>
                      <input
                        type="url"
                        value={form.site_url}
                        onChange={(event) => handleInputChange('site_url', event.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Salvar card'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <div className="modal-overlay">
            <motion.div
              className="modal-content"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
            >
              <div className="modal-body">
                <div className="modal-icon">
                  <AlertCircle size={32} />
                </div>
                <h3>Excluir card?</h3>
                <p>Deseja remover o card da empresa <strong>{itemToDelete?.company}</strong>?</p>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-primary admin-technical-assistance__danger-button"
                  onClick={confirmDelete}
                >
                  Sim, excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTechnicalAssistance;
