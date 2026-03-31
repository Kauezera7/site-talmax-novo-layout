import React, { useState, useEffect } from 'react';
import { Save, X, UploadCloud } from 'lucide-react';
import { apiAssetPath } from '../../../utils/assets';

const ButtonSavingIndicator = () => (
  <span className="loader loader_bubble admin-button-loader" aria-hidden="true" />
);

const SegmentForm = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    link_url: '',
    display_order: 0,
    active: true
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        link_url: initialData.link_url || '',
        display_order: initialData.display_order || 0,
        active: !!initialData.active
      });

      if (initialData.image_url) {
        setImagePreview(apiAssetPath(initialData.image_url));
      } else {
        setImagePreview(null);
      }
      setImageFile(null);
      return;
    }

    setFormData({
      name: '',
      description: '',
      link_url: '',
      display_order: 0,
      active: true
    });
    setImageFile(null);
    setImagePreview(null);
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
          <label>Descricao</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="2"
            placeholder="Breve descricao do segmento..."
            style={{ minHeight: '80px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label>Link Principal (URL)</label>
            <input
              type="text"
              name="link_url"
              value={formData.link_url}
              onChange={handleInputChange}
              placeholder="Ex: /categoria/talmax-digital"
            />
          </div>

          <div className="form-group">
            <label>Ordem</label>
            <input
              type="number"
              name="display_order"
              value={formData.display_order}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div className="form-group" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
            <input
              type="checkbox"
              id="active"
              name="active"
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              checked={formData.active}
              onChange={handleInputChange}
            />
            <label htmlFor="active" style={{ marginBottom: 0, cursor: 'pointer', fontWeight: 600 }}>Ativo?</label>
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
          {isSubmitting ? 'Salvando' : (initialData ? 'Salvar alteracoes' : 'Criar segmento')}
        </button>
      </div>
    </form>
  );
};

export default SegmentForm;
