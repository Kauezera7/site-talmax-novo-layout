import React, { useState, useEffect } from 'react';
import { Save, X, UploadCloud } from 'lucide-react';
import customPageService from '../../../services/customPageService';
import digitalGroupService from '../../../services/digitalGroupService';
import { apiAssetPath } from '../../../utils/assets';

const ButtonSavingIndicator = () => (
  <span className="loader loader_bubble admin-button-loader" aria-hidden="true" />
);

const SegmentForm = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    link_url: '',
    custom_page_id: null,
    digital_group_id: null,
    display_order: 0,
    active: true
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [customPageOptions, setCustomPageOptions] = useState([]);
  const [digitalGroupOptions, setDigitalGroupOptions] = useState([]);
  const [isUrlPickerOpen, setIsUrlPickerOpen] = useState(false);
  const [isLinkTypePickerOpen, setIsLinkTypePickerOpen] = useState(false);
  const [linkTargetType, setLinkTargetType] = useState('custom-page');

  useEffect(() => {
    let isMounted = true;

    const loadLinkOptions = async () => {
      try {
        const [customPages, digitalGroups] = await Promise.all([
          customPageService.getAll(),
          digitalGroupService.getAll({ admin: true })
        ]);
        if (!isMounted) return;

        setCustomPageOptions(
          Array.isArray(customPages)
            ? customPages
                .filter((item) => item?.slug)
                .map((item) => ({
                  id: item.id,
                  title: item.title || `Pagina ${item.id}`,
                  path: `/pagina/${item.slug}`
                }))
            : []
        );
        setDigitalGroupOptions(
          Array.isArray(digitalGroups)
            ? digitalGroups.map((item) => ({
                id: item.id,
                title: item.title || item.hero_title || `Grupo ${item.id}`,
                path: `/grupo-digital/${item.slug || item.id}`
              }))
            : []
        );
      } catch (error) {
        if (isMounted) {
          setCustomPageOptions([]);
          setDigitalGroupOptions([]);
        }
      }
    };

    loadLinkOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        link_url: initialData.link_url || '',
        custom_page_id: initialData.custom_page_id || null,
        digital_group_id: initialData.digital_group_id || null,
        display_order: initialData.display_order || 0,
        active: !!initialData.active
      });

      if (initialData.image_url) {
        setImagePreview(apiAssetPath(initialData.image_url));
      } else {
        setImagePreview(null);
      }
      setImageFile(null);
      setLinkTargetType(
        initialData.link_target_type === 'digital-group' || String(initialData.link_url || '').startsWith('/grupo-digital/')
          ? 'digital-group'
          : 'custom-page'
      );
      return;
    }

    setFormData({
      name: '',
      description: '',
      link_url: '',
      custom_page_id: null,
      digital_group_id: null,
      display_order: 0,
      active: true
    });
    setImageFile(null);
    setImagePreview(null);
    setLinkTargetType('custom-page');
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'link_url'
        ? {
            custom_page_id: null,
            digital_group_id: null
          }
        : {})
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('link_url', formData.link_url);
    data.append('link_target_type', linkTargetType);
    data.append('custom_page_id', String(formData.custom_page_id || ''));
    data.append('digital_group_id', String(formData.digital_group_id || ''));
    data.append('is_external', 'false');
    data.append('display_order', String(formData.display_order));
    data.append('active', String(formData.active));
    data.append('actions', JSON.stringify(initialData?.actions || []));

    if (imageFile) {
      data.append('image', imageFile);
    } else if (initialData?.image_url) {
      data.append('image_url', initialData.image_url);
    }

    onSubmit(data);
  };

  const getFilteredLinkOptions = () => {
    const normalizedFilter = String(formData.link_url || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    const sourceOptions = linkTargetType === 'digital-group'
      ? digitalGroupOptions
      : customPageOptions;

    if (!normalizedFilter) {
      return sourceOptions;
    }

    return sourceOptions.filter((item) => (
      `${item.title} ${item.path}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .includes(normalizedFilter)
    ));
  };

  const getLinkTargetTypeLabel = () => (
    linkTargetType === 'digital-group' ? 'Grupo de Segmentos' : 'Página Personalizada'
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div className="form-group">
          <label>Nome do Segmento</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Ex: Talmax Digital"
          />
        </div>

        <div className="form-group">
          <label>Descrição</label>
          <textarea
            className="admin-segments__description-field"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            placeholder="Breve descrição do segmento..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
          <div className="form-group" style={{ maxWidth: '320px' }}>
            <label>Tipo de vinculo</label>
            <div className="admin-segments__url-picker">
              <input
                type="text"
                value={getLinkTargetTypeLabel()}
                readOnly
                onFocus={() => setIsLinkTypePickerOpen(true)}
                onBlur={() => {
                  window.setTimeout(() => {
                    setIsLinkTypePickerOpen(false);
                  }, 120);
                }}
              />

              {isLinkTypePickerOpen && (
                <div className="admin-segments__url-picker-panel">
                  <button
                    type="button"
                    className={`admin-segments__url-picker-option ${linkTargetType === 'custom-page' ? 'is-active' : ''}`}
                    onMouseDown={() => {
                      setLinkTargetType('custom-page');
                      setIsLinkTypePickerOpen(false);
                      setIsUrlPickerOpen(false);
                    }}
                  >
                    <strong>Página Personalizada</strong>
                    <span>Mostra apenas as páginas personalizadas no dropdown de URL.</span>
                  </button>

                  <button
                    type="button"
                    className={`admin-segments__url-picker-option ${linkTargetType === 'digital-group' ? 'is-active' : ''}`}
                    onMouseDown={() => {
                      setLinkTargetType('digital-group');
                      setIsLinkTypePickerOpen(false);
                      setIsUrlPickerOpen(false);
                    }}
                  >
                    <strong>Grupo de Segmentos</strong>
                    <span>Mostra apenas os grupos de segmentos no dropdown de URL.</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Link Principal (URL)</label>
            <div className="admin-segments__url-picker">
              <input
                type="text"
                name="link_url"
                value={formData.link_url}
                onFocus={() => setIsUrlPickerOpen(true)}
                onBlur={() => {
                  window.setTimeout(() => {
                    setIsUrlPickerOpen(false);
                  }, 120);
                }}
                onChange={handleInputChange}
                placeholder="Clique para buscar ou preencha manualmente"
              />

              {isUrlPickerOpen && (
                <div className="admin-segments__url-picker-panel">
                  <div className="admin-segments__url-picker-note">
                    Digite para filtrar {linkTargetType === 'digital-group' ? 'os grupos de segmentos' : 'as páginas personalizadas'} ou mantenha uma URL manual.
                  </div>

                  {getFilteredLinkOptions().length === 0 ? (
                    <div className="admin-segments__url-picker-empty">
                      Nenhum item encontrado.
                    </div>
                  ) : (
                    getFilteredLinkOptions().map((item) => (
                      <button
                        key={`${linkTargetType}-${item.id}`}
                        type="button"
                        className={`admin-segments__url-picker-option ${formData.link_url === item.path ? 'is-active' : ''}`}
                        onMouseDown={() => {
                          setFormData((prev) => ({
                            ...prev,
                            link_url: item.path,
                            custom_page_id: linkTargetType === 'custom-page' ? item.id : null,
                            digital_group_id: linkTargetType === 'digital-group' ? item.id : null
                          }));
                          setIsUrlPickerOpen(false);
                        }}
                      >
                        <strong>{item.title}</strong>
                        <span>{item.path}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Ordem</label>
            <input
              type="number"
              name="display_order"
              value={formData.display_order}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Imagem de Fundo</label>
          <div className="file-upload-area" style={{ padding: '15px' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <UploadCloud size={32} color="var(--admin-primary)" style={{ marginBottom: '5px' }} />
            <p style={{ fontSize: '0.85rem' }}>Clique para enviar a imagem</p>
          </div>

          {imagePreview && (
            <div className="preview-thumb" style={{ marginTop: '10px', width: '120px', height: '60px' }}>
              <img src={imagePreview} alt="Preview" />
              <button
                type="button"
                className="remove-preview"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <ButtonSavingIndicator /> : <Save size={18} />}
          {isSubmitting ? 'Salvando' : (initialData ? 'Salvar alterações' : 'Criar segmento')}
        </button>
      </div>
    </form>
  );
};

export default SegmentForm;
