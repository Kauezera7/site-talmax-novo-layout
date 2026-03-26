import React, { useState, useEffect } from 'react';
import { Save, UploadCloud } from 'lucide-react';
import { apiAssetPath } from '../../../utils/assets';

const initialFormState = {
  title: '',
  link_url: '',
  display_order: 0,
  active: true,
  image: null
};

const ButtonSavingIndicator = () => (
  <span className="loader loader_bubble admin-button-loader" aria-hidden="true" />
);

const BannerForm = ({ initialData, onSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        link_url: initialData.link_url || '',
        display_order: initialData.display_order ?? 0,
        active: Boolean(initialData.active),
        image: null
      });
      setPreview(initialData.image_url ? apiAssetPath(initialData.image_url) : null);
      return;
    }

    setFormData(initialFormState);
    setPreview(null);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const data = new FormData();
    data.append('title', formData.title);
    data.append('link_url', formData.link_url);
    data.append('display_order', formData.display_order);
    data.append('active', formData.active);
    if (formData.image) data.append('image', formData.image);

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body banner-form-body">
        <div className="form-group">
          <label>Imagem do Banner (Recomendado: 1920x600px)</label>
          <div className="file-upload-area banner-upload-area">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFormData({ ...formData, image: file });
                  setPreview(URL.createObjectURL(file));
                }
              }}
            />
            <UploadCloud size={32} color="var(--admin-primary)" />
            <p>Clique ou arraste a imagem do banner</p>
          </div>
          {preview && (
            <div className="banner-preview-large">
              <img src={preview} alt="Preview Banner" className="banner-preview-image" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Titulo / Texto do Banner (Opcional)</label>
          <input
            type="text"
            placeholder="Ex: Lancamento Nova Frizadora"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>URL de Destino (Ao clicar no banner)</label>
          <input
            type="text"
            placeholder="Ex: /produtos/frizadora-digital"
            value={formData.link_url}
            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
          />
        </div>

        <div className="banner-form-grid">
          <div className="form-group">
            <label>Ordem de Exibicao</label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
            />
          </div>
          <div className="form-group banner-active-group">
            <input
              type="checkbox"
              id="bannerActive"
              className="banner-active-checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            <label htmlFor="bannerActive" style={{ marginBottom: 0, fontWeight: 600 }}>Banner ativo</label>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <ButtonSavingIndicator /> : <Save size={18} />}
          {isSubmitting ? 'Salvando' : (initialData ? 'Salvar alteracoes' : 'Criar banner')}
        </button>
      </div>
    </form>
  );
};

export default BannerForm;
