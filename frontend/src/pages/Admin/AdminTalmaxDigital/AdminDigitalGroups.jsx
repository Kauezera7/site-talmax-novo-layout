import React, { useEffect, useState } from 'react';
import { Copy, Eye, FolderPlus, Image as ImageIcon, Pencil, PlusCircle, Save, Trash2, UploadCloud, X } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';
import digitalGroupService from '../../../services/digitalGroupService';
import homeService from '../../../services/homeService';
import { resolveStoredAssetPath } from '../../../utils/assets';
import { buildTalmaxDigitalReferenceCards, DIGITAL_CARD_TEMPLATES, parseDigitalActionsPayload } from '../../../components/TalmaxDigital/digitalCardTemplates';
import pageSettingsService, { DEFAULT_SPECIAL_PAGE_SETTINGS, normalizeSpecialPageSettings } from '../../../services/pageSettingsService';
import './AdminTalmaxDigital.css';

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getTemplateCard = (cardId) => DIGITAL_CARD_TEMPLATES.find((item) => item.id === String(cardId || '').trim()) || null;

const buildCard = (card = {}) => ({
  id: card.id || createId('card'),
  temp_id: card.temp_id || String(card.id || createId('card-temp')),
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

const emptyGroup = (heroDefaults = {}) => buildGroup({
  id: null,
  title: '',
  description: '',
  overline: heroDefaults.overline || '',
  hero_title: heroDefaults.title || '',
  hero_description: heroDefaults.description || '',
  logo_url: heroDefaults.logo_url || '',
  display_order: 0,
  is_active: true,
  cards: []
});

const buildGroupTemplateCards = (referenceCards = []) => (
  referenceCards.map((card) => buildCard({
    title: card.title || '',
    description: card.description || '',
    link_url: card.link_url || '',
    is_external: Boolean(card.is_external),
    front_image_url: card.front_image_url || '',
    back_image_url: card.back_image_url || ''
  }))
);

const buildPublicGroupUrl = (id) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  return new URL(`grupo-digital/${id}`, `${window.location.origin}${baseUrl}`).toString();
};

const ButtonSavingIndicator = () => (
  <span className="loader loader_bubble admin-button-loader" aria-hidden="true" />
);

const applyHeroDefaultsToGroup = (group, heroDefaults = {}) => ({
  ...group,
  overline: group.overline || heroDefaults.overline || '',
  hero_title: group.hero_title || heroDefaults.title || '',
  hero_description: group.hero_description || heroDefaults.description || '',
  logo_url: group.logo_url || heroDefaults.logo_url || ''
});

const AdminDigitalGroups = ({
  panelTitle = 'Grupo de Seguimentos',
  panelDescription = 'Crie grupos independentes e adicione quantos cards quiser com link livre e imagens próprias.'
}) => {
  const { addToast } = useAdmin();
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [referenceCards, setReferenceCards] = useState(() => buildTalmaxDigitalReferenceCards());
  const [heroDefaults, setHeroDefaults] = useState(DEFAULT_SPECIAL_PAGE_SETTINGS['talmax-digital']);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [items, services, pageSettingsItems] = await Promise.all([
        digitalGroupService.getAll({ admin: true }),
        homeService.getAll().catch(() => []),
        pageSettingsService.getAll().catch(() => [])
      ]);

      const talmaxDigitalService = Array.isArray(services)
        ? services.find((service) => String(service?.name || '').trim().toLowerCase() === 'talmax digital')
        : null;

      const nextReferenceCards = talmaxDigitalService
        ? buildTalmaxDigitalReferenceCards(parseDigitalActionsPayload(talmaxDigitalService.actions).digital_cards)
        : buildTalmaxDigitalReferenceCards();
      const normalizedPageSettings = normalizeSpecialPageSettings(pageSettingsItems);

      setReferenceCards(nextReferenceCards);
      const nextHeroDefaults = normalizedPageSettings['talmax-digital'] || DEFAULT_SPECIAL_PAGE_SETTINGS['talmax-digital'];
      setHeroDefaults(nextHeroDefaults);
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

  const handleAddGroup = () => {
    setGroups((current) => [
      ...current,
      {
        ...emptyGroup(heroDefaults),
        id: createId('new-group'),
        cards: buildGroupTemplateCards(referenceCards)
      }
    ]);
  };

  const handleRemoveGroup = async (group) => {
    if (String(group.id).startsWith('new-group')) {
      setGroups((current) => current.filter((item) => item.id !== group.id));
      return;
    }

    if (!window.confirm(`Deseja remover o grupo "${group.title || 'sem nome'}"?`)) return;

    try {
      await digitalGroupService.remove(group.id);
      addToast('Grupo removido com sucesso!');
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
    } catch (error) {
      addToast(error.message || (options.onlyCardId ? 'Erro ao salvar card do grupo' : 'Erro ao salvar grupo digital'), 'error');
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveGroup = async (group) => {
    await persistGroup(group);
  };

  const handleSaveCard = async (group, cardId) => {
    await persistGroup(group, { onlyCardId: cardId });
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
    const section = document.getElementById(`digital-group-editor-${groupId}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCopyLink = async (groupId) => {
    try {
      await navigator.clipboard.writeText(buildPublicGroupUrl(groupId));
      addToast('Link do grupo copiado com sucesso!');
    } catch (error) {
      addToast('Nao foi possivel copiar o link do grupo.', 'error');
    }
  };

  if (isLoading) {
    return <div className="loading-container">Carregando grupos de seguimentos...</div>;
  }

  return (
    <div className="admin-talmax-digital">
      <div className="admin-card">
        <div className="card-header admin-talmax-digital__header">
          <div className="admin-talmax-digital__hero-copy">
            <h2><FolderPlus size={20} /> {panelTitle}</h2>
            <p>{panelDescription}</p>
            <small className="admin-talmax-digital__hero-note">
              Novo grupo inicia com o layout-base da Talmax Digital como referencia, sem alterar a pagina original.
            </small>
          </div>

          <button type="button" className="btn-primary" onClick={handleAddGroup}>
            <PlusCircle size={16} />
            Novo grupo
          </button>
        </div>

        <div className="card-body">
          <div className="admin-talmax-digital__grid">
            {groups.map((group) => (
              <section key={group.id} id={`digital-group-editor-${group.id}`} className="admin-talmax-digital__group">
                <div className="admin-talmax-digital__group-topbar">
                  <button type="button" className="btn-secondary" onClick={() => updateGroup(group.id, (current) => ({
                    ...current,
                    cards: [...current.cards, buildCard()]
                  }))}>
                    <PlusCircle size={16} />
                    Novo card
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => handleRemoveGroup(group)}>
                    <Trash2 size={16} />
                    Remover grupo
                  </button>
                </div>

                <div className="admin-talmax-digital__group-header">
                  <div className="admin-talmax-digital__group-settings-card">
                    <div className="admin-talmax-digital__section-intro">
                      <h2>{group.title || 'Novo grupo'}</h2>
                      <p>Edite logo, texto superior, titulo e descricao da pagina {group.title || 'deste grupo'}.</p>
                    </div>

                    <div className="admin-talmax-digital__group-settings-fields">
                      <div className="form-group admin-talmax-digital__field--full">
                        <label>Nome do grupo</label>
                        <input
                          type="text"
                          value={group.title}
                          onChange={(event) => updateGroup(group.id, (current) => ({ ...current, title: event.target.value }))}
                          placeholder="Ex: Escaneamento"
                        />
                      </div>

                      <div className="form-group">
                        <label>Texto Superior</label>
                        <input
                          type="text"
                          value={group.overline}
                          onChange={(event) => updateGroup(group.id, (current) => ({ ...current, overline: event.target.value }))}
                          placeholder="Ex: TECNOLOGIA ODONTOLOGICA"
                        />
                      </div>

                      <div className="form-group">
                        <label>Titulo</label>
                        <input
                          type="text"
                          value={group.hero_title}
                          onChange={(event) => updateGroup(group.id, (current) => ({ ...current, hero_title: event.target.value }))}
                          placeholder="Titulo da pagina"
                        />
                      </div>

                      <div className="form-group">
                        <label>Texto / Descricao</label>
                        <textarea
                          rows="4"
                          value={group.hero_description}
                          onChange={(event) => updateGroup(group.id, (current) => ({ ...current, hero_description: event.target.value }))}
                          placeholder="Descricao da pagina"
                        />
                      </div>

                      <div className="form-group">
                        <label>Logo</label>
                        <div className="file-upload-area admin-talmax-digital__upload-area">
                          <input type="file" accept="image/*" onChange={(event) => handleLogoChange(group.id, event.target.files?.[0])} />
                          <UploadCloud size={28} color="var(--admin-primary)" />
                          <p>Enviar logo da pagina</p>
                        </div>

                        {group.logoPreview && (
                          <div className="admin-talmax-digital__logo-preview">
                            <img src={group.logoPreview} alt={group.hero_title || group.title || 'Logo do grupo'} />
                            <button type="button" className="btn-secondary" onClick={() => handleRemoveLogo(group.id)}>
                              Remover logo
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="admin-talmax-digital__actions">
                      <button type="button" className="btn-primary" onClick={() => handleSaveGroup(group)} disabled={Boolean(savingKey)}>
                        {savingKey === `group:${group.id}` ? <ButtonSavingIndicator /> : <Save size={18} />}
                        {savingKey === `group:${group.id}` ? 'Salvando' : `Salvar ${group.title || 'grupo'}`}
                      </button>
                    </div>
                  </div>

                </div>

                <div className="admin-talmax-digital__cards-section">
                  <div className="admin-talmax-digital__cards-intro">
                    <div>
                      <h2><ImageIcon size={20} /> {group.title || 'Novo grupo'}</h2>
                      <p>Edite separadamente as imagens de frente e verso dos cards desta pagina. Cada bloco tem seu proprio salvar.</p>
                    </div>
                  </div>

                  <div className="admin-talmax-digital__cards-grid">
                    {group.cards.map((card) => (
                      <article key={card.id} className="admin-talmax-digital__card">
                        <div className="admin-talmax-digital__card-panel">
                          <div className="admin-talmax-digital__card-header">
                            <div className="admin-talmax-digital__card-copy">
                              <div className="form-group">
                                <label>Titulo</label>
                                <input
                                  type="text"
                                  value={card.title}
                                  onChange={(event) => updateCard(group.id, card.id, (current) => ({ ...current, title: event.target.value }))}
                                />
                              </div>
                              <div className="form-group">
                                <label>Descricao</label>
                                <textarea
                                  rows="3"
                                  value={card.description}
                                  onChange={(event) => updateCard(group.id, card.id, (current) => ({ ...current, description: event.target.value }))}
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => updateGroup(group.id, (current) => ({
                                ...current,
                                cards: current.cards.filter((item) => item.id !== card.id)
                              }))}
                            >
                              <Trash2 size={16} />
                              Remover
                            </button>
                          </div>

                          <div className="admin-talmax-digital__card-fields">
                            <div className="form-group">
                              <label>URL</label>
                              <input
                                type="text"
                                value={card.link_url}
                                onChange={(event) => updateCard(group.id, card.id, (current) => ({ ...current, link_url: event.target.value }))}
                              />
                            </div>
                            <label className="admin-talmax-digital__toggle">
                              <input
                                type="checkbox"
                                checked={card.is_external}
                                onChange={(event) => updateCard(group.id, card.id, (current) => ({ ...current, is_external: event.target.checked }))}
                              />
                              <span>Abrir externo</span>
                            </label>
                          </div>
                        </div>

                        <div className="admin-talmax-digital__uploads">
                          <div className="admin-talmax-digital__upload-block admin-talmax-digital__card-panel">
                            <label>Frente</label>
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

                          <div className="admin-talmax-digital__upload-block admin-talmax-digital__card-panel">
                            <label>Verso</label>
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

                        <div className="admin-talmax-digital__actions">
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => handleSaveCard(group, card.id)}
                            disabled={Boolean(savingKey)}
                          >
                            {savingKey === `card:${group.id}:${card.id}` ? <ButtonSavingIndicator /> : <Save size={18} />}
                            {savingKey === `card:${group.id}:${card.id}` ? 'Salvando' : `Salvar ${card.title || 'card'}`}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header admin-talmax-digital__saved-header">
          <div>
            <h2><Eye size={20} /> Paginas cadastradas</h2>
            <p>Edite um grupo existente ou copie a URL publica para compartilhar.</p>
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
                    <div className="admin-talmax-digital__saved-copy">
                      <strong>{group.hero_title || group.title || `Grupo ${group.id}`}</strong>
                      <span>/grupo-digital/{group.id}</span>
                      <small>{group.cards.length} card(s)</small>
                    </div>

                    <div className="admin-custom-pages__list-actions">
                      <button type="button" className="btn-secondary" onClick={() => handleEditGroup(group.id)}>
                        <Pencil size={16} />
                        Editar
                      </button>
                      <button type="button" className="btn-secondary" onClick={() => handleCopyLink(group.id)}>
                        <Copy size={16} />
                        Copiar link
                      </button>
                      <a
                        className="btn-primary admin-custom-pages__preview-link"
                        href={buildPublicGroupUrl(group.id)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Eye size={16} />
                        Ver pagina
                      </a>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDigitalGroups;
