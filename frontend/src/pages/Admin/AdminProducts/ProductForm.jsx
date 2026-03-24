import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Save, X, UploadCloud, ChevronRight, CheckCircle
} from 'lucide-react';
import './AdminProducts.css';

const createInitialFormState = () => ({
  name: '',
  category_ids: [],
  sub_category_ids: [],
  description: '',
  descriptionAsList: false,
  showFeatures: false,
  hideModelData: false,
  showModelSection: true,
  images: [],
  features: [''],
  modelTitle: '',
  modelTable: { headers: ['Tipo / Referencia', 'Codigo'], rows: [['', '']] }
});

const ProductForm = ({
  initialData,
  categories,
  mainCategories,
  subCategories,
  onSubmit,
  onCancel,
  isSubmitting = false,
  onValidationError
}) => {
  const [formData, setFormData] = useState(createInitialFormState);
  const [previews, setPreviews] = useState([]);
  const [primaryPreview, setPrimaryPreview] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSubCategoryDropdownOpen, setIsSubCategoryDropdownOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      let extra = {};
      try {
        extra = typeof initialData.extra_data === 'string' ? JSON.parse(initialData.extra_data) : (initialData.extra_data || {});
      } catch (e) {
        extra = {};
      }

      const allIds = Array.isArray(initialData.category_ids) ? initialData.category_ids : [];
      const selectedCatIds = [];
      const selectedSubIds = [];

      allIds.forEach((id) => {
        const cat = categories.find((c) => c.id === id);
        if (cat) {
          if (!cat.parent_id) selectedCatIds.push(id);
          else selectedSubIds.push(id);
        }
      });

      setFormData({
        name: initialData.name || '',
        category_ids: selectedCatIds,
        sub_category_ids: selectedSubIds,
        description: initialData.description || '',
        descriptionAsList: extra.descriptionAsList || false,
        showFeatures: extra.showFeatures !== false && Boolean(extra.features && extra.features.length > 0),
        hideModelData: extra.hideModelData || false,
        showModelSection: extra.showModelSection !== false,
        images: [],
        features: (extra.features && extra.features.length > 0) ? extra.features : [''],
        modelTitle: extra.modelTitle || '',
        modelTable: extra.modelTable || { headers: ['Tipo / Referência', 'Código'], rows: [['', '']] }
      });

      if (extra.images && extra.images.length > 0) {
        setPreviews(extra.images);
        setPrimaryPreview(initialData.main_image || extra.images[0]);
      } else if (initialData.main_image) {
        setPreviews([initialData.main_image]);
        setPrimaryPreview(initialData.main_image);
      } else {
        setPrimaryPreview('');
      }
      return;
    }

    setFormData(createInitialFormState());
    setPreviews([]);
    setPrimaryPreview('');
  }, [initialData, categories]);

  const getFilteredSubCategories = () => {
    if (formData.category_ids.length === 0) return [];
    return subCategories.filter((s) => formData.category_ids.includes(Number(s.parent_id)));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setFormData((current) => ({ ...current, images: [...current.images, ...files] }));
    setPreviews((current) => [...current, ...newPreviews]);

    if (!primaryPreview && previews.length === 0) {
      setPrimaryPreview(newPreviews[0]);
    }
  };

  const removeImage = (index) => {
    const previewToRemove = previews[index];
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);

    if (previewToRemove?.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRemove);
    }

    if (previewToRemove?.startsWith('blob:')) {
      const blobIndex = previews
        .slice(0, index)
        .filter((preview) => preview.startsWith('blob:'))
        .length;

      setFormData((current) => ({
        ...current,
        images: current.images.filter((_, fileIndex) => fileIndex !== blobIndex)
      }));
    }

    if (primaryPreview === previewToRemove) {
      setPrimaryPreview(newPreviews[0] || '');
    }
  };

  const addTableHeader = () => {
    const newHeaders = [...formData.modelTable.headers, 'Nova Coluna'];
    const newRows = formData.modelTable.rows.map((row) => [...row, '']);
    setFormData({ ...formData, modelTable: { headers: newHeaders, rows: newRows } });
  };

  const removeTableHeader = (index) => {
    if (formData.modelTable.headers.length <= 1) return;
    const newHeaders = formData.modelTable.headers.filter((_, i) => i !== index);
    const newRows = formData.modelTable.rows.map((row) => row.filter((_, i) => i !== index));
    setFormData({ ...formData, modelTable: { headers: newHeaders, rows: newRows } });
  };

  const updateTableHeader = (index, value) => {
    const newHeaders = [...formData.modelTable.headers];
    newHeaders[index] = value;
    setFormData({ ...formData, modelTable: { ...formData.modelTable, headers: newHeaders } });
  };

  const addTableRow = () => {
    const newRow = new Array(formData.modelTable.headers.length).fill('');
    setFormData({ ...formData, modelTable: { ...formData.modelTable, rows: [...formData.modelTable.rows, newRow] } });
  };

  const removeTableRow = (index) => {
    if (formData.modelTable.rows.length <= 1) return;
    const newRows = formData.modelTable.rows.filter((_, i) => i !== index);
    setFormData({ ...formData, modelTable: { ...formData.modelTable, rows: newRows } });
  };

  const updateTableCell = (rowIndex, colIndex, value) => {
    const newRows = [...formData.modelTable.rows];
    newRows[rowIndex][colIndex] = value;
    setFormData({ ...formData, modelTable: { ...formData.modelTable, rows: newRows } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (formData.category_ids.length === 0) {
      onValidationError?.('Selecione pelo menos uma categoria principal antes de salvar o produto.');
      return;
    }

    if (previews.length === 0) {
      onValidationError?.('Adicione pelo menos uma foto antes de salvar o produto.');
      return;
    }

    const primaryImageIndex = previews.findIndex((preview) => preview === primaryPreview);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('primary_image_index', String(primaryImageIndex >= 0 ? primaryImageIndex : 0));

    const combinedCategoryIds = [...formData.category_ids, ...formData.sub_category_ids];
    data.append('category_ids', JSON.stringify(combinedCategoryIds));

    const extraData = {
      descriptionAsList: formData.descriptionAsList,
      showFeatures: formData.showFeatures,
      hideModelData: formData.hideModelData,
      showModelSection: formData.showModelSection,
      features: formData.showFeatures ? formData.features.filter((f) => f.trim() !== '') : [],
      modelTitle: formData.modelTitle,
      modelTable: formData.modelTable,
      images: previews.filter((p) => !p.startsWith('blob:'))
    };
    data.append('extra_data', JSON.stringify(extraData));

    formData.images.forEach((img) => {
      data.append('images', img);
    });

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-section-group">
        <span className="section-label">1. Informações Básicas</span>
        <div className="form-group">
          <label>Nome Comercial</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Categorias Principais</label>
          {formData.category_ids.length === 0 && (
            <p className="product-form-helper">
              Selecione pelo menos uma categoria principal para o produto nao aparecer como sem categoria.
            </p>
          )}
          <div className="custom-multi-select">
            <div className="multi-select-header" onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}>
              <div className="selected-tags-container">
                {formData.category_ids.length > 0 ? (
                  formData.category_ids.map((id) => (
                    <span key={id} className="header-tag">
                      {mainCategories.find((c) => c.id === id)?.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, category_ids: formData.category_ids.filter((cid) => cid !== id) });
                        }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))
                ) : <span className="placeholder">Selecione...</span>}
              </div>
              <ChevronRight size={16} />
            </div>
            {isCategoryDropdownOpen && (
              <div className="multi-select-options">
                {mainCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`multi-select-option ${formData.category_ids.includes(cat.id) ? 'selected' : ''}`}
                    onClick={() => {
                      const isSelected = formData.category_ids.includes(cat.id);
                      setFormData({
                        ...formData,
                        category_ids: isSelected
                          ? formData.category_ids.filter((id) => id !== cat.id)
                          : [...formData.category_ids, cat.id]
                      });
                    }}
                  >
                    {cat.name} <CheckCircle className="check-icon" size={16} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {getFilteredSubCategories().length > 0 && (
          <div className="form-group">
            <label>Subcategorias</label>
            <div className="custom-multi-select">
              <div className="multi-select-header" onClick={() => setIsSubCategoryDropdownOpen(!isSubCategoryDropdownOpen)}>
                <div className="selected-tags-container">
                  {formData.sub_category_ids.length > 0 ? (
                    formData.sub_category_ids.map((id) => (
                      <span key={id} className="header-tag">
                        {subCategories.find((c) => c.id === id)?.name}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({ ...formData, sub_category_ids: formData.sub_category_ids.filter((sid) => sid !== id) });
                          }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  ) : <span className="placeholder">Selecione...</span>}
                </div>
                <ChevronRight size={16} />
              </div>
              {isSubCategoryDropdownOpen && (
                <div className="multi-select-options">
                  {getFilteredSubCategories().map((cat) => (
                    <div
                      key={cat.id}
                      className={`multi-select-option ${formData.sub_category_ids.includes(cat.id) ? 'selected' : ''}`}
                      onClick={() => {
                        const isSelected = formData.sub_category_ids.includes(cat.id);
                        setFormData({
                          ...formData,
                          sub_category_ids: isSelected
                            ? formData.sub_category_ids.filter((id) => id !== cat.id)
                            : [...formData.sub_category_ids, cat.id]
                        });
                      }}
                    >
                      {cat.name} <CheckCircle className="check-icon" size={16} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="admin-section-group">
        <span className="section-label">2. Descrição e Destaques</span>
        <div className="product-form-options">
          <label className="product-form-option">
            <input
              type="checkbox"
              checked={formData.descriptionAsList}
              onChange={(e) => setFormData({ ...formData, descriptionAsList: e.target.checked })}
            />
            <div>
              <strong>Exibir descrição em tópicos</strong>
              <span>Cada linha da descrição vira um item com marcador na página do produto.</span>
            </div>
          </label>

          <label className="product-form-option">
            <input
              type="checkbox"
              checked={formData.showFeatures}
              onChange={(e) => setFormData({ ...formData, showFeatures: e.target.checked })}
            />
            <div>
              <strong>Exibir destaques / diferenciais</strong>
              <span>Ative apenas se quiser mostrar tópicos extras separados da descrição.</span>
            </div>
          </label>
        </div>

        <div className="form-group">
          <label>Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={
              formData.descriptionAsList
                ? 'Escreva um item por linha para virar um tópico no site'
                : 'Descreva o produto normalmente'
            }
          />
        </div>

        <div className={`form-group ${formData.showFeatures ? '' : 'product-form-group-disabled'}`}>
          <label>Destaques / Diferenciais</label>
          {!formData.showFeatures && (
            <p className="product-form-helper">
              Ative a opção acima se quiser adicionar tópicos extras de destaque para este produto.
            </p>
          )}
          {formData.features.map((feature, index) => (
            <div key={index} className="dynamic-input-group">
              <input
                disabled={!formData.showFeatures}
                value={feature}
                onChange={(e) => {
                  const newFeatures = [...formData.features];
                  newFeatures[index] = e.target.value;
                  setFormData({ ...formData, features: newFeatures });
                }}
              />
              <button
                type="button"
                className="btn-icon delete"
                disabled={!formData.showFeatures}
                onClick={() => setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) })}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn-add"
            disabled={!formData.showFeatures}
            onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}
          >
            <Plus size={16} /> Adicionar Destaque
          </button>
        </div>
      </div>

      <div className="admin-section-group">
        <span className="section-label">3. Galeria de Fotos</span>
        <div className="file-upload-area">
          <input type="file" multiple accept="image/*" onChange={handleFileChange} />
          <UploadCloud size={40} color="var(--admin-primary)" />
          <p>Clique ou arraste fotos para o produto</p>
        </div>
        {previews.length > 0 && (
          <p className="product-form-helper">
            Escolha qual foto deve ficar como principal. Essa sera a imagem usada na listagem e no detalhe do produto.
          </p>
        )}
        <div className="admin-previews">
          {previews.map((src, idx) => (
            <div key={idx} className={`preview-thumb ${primaryPreview === src ? 'is-primary' : ''}`}>
              <img src={src} alt="Preview" />
              <button
                type="button"
                className={`preview-primary-toggle ${primaryPreview === src ? 'active' : ''}`}
                onClick={() => setPrimaryPreview(src)}
              >
                {primaryPreview === src ? 'Imagem principal' : 'Definir como principal'}
              </button>
              <button type="button" className="remove-preview" onClick={() => removeImage(idx)}><X size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-section-group">
        <span className="section-label">4. Especificações (Tabela)</span>
        <div className="product-form-options">
          <label className="product-form-option">
            <input
              type="checkbox"
              checked={formData.showModelSection}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  showModelSection: e.target.checked
                })
              }
            />
            <div>
              <strong>Exibir tabela no site</strong>
              <span>Desmarque se quiser salvar a tabela no painel, mas esconder a seção na página do produto.</span>
            </div>
          </label>

          <label className="product-form-option">
            <input
              type="checkbox"
              checked={formData.hideModelData}
              disabled={!formData.showModelSection}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hideModelData: e.target.checked
                })
              }
            />
            <div>
              <strong>Mostrar apenas o cabeçalho</strong>
              <span>Exibe só os títulos das colunas da tabela e oculta todas as linhas de dados.</span>
            </div>
          </label>
        </div>

        <div className="form-group">
          <label>Título da Tabela</label>
          <input value={formData.modelTitle} onChange={(e) => setFormData({ ...formData, modelTitle: e.target.value })} />
        </div>

        <div className={`table-builder-container ${formData.showModelSection ? '' : 'product-form-group-disabled'}`}>
          <table className="builder-table">
            <thead>
              <tr>
                {formData.modelTable.headers.map((header, hIdx) => (
                  <th key={hIdx}>
                    <div>
                      <input disabled={!formData.showModelSection} value={header} onChange={(e) => updateTableHeader(hIdx, e.target.value)} />
                      <button disabled={!formData.showModelSection} type="button" className="table-remove-button" onClick={() => removeTableHeader(hIdx)}><X size={14} /></button>
                    </div>
                  </th>
                ))}
                <th><button disabled={!formData.showModelSection} type="button" className="btn-add" onClick={addTableHeader}><Plus size={14} /></button></th>
              </tr>
            </thead>
            {!formData.hideModelData && (
              <tbody>
                {formData.modelTable.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>
                        <input disabled={!formData.showModelSection} value={cell} onChange={(e) => updateTableCell(rIdx, cIdx, e.target.value)} />
                      </td>
                    ))}
                    <td><button disabled={!formData.showModelSection} type="button" className="btn-icon delete" onClick={() => removeTableRow(rIdx)}><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          {formData.hideModelData ? (
            <p className="product-form-helper">
              As linhas ficaram ocultas no painel porque esta tabela esta configurada para mostrar apenas o cabecalho no site.
            </p>
          ) : (
            <button disabled={!formData.showModelSection} type="button" className="btn-add" onClick={addTableRow}><Plus size={16} /> Nova Linha</button>
          )}
        </div>
      </div>

      <div className="product-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>Cancelar</button>
        <button type="submit" className="btn-primary product-submit-button" disabled={isSubmitting}>
          <Save size={20} /> {isSubmitting ? 'SALVANDO PRODUTO...' : 'FINALIZAR E SALVAR PRODUTO'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
