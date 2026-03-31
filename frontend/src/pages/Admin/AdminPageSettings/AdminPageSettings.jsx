import React, { useEffect, useState } from 'react';
import { Save, UploadCloud, FileText } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';
import pageSettingsService, { normalizeSpecialPageSettings } from '../../../services/pageSettingsService';
import { apiAssetPath } from '../../../utils/assets';
import './AdminPageSettings.css';

const PAGE_ORDER = ['talmax-digital', 'upcera', 'scanners', 'printers'];

const buildFormsState = (settingsMap) => (
  PAGE_ORDER.reduce((accumulator, pageKey) => {
    const setting = settingsMap[pageKey];

    accumulator[pageKey] = {
      ...setting,
      logoFile: null,
      logoPreview: setting.logo_url ? apiAssetPath(setting.logo_url) : null
    };

    return accumulator;
  }, {})
);

const ButtonSavingIndicator = () => (
  <span className="loader loader_bubble admin-button-loader" aria-hidden="true" />
);

const AdminPageSettings = () => {
  const { addToast } = useAdmin();
  const [forms, setForms] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingPageKey, setSavingPageKey] = useState(null);

  const loadSettings = async () => {
    setIsLoading(true);

    try {
      const items = await pageSettingsService.getAll();
      const normalizedMap = normalizeSpecialPageSettings(items);
      setForms(buildFormsState(normalizedMap));
    } catch (error) {
      console.error('Erro ao carregar configuracoes das paginas especiais:', error);
      addToast(error.message || 'Erro ao carregar configuracoes das paginas especiais', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleInputChange = (pageKey, field, value) => {
    setForms((current) => ({
      ...current,
      [pageKey]: {
        ...current[pageKey],
        [field]: value
      }
    }));
  };

  const handleLogoChange = (pageKey, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForms((current) => ({
        ...current,
        [pageKey]: {
          ...current[pageKey],
          logoFile: file,
          logoPreview: reader.result
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = (pageKey) => {
    setForms((current) => ({
      ...current,
      [pageKey]: {
        ...current[pageKey],
        logo_url: '',
        logoFile: null,
        logoPreview: null
      }
    }));
  };

  const handleSave = async (pageKey) => {
    const currentForm = forms[pageKey];

    if (!currentForm || savingPageKey) return;

    setSavingPageKey(pageKey);

    try {
      const formData = new FormData();
      formData.append('overline', currentForm.overline || '');
      formData.append('title', currentForm.title || '');
      formData.append('description', currentForm.description || '');
      formData.append('logo_url', currentForm.logo_url || '');

      if (currentForm.logoFile) {
        formData.append('logo', currentForm.logoFile);
      }

      await pageSettingsService.update(pageKey, formData);
      addToast(`Cabecalho de ${currentForm.label} atualizado com sucesso!`);
      await loadSettings();
    } catch (error) {
      console.error('Erro ao salvar configuracao da pagina especial:', error);
      addToast(error.message || 'Erro ao salvar configuracao da pagina especial', 'error');
    } finally {
      setSavingPageKey(null);
    }
  };

  if (isLoading) {
    return <div className="loading-container">Carregando configuracoes das paginas especiais...</div>;
  }

  return (
    <div className="admin-page-settings">
      <div className="admin-card">
        <div className="card-header admin-page-settings__header">
          <div>
            <h2><FileText size={20} /> Paginas Especiais</h2>
            <p>Edite logo, titulo e texto das paginas Talmax Digital, Upcera, Scanners e Impressoras 3D.</p>
          </div>
        </div>

        <div className="card-body">
          <div className="admin-page-settings__grid">
            {PAGE_ORDER.map((pageKey) => {
              const form = forms[pageKey];

              if (!form) {
                return null;
              }

              return (
                <article key={pageKey} className="admin-page-settings__card">
                  <div className="admin-page-settings__card-copy">
                    <h3>{form.label}</h3>
                    <p>Edicao do cabecalho principal da pagina.</p>
                  </div>

                  <div className="admin-page-settings__fields">
                    <div className="form-group">
                      <label>Texto Superior</label>
                      <input
                        type="text"
                        value={form.overline || ''}
                        onChange={(event) => handleInputChange(pageKey, 'overline', event.target.value)}
                        placeholder="Ex: TECNOLOGIA ODONTOLOGICA"
                      />
                    </div>

                    <div className="form-group">
                      <label>Titulo</label>
                      <input
                        type="text"
                        value={form.title || ''}
                        onChange={(event) => handleInputChange(pageKey, 'title', event.target.value)}
                        placeholder="Titulo da pagina"
                      />
                    </div>

                    <div className="form-group">
                      <label>Texto / Descricao</label>
                      <textarea
                        rows="4"
                        value={form.description || ''}
                        onChange={(event) => handleInputChange(pageKey, 'description', event.target.value)}
                        placeholder="Descricao da pagina"
                      />
                    </div>

                    <div className="form-group">
                      <label>Logo</label>
                      <div className="file-upload-area admin-page-settings__upload-area">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => handleLogoChange(pageKey, event.target.files?.[0])}
                        />
                        <UploadCloud size={28} color="var(--admin-primary)" />
                        <p>Enviar logo da pagina</p>
                      </div>

                      {form.logoPreview && (
                        <div className="admin-page-settings__preview">
                          <img src={form.logoPreview} alt={`Logo ${form.label}`} />
                          <button type="button" className="btn-secondary" onClick={() => handleRemoveLogo(pageKey)}>
                            Remover logo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-page-settings__actions">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => handleSave(pageKey)}
                      disabled={Boolean(savingPageKey)}
                    >
                      {savingPageKey === pageKey ? <ButtonSavingIndicator /> : <Save size={18} />}
                      {savingPageKey === pageKey ? 'Salvando' : `Salvar ${form.label}`}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPageSettings;
