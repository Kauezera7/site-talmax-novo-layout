import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Copy, Eye, LayoutTemplate, Pencil, PlusCircle, Save, Trash2, UploadCloud, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAdmin } from '../../../context/AdminContext';
import customPageService from '../../../services/customPageService';
import { apiAssetPath, assetPath } from '../../../utils/assets';
import './AdminCustomPages.css';

const LAYOUT_OPTIONS = [
  {
    value: 'hero-left',
    title: 'Layout de Lista',
    description: 'Banner grande com bloco de texto alinhado à esquerda.'
  },
  {
    value: 'hero-centered',
    title: 'Layout produtos em destaque',
    description: 'Hero centralizado com logo em destaque e texto compacto.'
  },
  {
    value: 'hero-split',
    title: 'Layout 3',
    description: 'Banner lateral com conteúdo e produtos em composição dividida.'
  }
];

const EMPTY_FORM = {
  id: null,
  title: '',
  slug: '',
  layout_type: 'hero-left',
  description: '',
  sub_description: '',
  banner_url: '',
  logo_url: '',
  is_active: true,
  product_ids: [],
  bannerFile: null,
  logoFile: null,
  bannerPreview: '',
  logoPreview: ''
};

const slugify = (value = '') => (
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
);

const buildFormFromItem = (item) => ({
  id: item.id,
  title: item.title || '',
  slug: item.slug || '',
  layout_type: item.layout_type || 'hero-left',
  description: item.description || '',
  sub_description: item.sub_description || '',
  banner_url: item.banner_url || '',
  logo_url: item.logo_url || '',
  is_active: item.is_active !== false,
  product_ids: Array.isArray(item.product_ids) ? item.product_ids : [],
  bannerFile: null,
  logoFile: null,
  bannerPreview: item.banner_url ? apiAssetPath(item.banner_url) : '',
  logoPreview: item.logo_url ? apiAssetPath(item.logo_url) : ''
});

const fileToPreview = (file, callback) => {
  const reader = new FileReader();
  reader.onloadend = () => callback(reader.result);
  reader.readAsDataURL(file);
};

const buildPublicPageUrl = (slug) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  return new URL(`pagina/${slug}`, `${window.location.origin}${baseUrl}`).toString();
};

const AdminCustomPages = () => {
  const { products, addToast } = useAdmin();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [productFilter, setProductFilter] = useState('');
  const [savedPagesFilter, setSavedPagesFilter] = useState('');

  const allProducts = useMemo(
    () => [...products].sort((first, second) => String(first.name || '').localeCompare(String(second.name || ''))),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const normalizedFilter = productFilter
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (!normalizedFilter) {
      return allProducts;
    }

    return allProducts.filter((product) => {
      const searchableText = [
        product.name,
        product.category_names,
        Array.isArray(product.category_ids) ? product.category_ids.join(' ') : '',
        Array.isArray(product.sub_category_ids) ? product.sub_category_ids.join(' ') : ''
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      return searchableText.includes(normalizedFilter);
    });
  }, [allProducts, productFilter]);

  const filteredItems = useMemo(() => {
    const normalizedFilter = savedPagesFilter
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (!normalizedFilter) {
      return items;
    }

    return items.filter((item) => {
      const searchableText = [item.title, item.slug]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      return searchableText.includes(normalizedFilter);
    });
  }, [items, savedPagesFilter]);

  const loadItems = async () => {
    setIsLoading(true);

    try {
      const data = await customPageService.getAll();
      setItems(data);
    } catch (error) {
      addToast(error.message || 'Erro ao carregar páginas personalizadas', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
  };

  const handleInputChange = (field, value) => {
    setForm((current) => {
      const next = {
        ...current,
        [field]: value
      };

      if (field === 'title' && (!current.slug || current.slug === slugify(current.title))) {
        next.slug = slugify(value);
      }

      if (field === 'slug') {
        next.slug = slugify(value);
      }

      return next;
    });
  };

  const handleFileChange = (field, file) => {
    if (!file) return;

    fileToPreview(file, (preview) => {
      setForm((current) => ({
        ...current,
        [`${field}File`]: file,
        [`${field}Preview`]: preview
      }));
    });
  };

  const handleRemoveFile = (field) => {
    setForm((current) => ({
      ...current,
      [`${field}File`]: null,
      [`${field}Preview`]: '',
      [`${field}_url`]: ''
    }));
  };

  const handleProductToggle = (productId) => {
    setForm((current) => {
      const alreadySelected = current.product_ids.includes(productId);
      return {
        ...current,
        product_ids: alreadySelected
          ? current.product_ids.filter((id) => id !== productId)
          : [...current.product_ids, productId]
      };
    });
  };

  const handleEdit = (item) => {
    setForm(buildFormFromItem(item));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = async (slug) => {
    const pageUrl = buildPublicPageUrl(slug);

    try {
      await navigator.clipboard.writeText(pageUrl);
      addToast('Link da página copiado com sucesso!');
    } catch (error) {
      addToast('Não foi possível copiar o link da página.', 'error');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('slug', form.slug);
      formData.append('layout_type', form.layout_type);
      formData.append('description', form.description);
      formData.append('sub_description', form.sub_description);
      formData.append('is_active', String(form.is_active));
      formData.append('banner_url', form.banner_url || '');
      formData.append('logo_url', form.logo_url || '');
      formData.append('product_ids', JSON.stringify(form.product_ids));

      if (form.bannerFile) {
        formData.append('banner', form.bannerFile);
      }

      if (form.logoFile) {
        formData.append('logo', form.logoFile);
      }

      if (form.id) {
        await customPageService.update(form.id, formData);
        addToast('Página personalizada atualizada com sucesso!');
      } else {
        await customPageService.create(formData);
        addToast('Página personalizada criada com sucesso!');
      }

      await loadItems();
      resetForm();
    } catch (error) {
      addToast(error.message || 'Erro ao salvar página personalizada', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id || isDeleting) return;

    setPageToDelete({
      id: form.id,
      title: form.title || 'sem nome'
    });
  };

  const handleDeleteItem = (item) => {
    if (!item?.id || isDeleting) return;

    setPageToDelete({
      id: item.id,
      title: item.title || 'sem nome'
    });
  };

  const confirmDelete = async () => {
    if (!pageToDelete?.id || isDeleting) return;

    setIsDeleting(true);

    try {
      await customPageService.remove(pageToDelete.id);
      addToast('Página personalizada excluída com sucesso!');
      await loadItems();

      if (form.id === pageToDelete.id) {
        resetForm();
      }

      setPageToDelete(null);
    } catch (error) {
      addToast(error.message || 'Erro ao excluir página personalizada', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-custom-pages">
      <section className="admin-card">
        <div className="card-header admin-custom-pages__header">
          <div>
            <h2><LayoutTemplate size={20} /> Páginas Personalizadas</h2>
            <p>Crie landing pages pelo painel com banner, logo, textos, 3 layouts predefinidos e produtos escolhidos por você.</p>
          </div>
          <button type="button" className="btn-secondary" onClick={resetForm}>
            <PlusCircle size={16} />
            Nova página
          </button>
        </div>

        <div className="card-body">
          <form className="admin-custom-pages__form" onSubmit={handleSubmit}>
            <div className="admin-custom-pages__grid">
              <div className="form-group">
                <label>Título da página</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => handleInputChange('title', event.target.value)}
                  placeholder="Ex: Solucoes CAD/CAM Premium"
                  required
                />
              </div>

              <div className="form-group">
                <label>Slug / URL</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => handleInputChange('slug', event.target.value)}
                  placeholder="solucoes-cad-cam-premium"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Layout</label>
              <div className="admin-custom-pages__layout-list">
                {LAYOUT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`admin-custom-pages__layout-card ${form.layout_type === option.value ? 'is-active' : ''}`}
                    onClick={() => handleInputChange('layout_type', option.value)}
                  >
                    <strong>{option.title}</strong>
                    <span>{option.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Descrição principal</label>
              <textarea
                rows="4"
                value={form.description}
                onChange={(event) => handleInputChange('description', event.target.value)}
                placeholder="Texto principal da página"
              />
            </div>

            <div className="form-group">
              <label>Subdescrição</label>
              <textarea
                rows="3"
                value={form.sub_description}
                onChange={(event) => handleInputChange('sub_description', event.target.value)}
                placeholder="Texto complementar abaixo da descrição principal"
              />
            </div>

            <section className="admin-custom-pages__section-block">
              <div className="admin-custom-pages__section-heading">
                <h3>Mídia da página</h3>
                <p>Configure banner e logo em uma área separada antes de montar os produtos.</p>
              </div>

              <div className="admin-custom-pages__grid">
                <div className="form-group">
                  <label>Banner</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleFileChange('banner', event.target.files?.[0])}
                    />
                    <UploadCloud size={28} color="var(--admin-primary)" />
                    <p>Enviar banner da página</p>
                  </div>
                  {form.bannerPreview && (
                    <div className="admin-custom-pages__media-preview">
                      <button
                        type="button"
                        className="admin-custom-pages__remove-media"
                        onClick={() => handleRemoveFile('banner')}
                        aria-label="Remover banner"
                      >
                        <X size={16} />
                      </button>
                      <img src={form.bannerPreview} alt="Banner da página" />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Logo</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleFileChange('logo', event.target.files?.[0])}
                    />
                    <UploadCloud size={28} color="var(--admin-primary)" />
                    <p>Enviar logo da página</p>
                  </div>
                  {form.logoPreview && (
                    <div className="admin-custom-pages__media-preview admin-custom-pages__media-preview--logo">
                      <button
                        type="button"
                        className="admin-custom-pages__remove-media"
                        onClick={() => handleRemoveFile('logo')}
                        aria-label="Remover logo"
                      >
                        <X size={16} />
                      </button>
                      <img src={form.logoPreview} alt="Logo da página" />
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="form-group">
              <label>Produtos da página</label>
              <div className="admin-custom-pages__products-shell">
                <div className="admin-custom-pages__products-toolbar">
                  <div className="admin-custom-pages__products-toolbar-copy">
                    <strong>{form.product_ids.length} produto(s) selecionado(s)</strong>
                    <span>Escolha livremente qualquer item do catálogo para montar a página.</span>
                  </div>
                  <div className="admin-custom-pages__products-toolbar-meta">
                    <span>{filteredProducts.length} resultado(s)</span>
                  </div>
                </div>

                <div className="admin-custom-pages__products-filter">
                  <input
                    type="text"
                    value={productFilter}
                    onChange={(event) => setProductFilter(event.target.value)}
                    placeholder="Filtrar por produto, categoria ou subcategoria"
                  />
                </div>

                <div className="admin-custom-pages__products">
                {filteredProducts.map((product) => (
                  <label key={product.id} className={`admin-custom-pages__product-item ${form.product_ids.includes(product.id) ? 'is-selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={form.product_ids.includes(product.id)}
                      onChange={() => handleProductToggle(product.id)}
                    />
                    <div className="admin-custom-pages__product-thumb-frame">
                      <img
                        className="admin-custom-pages__product-thumb"
                        src={product.main_image ? apiAssetPath(product.main_image) : assetPath('img/placeholder.webp')}
                        alt={product.name}
                      />
                    </div>
                    <div className="admin-custom-pages__product-meta">
                      <span>{product.name}</span>
                      {product.is_active === false && <small>Produto inativo</small>}
                    </div>
                  </label>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="admin-custom-pages__products-empty">
                    Nenhum produto encontrado com esse filtro.
                  </div>
                )}
                </div>
              </div>
            </div>

            <label className="admin-custom-pages__status-toggle">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => handleInputChange('is_active', event.target.checked)}
              />
              <span>Página ativa e publicada</span>
            </label>

            <div className="admin-custom-pages__actions">
              <button type="submit" className="btn-primary" disabled={isSaving}>
                <Save size={16} />
                {isSaving ? 'Salvando...' : form.id ? 'Atualizar página' : 'Criar página'}
              </button>

              {form.id && (
                <button type="button" className="btn-secondary" onClick={handleDelete} disabled={isDeleting}>
                  <Trash2 size={16} />
                  {isDeleting ? 'Excluindo...' : 'Excluir página'}
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="admin-card">
        <div className="card-header admin-custom-pages__saved-header">
          <div>
            <h2><Eye size={20} /> Páginas cadastradas</h2>
            <p>Edite uma página existente ou copie a URL pública para compartilhar.</p>
          </div>

          {!isLoading && items.length > 0 && (
            <div className="admin-custom-pages__saved-filter">
              <input
                type="text"
                value={savedPagesFilter}
                onChange={(event) => setSavedPagesFilter(event.target.value)}
                placeholder="Buscar página por nome ou slug"
              />
            </div>
          )}
        </div>

        <div className="card-body">
          {isLoading ? (
            <div className="loading-container">Carregando páginas personalizadas...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">Nenhuma página personalizada cadastrada ainda.</div>
          ) : (
            <>
              <div className="admin-custom-pages__list">
              {filteredItems.length === 0 ? (
                <div className="admin-custom-pages__products-empty">
                  Nenhuma página encontrada com esse filtro.
                </div>
              ) : filteredItems.map((item) => (
                <article key={item.id} className="admin-custom-pages__list-item">
                  <button
                    type="button"
                    className="admin-custom-pages__list-remove"
                    onClick={() => handleDeleteItem(item)}
                    disabled={isDeleting}
                    aria-label={`Excluir página ${item.title}`}
                    title="Excluir página"
                  >
                    <X size={16} />
                  </button>

                  <div>
                    <strong>{item.title}</strong>
                    <span>/pagina/{item.slug}</span>
                    <small>{LAYOUT_OPTIONS.find((option) => option.value === item.layout_type)?.title || 'Layout'}</small>
                  </div>

                  <div className="admin-custom-pages__list-actions">
                    <button type="button" className="btn-secondary" onClick={() => handleEdit(item)}>
                      <Pencil size={16} />
                      Editar
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => handleCopyLink(item.slug)}>
                      <Copy size={16} />
                      Copiar link
                    </button>
                    <a
                      className="btn-primary admin-custom-pages__preview-link"
                      href={buildPublicPageUrl(item.slug)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Eye size={16} />
                      Ver página
                    </a>
                  </div>
                </article>
              ))}
              </div>
            </>
          )}
        </div>
      </section>

      <AnimatePresence>
        {pageToDelete && (
          <div className="modal-overlay" onClick={() => !isDeleting && setPageToDelete(null)}>
            <motion.div
              className="modal-content"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-body">
                <div className="modal-icon">
                  <AlertCircle size={32} />
                </div>
                <h3>Excluir página?</h3>
                <p>
                  Deseja remover a página personalizada "{pageToDelete.title}"? Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setPageToDelete(null)} disabled={isDeleting}>
                  Cancelar
                </button>
                <button className="btn-primary admin-danger-button" onClick={confirmDelete} disabled={isDeleting}>
                  {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCustomPages;
