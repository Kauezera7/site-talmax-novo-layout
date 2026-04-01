import React, { useEffect, useState } from 'react';
import { Save, UploadCloud, FileText } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';
import pageSettingsService, { normalizeSpecialPageSettings } from '../../../services/pageSettingsService';
import { apiAssetPath } from '../../../utils/assets';
import './SpecialPageSettingsForm.css';

const ButtonSavingIndicator = () => (
  <span className="loader loader_bubble admin-button-loader" aria-hidden="true" />
);

const buildFormState = (settingsMap, pageKey) => {
  const setting = settingsMap[pageKey];

  if (!setting) {
    return null;
  }

  return {
    ...setting,
    logoFile: null,
    logoPreview: setting.logo_url ? apiAssetPath(setting.logo_url) : null
  };
};

const SpecialPageSettingsForm = ({
  pageKey,
  title,
  description,
  icon: Icon = FileText
}) => {
  const { addToast } = useAdmin();
  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = async () => {
    setIsLoading(true);

    try {
      const items = await pageSettingsService.getAll();
      const normalizedMap = normalizeSpecialPageSettings(items);
      setForm(buildFormState(normalizedMap, pageKey));
    } catch (error) {
      console.error(`Erro ao carregar configuracoes da pagina ${pageKey}:`, error);
      addToast(error.message || 'Erro ao carregar configuracoes da pagina', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [pageKey]);

  const handleInputChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleLogoChange = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((current) => ({
        ...current,
        logoFile: file,
        logoPreview: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setForm((current) => ({
      ...current,
      logo_url: '',
      logoFile: null,
      logoPreview: null
    }));
  };

  const handleSave = async () => {
    if (!form || isSaving) return;

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('overline', form.overline || '');
      formData.append('title', form.title || '');
      formData.append('description', form.description || '');
      formData.append('logo_url', form.logo_url || '');

      if (form.logoFile) {
        formData.append('logo', form.logoFile);
      }

      await pageSettingsService.update(pageKey, formData);
      addToast(`Cabecalho de ${form.label} atualizado com sucesso!`);
      await loadSettings();
    } catch (error) {
      console.error(`Erro ao salvar configuracao da pagina ${pageKey}:`, error);
      addToast(error.message || 'Erro ao salvar configuracao da pagina', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="loading-container">Carregando configuracoes da pagina...</div>;
  }

  if (!form) {
    return null;
  }

  return (
    <div className="admin-card special-page-settings-form">
      <div className="card-header special-page-settings-form__header">
        <div>
          <h2><Icon size={20} /> {title || form.label}</h2>
          <p>{description || `Edite o cabecalho principal da pagina ${form.label}.`}</p>
        </div>
      </div>

      <div className="card-body">
        <article className="special-page-settings-form__card">
          <div className="special-page-settings-form__fields">
            <div className="form-group">
              <label>Texto Superior</label>
              <input
                type="text"
                value={form.overline || ''}
                onChange={(event) => handleInputChange('overline', event.target.value)}
                placeholder="Ex: TECNOLOGIA ODONTOLOGICA"
              />
            </div>

            <div className="form-group">
              <label>Titulo</label>
              <input
                type="text"
                value={form.title || ''}
                onChange={(event) => handleInputChange('title', event.target.value)}
                placeholder="Titulo da pagina"
              />
            </div>

            <div className="form-group">
              <label>Texto / Descricao</label>
              <textarea
                rows="4"
                value={form.description || ''}
                onChange={(event) => handleInputChange('description', event.target.value)}
                placeholder="Descricao da pagina"
              />
            </div>

            <div className="form-group">
              <label>Logo</label>
              <div className="file-upload-area special-page-settings-form__upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleLogoChange(event.target.files?.[0])}
                />
                <UploadCloud size={28} color="var(--admin-primary)" />
                <p>Enviar logo da pagina</p>
              </div>

              {form.logoPreview && (
                <div className="special-page-settings-form__preview">
                  <img src={form.logoPreview} alt={`Logo ${form.label}`} />
                  <button type="button" className="btn-secondary" onClick={handleRemoveLogo}>
                    Remover logo
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="special-page-settings-form__actions">
            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <ButtonSavingIndicator /> : <Save size={18} />}
              {isSaving ? 'Salvando' : `Salvar ${form.label}`}
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};

export default SpecialPageSettingsForm;
