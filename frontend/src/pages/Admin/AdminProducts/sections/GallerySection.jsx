import React from 'react';
import { UploadCloud, X } from 'lucide-react';
import { apiAssetPath } from '../../../../utils/assets';

const GallerySection = ({
  previews,
  primaryPreview,
  setPrimaryPreview,
  handleFileChange,
  removeImage
}) => (
  <div className="admin-section-group">
    <span className="section-label">3. Galeria de Fotos</span>

    <div className="file-upload-area">
      <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange} />
      <UploadCloud size={40} color="var(--admin-primary)" />
      <p>Clique ou arraste fotos para o produto</p>
    </div>

    {previews.length > 0 && (
      <p className="product-form-helper">
        Escolha qual foto deve ficar como principal. Essa sera a imagem usada na listagem e no detalhe do produto.
      </p>
    )}

    <div className="admin-previews">
      {previews.map((src, index) => (
        <div key={index} className={`preview-thumb ${primaryPreview === src ? 'is-primary' : ''}`}>
          <img src={src.startsWith('blob:') ? src : apiAssetPath(src)} alt="Preview" />
          <button
            type="button"
            className={`preview-primary-toggle ${primaryPreview === src ? 'active' : ''}`}
            onClick={() => setPrimaryPreview(src)}
          >
            {primaryPreview === src ? 'Imagem principal' : 'Definir como principal'}
          </button>
          <button type="button" className="remove-preview" onClick={() => removeImage(index)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default GallerySection;
