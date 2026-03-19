import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Save, X, UploadCloud, ChevronRight, CheckCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductForm = ({ initialData, categories, mainCategories, subCategories, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category_ids: [],
    sub_category_ids: [],
    description: '',
    descriptionAsList: false,
    hideModelData: false,
    showModelSection: true,
    images: [],
    features: [''],
    modelTitle: '',
    modelTable: { headers: ['Tipo / Referência', 'Código'], rows: [['', '']] }
  });

  const [previews, setPreviews] = useState([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSubCategoryDropdownOpen, setIsSubCategoryDropdownOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      let extra = {};
      try {
        extra = typeof initialData.extra_data === 'string' ? JSON.parse(initialData.extra_data) : (initialData.extra_data || {});
      } catch(e) { extra = {}; }

      // Separar categorias e subcategorias
      const allIds = Array.isArray(initialData.category_ids) ? initialData.category_ids : [];
      const selectedCatIds = [];
      const selectedSubIds = [];

      allIds.forEach(id => {
        const cat = categories.find(c => c.id === id);
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
        hideModelData: extra.hideModelData || false,
        showModelSection: extra.showModelSection !== false,
        features: (extra.features && extra.features.length > 0) ? extra.features : [''],
        modelTitle: extra.modelTitle || '',
        modelTable: extra.modelTable || { headers: ['Tipo / Referência', 'Código'], rows: [['', '']] }
      });

      if (extra.images) setPreviews(extra.images);
      else if (initialData.main_image) setPreviews([initialData.main_image]);
    }
  }, [initialData, categories]);

  const getFilteredSubCategories = () => {
    if (formData.category_ids.length === 0) return [];
    return subCategories.filter(s => formData.category_ids.includes(Number(s.parent_id)));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, images: [...formData.images, ...files] });
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);

    // Se for um arquivo novo
    const newImages = [...formData.images];
    // Aqui tem uma lógica complexa se misturar fotos antigas e novas. 
    // No Admin original, ele enviava tudo de novo ou mantinha o que tinha.
    // Vamos simplificar: se o preview começa com blob:, é novo.
    // Mas o ideal é que o onSubmit lide com isso.
  };

  // Tabela Dinâmica
  const addTableHeader = () => {
    const newHeaders = [...formData.modelTable.headers, 'Nova Coluna'];
    const newRows = formData.modelTable.rows.map(row => [...row, '']);
    setFormData({ ...formData, modelTable: { headers: newHeaders, rows: newRows } });
  };

  const removeTableHeader = (index) => {
    if (formData.modelTable.headers.length <= 1) return;
    const newHeaders = formData.modelTable.headers.filter((_, i) => i !== index);
    const newRows = formData.modelTable.rows.map(row => row.filter((_, i) => i !== index));
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
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    
    const combinedCategoryIds = [...formData.category_ids, ...formData.sub_category_ids];
    data.append('category_ids', JSON.stringify(combinedCategoryIds));

    const extraData = {
      descriptionAsList: formData.descriptionAsList,
      hideModelData: formData.hideModelData,
      showModelSection: formData.showModelSection,
      features: formData.features.filter(f => f.trim() !== ''),
      modelTitle: formData.modelTitle,
      modelTable: formData.modelTable,
      images: previews.filter(p => !p.startsWith('blob:')) // Mantém as URLs antigas
    };
    data.append('extra_data', JSON.stringify(extraData));

    formData.images.forEach(img => {
      data.append('images', img);
    });

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      {/* SEÇÃO 1: BÁSICO */}
      <div className="admin-section-group">
        <span className="section-label">1. Informações Básicas</span>
        <div className="form-group">
          <label>Nome Comercial</label>
          <input 
            type="text" required 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Categorias Principais</label>
          <div className="custom-multi-select">
            <div className="multi-select-header" onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}>
              <div className="selected-tags-container">
                {formData.category_ids.length > 0 ? (
                  formData.category_ids.map(id => (
                    <span key={id} className="header-tag">
                      {mainCategories.find(c => c.id === id)?.name}
                      <button type="button" onClick={(e) => {
                        e.stopPropagation();
                        setFormData({...formData, category_ids: formData.category_ids.filter(cid => cid !== id)});
                      }}><X size={12} /></button>
                    </span>
                  ))
                ) : <span className="placeholder">Selecione...</span>}
              </div>
              <ChevronRight size={16} />
            </div>
            {isCategoryDropdownOpen && (
              <div className="multi-select-options">
                {mainCategories.map(cat => (
                  <div key={cat.id} className={`multi-select-option ${formData.category_ids.includes(cat.id) ? 'selected' : ''}`} onClick={() => {
                    const isSelected = formData.category_ids.includes(cat.id);
                    setFormData({...formData, category_ids: isSelected ? formData.category_ids.filter(id => id !== cat.id) : [...formData.category_ids, cat.id]});
                  }}>
                    {cat.name} <CheckCircle className="check-icon" size={16} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: DESCRIÇÃO */}
      <div className="admin-section-group">
        <span className="section-label">2. Descrição e Destaques</span>
        <div className="form-group">
          <label>Descrição</label>
          <textarea 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>
        <div style={{marginTop: '10px'}}>
          <label>Destaques / Diferenciais</label>
          {formData.features.map((feature, index) => (
            <div key={index} className="dynamic-input-group">
              <input 
                value={feature}
                onChange={(e) => {
                  const newFeatures = [...formData.features];
                  newFeatures[index] = e.target.value;
                  setFormData({...formData, features: newFeatures});
                }}
              />
              <button type="button" className="btn-icon delete" onClick={() => setFormData({...formData, features: formData.features.filter((_, i) => i !== index)})}><Trash2 size={18}/></button>
            </div>
          ))}
          <button type="button" className="btn-add" onClick={() => setFormData({...formData, features: [...formData.features, '']})}><Plus size={16}/> Adicionar Destaque</button>
        </div>
      </div>

      {/* SEÇÃO 3: MÍDIA */}
      <div className="admin-section-group">
        <span className="section-label">3. Galeria de Fotos</span>
        <div className="file-upload-area">
          <input type="file" multiple accept="image/*" onChange={handleFileChange} />
          <UploadCloud size={40} color="var(--admin-primary)" />
          <p>Clique ou arraste fotos para o produto</p>
        </div>
        <div className="admin-previews">
          {previews.map((src, idx) => (
            <div key={idx} className="preview-thumb">
              <img src={src} alt="Preview" />
              <button type="button" className="remove-preview" onClick={() => removeImage(idx)}><X size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO 4: TABELA TÉCNICA */}
      <div className="admin-section-group">
        <span className="section-label">4. Especificações (Tabela)</span>
        <div className="form-group">
          <label>Título da Tabela</label>
          <input value={formData.modelTitle} onChange={(e) => setFormData({...formData, modelTitle: e.target.value})} />
        </div>

        <div className="table-builder-container">
          <table className="builder-table">
            <thead>
              <tr>
                {formData.modelTable.headers.map((header, hIdx) => (
                  <th key={hIdx}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                      <input value={header} onChange={(e) => updateTableHeader(hIdx, e.target.value)} />
                      <button type="button" onClick={() => removeTableHeader(hIdx)} style={{color: 'red', border: 'none', background: 'none'}}><X size={14}/></button>
                    </div>
                  </th>
                ))}
                <th><button type="button" className="btn-add" onClick={addTableHeader}><Plus size={14}/></button></th>
              </tr>
            </thead>
            <tbody>
              {formData.modelTable.rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>
                      <input value={cell} onChange={(e) => updateTableCell(rIdx, cIdx, e.target.value)} />
                    </td>
                  ))}
                  <td><button type="button" className="btn-icon delete" onClick={() => removeTableRow(rIdx)}><Trash2 size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="btn-add" onClick={addTableRow}><Plus size={16}/> Nova Linha</button>
        </div>
      </div>

      <div style={{display: 'flex', gap: '15px', marginTop: '20px'}}>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary" style={{flex: 1}}>
          <Save size={20} /> FINALIZAR E SALVAR PRODUTO
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
