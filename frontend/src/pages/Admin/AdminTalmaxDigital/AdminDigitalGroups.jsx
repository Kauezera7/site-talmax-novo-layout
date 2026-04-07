import React, { useEffect, useState } from 'react';
import { AlertCircle, ChevronDown, Copy, Eye, FolderPlus, Image as ImageIcon, Pencil, PlusCircle, Save, Trash2, UploadCloud, X } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';
import customPageService from '../../../services/customPageService';
import digitalGroupService from '../../../services/digitalGroupService';
import homeService from '../../../services/homeService';
import { resolveStoredAssetPath } from '../../../utils/assets';
import { buildTalmaxDigitalReferenceCards, DIGITAL_CARD_TEMPLATES, parseDigitalActionsPayload } from '../../../components/TalmaxDigital/digitalCardTemplates';
import pageSettingsService, { DEFAULT_SPECIAL_PAGE_SETTINGS, normalizeSpecialPageSettings } from '../../../services/pageSettingsService';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminTalmaxDigital.css';

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const normalizePublicPath = (value = '') => (
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180)
);

const getTemplateCard = (cardId) => DIGITAL_CARD_TEMPLATES.find((item) => item.id === String(cardId || '').trim()) || null;

const buildCard = (card = {}) => ({
  id: card.id || createId('card'),
  temp_id: card.temp_id || String(card.id || createId('card-temp')),
  custom_page_id: card.custom_page_id || null,
  title: card.title || '',
  description: card.description || '',
  link_url: card.link_url || '',
  is_external: Boolean(card.is_external),
  front_image_url: card.front_image_url || '',
  back_image_url: card.back_image_url || '',
  frontImageFile: null,
  backImageFile: null,
  frontPreview: card.front_image_url
    ? resolveStoredAssetPath(card.front_image_url)
    : getTemplateCard(card.id)?.frontAsset
      ? resolveStoredAssetPath(getTemplateCard(card.id).frontAsset)
      : null,
  backPreview: card.back_image_url
    ? resolveStoredAssetPath(card.back_image_url)
    : getTemplateCard(card.id)?.backAsset
      ? resolveStoredAssetPath(getTemplateCard(card.id).backAsset)
      : null
});

const buildGroup = (group = {}) => ({
  id: group.id || null,
  title: group.title || '',
  slug: group.slug || '',
  description: group.description || '',
  overline: group.overline || '',
  hero_title: group.hero_title || '',
  hero_description: group.hero_description || '',
  logo_url: group.logo_url || '',
  display_order: group.display_order || 0,
  is_active: group.is_active !== false,
  logoFile: null,
  logoPreview: group.logo_url ? resolveStoredAssetPath(group.logo_url) : null,
  cards: Array.isArray(group.cards) ? group.cards.map(buildCard) : []
});

const emptyGroup = () => buildGroup({
  id: null,
  title: '',
  slug: '',
  description: '',
  overline: '',
  hero_title: '',
  hero_description: '',
  logo_url: '',
  display_order: 0,
  is_active: true,
  cards: []
});

const buildPublicGroupUrl = (slugOrId) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  return new URL(`grupo-digital/${String(slugOrId || '').replace(/^\/+/, '')}`, `${window.location.origin}${baseUrl}`).toString();
};

const buildPublicCustomPageUrl = (slug) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  return new URL(`pagina/${slug}`, `${window.location.origin}${baseUrl}`).toString();
};

const ButtonSavingIndicator = () => (
  <span className="loader loader_bubble admin-button-loader" aria-hidden="true" />
);

const normalizeSegmentValue = (value) => String(value || '').trim().toLowerCase();

const isTalmaxDigitalSegment = (service) => {
  const normalizedName = normalizeSegmentValue(service?.name);
  const normalizedLink = normalizeSegmentValue(service?.link_url);
  const digitalCards = parseDigitalActionsPayload(service?.actions).digital_cards;

  return (
    normalizedName === 'talmax digital' ||
    normalizedName.includes('talmax digital') ||
    normalizedLink.includes('/categoria/talmax-digital') ||
    (Array.isArray(digitalCards) && digitalCards.length > 0)
  );
};

const applyHeroDefaultsToGroup = (group, heroDefaults = {}) => ({
  ...group,
  overline: group.overline || heroDefaults.overline || '',
  hero_title: group.hero_title || heroDefaults.title || '',
  hero_description: group.hero_description || heroDefaults.description || '',
  logo_url: group.logo_url || heroDefaults.logo_url || ''
});

const AdminDigitalGroups = ({
  panelTitle = 'Grupo de Segmentos',
  panelDescription = 'Crie grupos independentes e adicione quantos cards quiser com link livre e imagens próprias.'
}) => {
  const { addToast } = useAdmin();
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [collapsedCards, setCollapsedCards] = useState({});
  const [activeUrlPickerKey, setActiveUrlPickerKey] = useState(null);
  const [heroDefaults, setHeroDefaults] = useState(DEFAULT_SPECIAL_PAGE_SETTINGS['talmax-digital']);
  const [activeEditorGroupId, setActiveEditorGroupId] = useState(null);
  const [customPageOptions, setCustomPageOptions] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [items, services, pageSettingsItems, customPages] = await Promise.all([
        digitalGroupService.getAll({ admin: true }),
        homeService.getAll().catch(() => []),
        pageSettingsService.getAll().catch(() => []),
        customPageService.getAll().catch(() => [])
      ]);

      const talmaxDigitalService = Array.isArray(services)
        ? services.find(isTalmaxDigitalSegment)
        : null;

      const nextReferenceCards = talmaxDigitalService
        ? buildTalmaxDigitalReferenceCards(parseDigitalActionsPayload(talmaxDigitalService.actions).digital_cards)
        : buildTalmaxDigitalReferenceCards();
      const normalizedPageSettings = normalizeSpecialPageSettings(pageSettingsItems);

      const nextHeroDefaults = normalizedPageSettings['talmax-digital'] || DEFAULT_SPECIAL_PAGE_SETTINGS['talmax-digital'];
      setHeroDefaults(nextHeroDefaults);
      setCustomPageOptions(
        Array.isArray(customPages)
          ? customPages
              .filter((item) => item?.slug)
              .map((item) => ({
                id: item.id,
                title: item.title || `Página ${item.id}`,
                path: `/pagina/${item.slug}`,
                url: buildPublicCustomPageUrl(item.slug)
              }))
          : []
      );
      setGroups(items.map((item) => buildGroup(applyHeroDefaultsToGroup(item, nextHeroDefaults))));
    } catch (error) {
      addToast(error.message || 'Erro ao carregar grupos digitais', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateGroup = (groupId, updater) => {
    setGroups((current) => current.map((group) => (group.id === groupId ? updater(group) : group)));
  };

  const updateCard = (groupId, cardId, updater) => {
    updateGroup(groupId, (group) => ({
      ...group,
      cards: group.cards.map((card) => (card.id === cardId ? updater(card) : card))
    }));
  };

  const buildCardCollapseKey = (groupId, cardId) => `${groupId}:${cardId}`;
  const buildCardUrlPickerKey = (groupId, cardId) => `url-picker:${groupId}:${cardId}`;

  const toggleCardCollapse = (groupId, cardId) => {
    const nextKey = buildCardCollapseKey(groupId, cardId);
    setCollapsedCards((current) => ({
      ...current,
      [nextKey]: !current[nextKey]
    }));
  };

  const handleAddGroup = () => {
    const nextGroupId = createId('new-group');

    setGroups((current) => ([
      ...current.filter((group) => !String(group.id).startsWith('new-group')),
      {
        ...emptyGroup(),
        id: nextGroupId
      }
    ]));
    setActiveEditorGroupId(nextGroupId);
  };

  const handleAddCard = (groupId) => {
    updateGroup(groupId, (group) => ({
      ...group,
      cards: [
        ...group.cards,
        buildCard()
      ]
    }));
  };

  const handleRemoveGroup = (group) => {
    if (String(group.id).startsWith('new-group')) {
      setGroups((current) => current.filter((item) => item.id !== group.id));
      if (activeEditorGroupId === group.id) {
        setActiveEditorGroupId(null);
      }
      return;
    }

    setGroupToDelete(group);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!groupToDelete) return;

    try {
      await digitalGroupService.remove(groupToDelete.id);
      addToast('Grupo removido com sucesso!');
      if (activeEditorGroupId === groupToDelete.id) {
        setActiveEditorGroupId(null);
      }
      setShowDeleteModal(false);
      setGroupToDelete(null);
      await loadData();
    } catch (error) {
      addToast(error.message || 'Erro ao remover grupo digital', 'error');
    }
  };

  const persistGroup = async (group, options = {}) => {
    if (savingKey) return;

    const nextSavingKey = options.onlyCardId
      ? `card:${group.id}:${options.onlyCardId}`
      : `group:${group.id}`;
    setSavingKey(nextSavingKey);

    try {
      const formData = new FormData();
      formData.append('title', group.title);
      formData.append('slug', group.slug || '');
      formData.append('description', group.description);
      formData.append('overline', group.overline || '');
      formData.append('hero_title', group.hero_title || '');
      formData.append('hero_description', group.hero_description || '');
      formData.append('logo_url', group.logo_url || '');
      formData.append('display_order', String(group.display_order || 0));
      formData.append('is_active', String(group.is_active));
      formData.append('cards', JSON.stringify(group.cards.map((card) => ({
        id: String(card.id).startsWith('card-') ? '' : card.id,
        temp_id: card.temp_id,
        custom_page_id: card.custom_page_id || null,
        title: card.title,
        description: card.description,
        link_url: card.link_url,
        is_external: card.is_external,
        front_image_url: card.front_image_url || '',
        back_image_url: card.back_image_url || ''
      }))));

      group.cards.forEach((card) => {
        if (options.onlyCardId && card.id !== options.onlyCardId) return;
        if (card.frontImageFile) formData.append(`card_front_${card.temp_id}`, card.frontImageFile);
        if (card.backImageFile) formData.append(`card_back_${card.temp_id}`, card.backImageFile);
      });

      if (group.logoFile) {
        formData.append('logo', group.logoFile);
      }

      if (String(group.id).startsWith('new-group')) {
        await digitalGroupService.create(formData);
        addToast('Novo grupo criado com sucesso!');
      } else {
        await digitalGroupService.update(group.id, formData);
        addToast(options.onlyCardId ? 'Card atualizado com sucesso!' : 'Grupo atualizado com sucesso!');
      }

      await loadData();
      return true;
    } catch (error) {
      addToast(error.message || (options.onlyCardId ? 'Erro ao salvar card do grupo' : 'Erro ao salvar grupo digital'), 'error');
      return false;
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveGroup = async (group) => {
    const saved = await persistGroup(group);
    if (saved) {
      setActiveEditorGroupId(null);
    }
  };

  const handleImageChange = (groupId, cardId, side, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateCard(groupId, cardId, (card) => (
        side === 'front'
          ? { ...card, frontImageFile: file, frontPreview: reader.result }
          : { ...card, backImageFile: file, backPreview: reader.result }
      ));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (groupId, cardId, side) => {
    updateCard(groupId, cardId, (card) => (
      side === 'front'
        ? { ...card, front_image_url: '', frontImageFile: null, frontPreview: null }
        : { ...card, back_image_url: '', backImageFile: null, backPreview: null }
    ));
  };

  const handleLogoChange = (groupId, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      updateGroup(groupId, (group) => ({
        ...group,
        logoFile: file,
        logoPreview: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = (groupId) => {
    updateGroup(groupId, (group) => ({
      ...group,
      logo_url: '',
      logoFile: null,
      logoPreview: null
    }));
  };

  const handleEditGroup = (groupId) => {
    setActiveEditorGroupId(groupId);

    const section = document.getElementById('digital-group-editor');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCopyLink = async (group) => {
    try {
      await navigator.clipboard.writeText(buildPublicGroupUrl(group.slug || group.id));
      addToast('Link do grupo copiado com sucesso!');
    } catch (error) {
      addToast('Não foi possível copiar o link do grupo.', 'error');
    }
  };

  const resolveCustomPageByValue = (value) => (
    customPageOptions.find((page) => page.path === value || page.url === value) || null
  );

  const getFilteredCustomPageOptions = (query) => {
    const normalizedFilter = String(query || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (!normalizedFilter) {
      return customPageOptions;
    }

    return customPageOptions.filter((page) => (
      `${page.title} ${page.path}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .includes(normalizedFilter)
    ));
  };

  if (isLoading) {
    return <div className="loading-container">Carregando grupos de segmentos...</div>;
  }

  return (
    <div className="admin-talmax-digital">
      <div className="admin-card">
        <div className="card-header admin-talmax-digital__header">
          <div className="admin-talmax-digital__hero-copy">
            <h2><FolderPlus size={20} /> {panelTitle}</h2>
            <p>{panelDescription}</p>
            <small className="admin-talmax-digital__hero-note">
              Novo grupo inicia com o layout-base da Talmax Digital como referência, sem alterar a página original.
            </small>
          </div>

          <button type="button" className="btn-primary" onClick={handleAddGroup}>
            <PlusCircle size={16} />
            Novo grupo
          </button>
        </div>

        <div className="card-body">
          {!activeEditorGroupId ? (
            <div className="empty-state">
              Clique em <strong>Novo grupo</strong> para criar um grupo ou em <strong>Editar</strong> em um grupo cadastrado.
            </div>
          ) : (
            groups
              .filter((group) => group.id === activeEditorGroupId)
              .map((group) => (
              <section key={group.id} id="digital-group-editor" className="admin-talmax-digital__group">
                <div className="admin-talmax-digital__group-header">
                  <div className="admin-talmax-digital__group-settings-card">
                    <div className="admin-talmax-digital__section-intro">
                      <h2>{group.title || 'Novo grupo'}</h2>
                      <p>Edite logo, texto superior, título e descrição da página {group.title || 'deste grupo'}.</p>
                    </div>

                    <div className="admin-talmax-digital__group-settings-fields">
                      <div className="form-group admin-talmax-digital__field--full">
                        <label>Nome do grupo</label>
                        <input
                          type="text"
                          value={group.title}
                          onChange={(event) => updateGroup(group.id, (current) => {
                            const nextTitle = event.target.value;
                            const nextSlug = normalizePublicPath(nextTitle);

                            return {
                              ...current,
                              title: nextTitle,
                              slug: !current.slug || current.slug === normalizePublicPath(current.title) ? nextSlug : current.slug
                            };
                          })}
                          placeholder="Ex: Escaneamento"
                        />
                      </div>

                      <div className="form-group admin-talmax-digital__field--full">
                        <label>URL pública</label>
                        <input
                          type="text"
                          value={group.slug}
                          onChange={(event) => updateGroup(group.id, (current) => ({
                            ...current,
                            slug: normalizePublicPath(event.target.value)
                          }))}
                          placeholder="Ex: escaneamento-intraoral"
                        />
                        <small className="admin-talmax-digital__field-help">
                          Endereço final: /grupo-digital/{group.slug || 'sua-url'}
                        </small>
                      </div>

                      <div className="form-group">
                        <label>Texto Superior</label>
                        <input
                          type="text"
                          value={group.overline}
                          onChange={(event) => updateGroup(group.id, (current) => ({ ...current, overline: event.target.value }))}
                          placeholder="Ex: TECNOLOGIA ODONTOLÓGICA"
                        />
                      </div>

                      <div className="form-group">
                        <label>Título</label>
                        <input
                          type="text"
                          value={group.hero_title}
                          onChange={(event) => updateGroup(group.id, (current) => ({ ...current, hero_title: event.target.value }))}
                          placeholder="Título da página"
                        />
                      </div>

                      <div className="admin-talmax-digital__hero-row admin-talmax-digital__field--full">
                        <div className="form-group">
                          <label>Texto / Descrição</label>
                          <textarea
                            rows="4"
                            value={group.hero_description}
                            onChange={(event) => updateGroup(group.id, (current) => ({ ...current, hero_description: event.target.value }))}
                            placeholder="Descrição da página"
                          />
                        </div>

                        <div className="form-group">
                          <label>Logo</label>
                          <div className="admin-talmax-digital__logo-field">
                            <div className="file-upload-area admin-talmax-digital__upload-area admin-talmax-digital__logo-upload">
                              <input type="file" accept="image/*" onChange={(event) => handleLogoChange(group.id, event.target.files?.[0])} />
                              <UploadCloud size={28} color="var(--admin-primary)" />
                              <p>Enviar logo da página</p>
                            </div>

                            <div className="admin-talmax-digital__logo-preview-box">
                              {group.logoPreview ? (
                                <div className="admin-talmax-digital__logo-preview">
                                  <button
                                    type="button"
                                    className="admin-talmax-digital__remove-image"
                                    onClick={() => handleRemoveLogo(group.id)}
                                  >
                                    <X size={14} />
                                  </button>
                                  <img src={group.logoPreview} alt={group.hero_title || group.title || 'Logo do grupo'} />
                                </div>
                              ) : (
                                <span>Logo do grupo</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                <div className="admin-talmax-digital__cards-panel">
                  <div className="admin-talmax-digital__cards-intro">
                    <h2><ImageIcon size={20} /> Cards</h2>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleAddCard(group.id)}
                    >
                      <PlusCircle size={16} />
                      Novo card
                    </button>
                  </div>

                  <div className="admin-talmax-digital__cards-grid">
                    {group.cards.length === 0 ? (
                      <div className="empty-state">Nenhum card adicionado.</div>
                    ) : group.cards.map((card) => (
                    <article
                      key={card.id}
                      className={`admin-talmax-digital__card ${collapsedCards[buildCardCollapseKey(group.id, card.id)] ? 'is-collapsed' : ''}`}
                    >
                      <button
                        type="button"
                        className={`admin-talmax-digital__card-toggle ${collapsedCards[buildCardCollapseKey(group.id, card.id)] ? 'is-collapsed' : ''}`}
                        onClick={() => toggleCardCollapse(group.id, card.id)}
                        aria-expanded={!collapsedCards[buildCardCollapseKey(group.id, card.id)]}
                      >
                        <span>{card.title || 'Novo card'}</span>
                        <ChevronDown size={18} />
                      </button>

                          {!collapsedCards[buildCardCollapseKey(group.id, card.id)] && (
                            <>
                              <div className="admin-talmax-digital__card-section">
                                <div className="admin-talmax-digital__card-header">
                                  <div className="admin-talmax-digital__card-copy">
                                    <div className="form-group">
                                      <label>Título</label>
                                      <input
                                        type="text"
                                        value={card.title}
                                        onChange={(event) => updateCard(group.id, card.id, (current) => ({ ...current, title: event.target.value }))}
                                      />
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className="admin-talmax-digital__remove-card"
                                    onClick={() => updateGroup(group.id, (current) => ({
                                      ...current,
                                      cards: current.cards.filter((item) => item.id !== card.id)
                                    }))}
                                    aria-label={`Remover ${card.title || 'card'}`}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>

                              <div className="admin-talmax-digital__card-fields">
                                <div className="form-group">
                                  <label>URL</label>
                                  <div className="admin-talmax-digital__url-picker">
                                    <input
                                      type="text"
                                      value={card.link_url}
                                      onFocus={() => setActiveUrlPickerKey(buildCardUrlPickerKey(group.id, card.id))}
                                      onBlur={() => {
                                        window.setTimeout(() => {
                                          setActiveUrlPickerKey((current) => (
                                            current === buildCardUrlPickerKey(group.id, card.id) ? null : current
                                          ));
                                        }, 120);
                                      }}
                                      onChange={(event) => {
                                        const nextValue = event.target.value;
                                        const matchedCustomPage = resolveCustomPageByValue(nextValue);

                                        updateCard(group.id, card.id, (current) => ({
                                          ...current,
                                          link_url: nextValue,
                                          custom_page_id: matchedCustomPage?.id || null
                                        }));
                                        setActiveUrlPickerKey(buildCardUrlPickerKey(group.id, card.id));
                                      }}
                                      placeholder="Clique para buscar ou preencha manualmente"
                                    />
                                    {activeUrlPickerKey === buildCardUrlPickerKey(group.id, card.id) && (
                                      <div className="admin-talmax-digital__url-picker-panel">
                                        <div className="admin-talmax-digital__url-picker-note">
                                          Digite para filtrar as páginas personalizadas ou mantenha uma URL manual.
                                        </div>

                                        {getFilteredCustomPageOptions(card.link_url).length === 0 ? (
                                          <div className="admin-talmax-digital__url-picker-empty">
                                            Nenhuma página encontrada.
                                          </div>
                                        ) : (
                                          getFilteredCustomPageOptions(card.link_url).map((page) => (
                                            <button
                                              key={page.id}
                                              type="button"
                                              className={`admin-talmax-digital__url-picker-option ${card.custom_page_id === page.id ? 'is-active' : ''}`}
                                              onMouseDown={() => {
                                                updateCard(group.id, card.id, (current) => ({
                                                  ...current,
                                                  link_url: page.path,
                                                  custom_page_id: page.id
                                                }));
                                                setActiveUrlPickerKey(null);
                                              }}
                                            >
                                              <strong>{page.title}</strong>
                                              <span>{page.path}</span>
                                            </button>
                                          ))
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              </div>

                              <div className="admin-talmax-digital__uploads">
                                <div className="admin-talmax-digital__upload-block admin-talmax-digital__card-section">
                                  <label>Frente</label>
                                  <div className="admin-talmax-digital__upload-row">
                                    <div className="file-upload-area admin-talmax-digital__upload-area">
                                      <input type="file" accept="image/*" onChange={(event) => handleImageChange(group.id, card.id, 'front', event.target.files?.[0])} />
                                      <UploadCloud size={28} color="var(--admin-primary)" />
                                      <p>Imagem da frente</p>
                                    </div>
                                    {card.frontPreview && (
                                      <div className="admin-talmax-digital__preview">
                                        <button type="button" className="admin-talmax-digital__remove-image" onClick={() => handleRemoveImage(group.id, card.id, 'front')}>
                                          <X size={14} />
                                        </button>
                                        <img src={card.frontPreview} alt={card.title || 'Frente'} />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="admin-talmax-digital__upload-block admin-talmax-digital__card-section">
                                  <label>Verso</label>
                                  <div className="admin-talmax-digital__upload-row">
                                    <div className="file-upload-area admin-talmax-digital__upload-area">
                                      <input type="file" accept="image/*" onChange={(event) => handleImageChange(group.id, card.id, 'back', event.target.files?.[0])} />
                                      <UploadCloud size={28} color="var(--admin-primary)" />
                                      <p>Imagem do verso</p>
                                    </div>
                                    {card.backPreview && (
                                      <div className="admin-talmax-digital__preview admin-talmax-digital__preview--back">
                                        <button type="button" className="admin-talmax-digital__remove-image" onClick={() => handleRemoveImage(group.id, card.id, 'back')}>
                                          <X size={14} />
                                        </button>
                                        <img src={card.backPreview} alt={card.title || 'Verso'} />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                    </article>
                    ))}
                  </div>
                </div>

                <div className="admin-talmax-digital__actions admin-talmax-digital__actions--footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      if (String(group.id).startsWith('new-group')) {
                        setGroups((current) => current.filter((item) => item.id !== group.id));
                      }
                      setActiveEditorGroupId(null);
                    }}
                    disabled={Boolean(savingKey)}
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleSaveGroup(group)}
                    disabled={Boolean(savingKey)}
                  >
                    {savingKey === `group:${group.id}` ? <ButtonSavingIndicator /> : <Save size={18} />}
                    {savingKey === `group:${group.id}` ? 'Salvando' : `Salvar tudo de ${group.title || 'grupo'}`}
                  </button>
                </div>
              </section>
            ))
          )}
        </div>
      </div>
      <div className="admin-card">
        <div className="card-header admin-talmax-digital__saved-header">
          <div>
            <h2><Eye size={20} /> Páginas cadastradas</h2>
            <p>Edite um grupo existente ou copie a URL pública para compartilhar.</p>
          </div>
        </div>

        <div className="card-body">
          {groups.filter((group) => !String(group.id).startsWith('new-group')).length === 0 ? (
            <div className="empty-state">Nenhum grupo digital cadastrado ainda.</div>
          ) : (
            <div className="admin-custom-pages__list">
              {groups
                .filter((group) => !String(group.id).startsWith('new-group'))
                .map((group) => (
                  <article key={group.id} className="admin-custom-pages__list-item admin-talmax-digital__saved-item">
                    <div className="admin-talmax-digital__saved-main">
                      <div className="admin-talmax-digital__saved-copy">
                        <div className="admin-talmax-digital__saved-copy-head">
                          <strong>{group.hero_title || group.title || `Grupo ${group.id}`}</strong>
                          <div className="admin-talmax-digital__saved-inline-meta" aria-label="Resumo do grupo">
                            <span className={`admin-talmax-digital__saved-status ${group.is_active ? 'is-active' : 'is-inactive'}`}>
                              {group.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                            <span className="admin-talmax-digital__saved-status admin-talmax-digital__saved-status--neutral">
                              {group.cards.length} cards
                            </span>
                          </div>
                        </div>

                        <span className="admin-talmax-digital__saved-path">/grupo-digital/{group.slug || group.id}</span>
                      </div>
                    </div>

                    <div className="admin-custom-pages__list-actions admin-talmax-digital__saved-actions">
                      <button
                        type="button"
                        className="btn-secondary admin-talmax-digital__saved-action admin-talmax-digital__saved-icon-button"
                        onClick={() => handleEditGroup(group.id)}
                        aria-label={`Editar grupo ${group.hero_title || group.title || group.id}`}
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-secondary admin-talmax-digital__saved-action admin-talmax-digital__saved-icon-button"
                        onClick={() => handleCopyLink(group)}
                        aria-label={`Copiar link do grupo ${group.hero_title || group.title || group.id}`}
                        title="Copiar link"
                      >
                        <Copy size={14} />
                      </button>
                      <a
                        className="btn-primary admin-custom-pages__preview-link admin-talmax-digital__saved-action admin-talmax-digital__saved-action--primary admin-talmax-digital__saved-icon-button"
                        href={buildPublicGroupUrl(group.slug || group.id)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Ver página do grupo ${group.hero_title || group.title || group.id}`}
                        title="Ver página"
                      >
                        <Eye size={14} />
                      </a>
                      <button
                        type="button"
                        className="btn-secondary btn-danger-outline admin-talmax-digital__saved-delete"
                        onClick={() => handleRemoveGroup(group)}
                        aria-label={`Excluir grupo ${group.hero_title || group.title || group.id}`}
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <div className="modal-overlay">
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-body">
                <div className="modal-icon">
                  <AlertCircle size={32} />
                </div>
                <h3>Excluir Grupo?</h3>
                <p>Tem certeza que deseja excluir o grupo <strong>{groupToDelete?.title}</strong>?</p>
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '10px' }}>
                  Esta ação não poderá ser desfeita e removerá todos os cards deste grupo.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                <button className="btn-primary" style={{ backgroundColor: 'var(--admin-danger)' }} onClick={confirmDelete}>Sim, Excluir</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDigitalGroups;
