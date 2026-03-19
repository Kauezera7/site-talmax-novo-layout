import React, { useState, useEffect } from 'react';
import { Save, X, UploadCloud } from 'lucide-react';

const BannerForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    link_url: '',
    display_order: 0,
    active: true,
    image: null
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        link_url: initialData.link_url || '',
        display_order: initialData.display_order || 0,
        active: initialData.active !== 0,
        image: null
      });
      setPreview(initialData.image_url);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
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
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
        <div className="form-group">
          <label>Imagem do Banner (Recomendado: 1920x600px)</label>
          <div className="file-upload-area" style={{ padding: '20px' }}>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFormData({...formData, image: file});
                  setPreview(URL.createObjectURL(file));
                }
              }}
            />
            <UploadCloud size={32} color="var(--admin-primary)" />
            <p>Clique ou arraste a imagem do banner</p>
          </div>
          {preview && (
            <div className="banner-preview-large" style={{ marginTop: '10px', width: '100%', height: '150px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
              <img src={preview} alt="Preview Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Título / Texto do Banner (Opcional)</label>
          <input 
            type="text" 
            placeholder="Ex: Lançamento Nova Frizadora"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>URL de Destino (Ao clicar no banner)</label>
          <input 
            type="text" 
            placeholder="Ex: /produtos/frizadora-digital"
            value={formData.link_url}
            onChange={(e) => setFormData({...formData, link_url: e.target.value})}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label>Ordem de Exibição</label>
            <input 
              type="number" 
              value={formData.display_order}
              onChange={(e) => setFormData({...formData, display_order: e.target.value})}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '25px' }}>
            <input 
              type="checkbox" 
              id="bannerActive"
              style={{ width: '20px', height: '20px' }}
              checked={formData.active}
              onChange={(e) => setFormData({...formData, active: e.target.checked})}
            />
            <label htmlFor="bannerActive" style={{ marginBottom: 0, fontWeight: 600 }}>Banner Ativo</label>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">
          <Save size={18} /> {initialData ? 'Salvar Alterações' : 'Criar Banner'}
        </button>
      </div>
    </form>
  );
};

export default BannerForm;
