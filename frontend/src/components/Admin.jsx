import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Trash2, 
  Save, 
  Image as ImageIcon, 
  List, 
  Edit, 
  X, 
  LayoutDashboard, 
  Layers, 
  LogOut, 
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Admin.css';

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, products, categories
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isListVisible, setIsListVisible] = useState(true);
  
  // Estado do Formulário
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    descriptionAsList: false,
    hideModelData: false,
    images: [],
    features: [''],
    models: [['', '']], // Agora é uma matriz [linha][coluna]
    modelHeaders: ['Tipo / Referência', 'Código'],
    modelTitle: '',
    modelTable: null // { headers: [], rows: [] }
  });
  const [previews, setPreviews] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('http://localhost:5000/api/products'),
        fetch('http://localhost:5000/api/categories')
      ]);
      const prods = await prodRes.json();
      const cats = await catRes.json();
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      addToast('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts([...toasts, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const resetForm = () => {
    setFormData({
      name: '', category_id: '', description: '', images: [],
      descriptionAsList: false,
      hideModelData: false,
      features: [''], 
      models: [['', '']], 
      modelHeaders: ['Tipo / Referência', 'Código'],
      modelTitle: '',
      modelTable: null
    });
    setPreviews([]);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (product) => {
    let extra = {};
    try {
      extra = typeof product.extra_data === 'string' ? JSON.parse(product.extra_data) : product.extra_data;
    } catch(e) { extra = {}; }

    // Migração de dados antigos (objetos para arrays)
    let formattedModels = [['', '']];
    let headers = extra.modelHeaders || ['Tipo / Referência', 'Código'];

    if (extra.models && extra.models.length > 0) {
      if (typeof extra.models[0] === 'object' && !Array.isArray(extra.models[0])) {
        // Antigo formato: [{type, code}]
        formattedModels = extra.models.map(m => [m.type || '', m.code || '']);
      } else {
        // Novo formato ou já array
        formattedModels = extra.models;
      }
    }

    setFormData({
      name: product.name,
      category_id: product.category_id,
      description: product.description,
      descriptionAsList: extra.descriptionAsList || false,
      hideModelData: extra.hideModelData || false,
      images: [],
      features: (extra.features && extra.features.length > 0) ? extra.features : [''],
      models: formattedModels,
      modelHeaders: headers,
      modelTitle: extra.modelTitle || '',
      modelTable: extra.modelTable || null
    });
    
    if (extra.images) {
      setPreviews(extra.images);
    } else if (product.main_image) {
      setPreviews([product.main_image]);
    } else {
      setPreviews([]);
    }

    setIsEditing(true);
    setEditingId(product.id);
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Funções para Gerador de Tabela
  const toggleModelTable = () => {
    if (formData.modelTable) {
      setFormData({ ...formData, modelTable: null });
    } else {
      setFormData({ 
        ...formData, 
        modelTable: { 
          headers: ['Cor', '1kg', '5kg'], 
          rows: [['Azul', '', '']] 
        } 
      });
    }
  };

  const updateTableHeader = (index, value) => {
    const newHeaders = [...formData.modelTable.headers];
    newHeaders[index] = value;
    setFormData({ ...formData, modelTable: { ...formData.modelTable, headers: newHeaders } });
  };

  const addTableHeader = () => {
    const newHeaders = [...formData.modelTable.headers, 'Nova Coluna'];
    const newRows = formData.modelTable.rows.map(row => [...row, '']);
    setFormData({ ...formData, modelTable: { headers: newHeaders, rows: newRows } });
  };

  const updateTableCell = (rowIndex, colIndex, value) => {
    const newRows = [...formData.modelTable.rows];
    newRows[rowIndex][colIndex] = value;
    setFormData({ ...formData, modelTable: { ...formData.modelTable, rows: newRows } });
  };

  const addTableRow = () => {
    const newRow = new Array(formData.modelTable.headers.length).fill('');
    setFormData({ ...formData, modelTable: { ...formData.modelTable, rows: [...formData.modelTable.rows, newRow] } });
  };

  const removeTableHeader = (index) => {
    if (formData.modelTable.headers.length <= 1) return;
    const newHeaders = formData.modelTable.headers.filter((_, i) => i !== index);
    const newRows = formData.modelTable.rows.map(row => row.filter((_, i) => i !== index));
    setFormData({ ...formData, modelTable: { headers: newHeaders, rows: newRows } });
  };

  const removeTableRow = (index) => {
    if (formData.modelTable.rows.length <= 1) return;
    const newRows = formData.modelTable.rows.filter((_, i) => i !== index);
    setFormData({ ...formData, modelTable: { ...formData.modelTable, rows: newRows } });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...formData.images, ...files];
    setFormData({ ...formData, images: newImages });

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setPreviews(newPreviews);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productToDelete.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setShowDeleteModal(false);
        setProductToDelete(null);
        addToast('Produto excluído com sucesso');
        fetchData();
      }
    } catch (err) {
      addToast('Erro ao excluir produto', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('category_id', formData.category_id);
    data.append('description', formData.description);
    
    formData.images.forEach(file => {
      data.append('images', file);
    });
    
    const extraData = {
      features: formData.features.filter(f => f !== ''),
      models: formData.models.filter(m => m.some(cell => cell !== '')),
      modelHeaders: formData.modelHeaders,
      modelTitle: formData.modelTitle,
      descriptionAsList: formData.descriptionAsList,
      hideModelData: formData.hideModelData,
      modelTable: formData.modelTable
    };


    data.append('extra_data', JSON.stringify(extraData));

    const url = isEditing 
      ? `http://localhost:5000/api/products/${editingId}` 
      : 'http://localhost:5000/api/products';
    
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method: method, body: data });
      if (res.ok) {
        addToast(isEditing ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!");
        resetForm();
        fetchData();
      }
    } catch (err) {
      addToast('Erro ao salvar produto', 'error');
    }
  };

  const handleAddFeature = () => setFormData({...formData, features: [...formData.features, '']});
  const handleRemoveFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({...formData, features: newFeatures});
  };

  const handleAddModel = () => {
    const newRow = new Array(formData.modelHeaders.length).fill('');
    setFormData({...formData, models: [...formData.models, newRow]});
  };

  const handleRemoveModel = (index) => {
    if (formData.models.length <= 1) return;
    const newModels = formData.models.filter((_, i) => i !== index);
    setFormData({...formData, models: newModels});
  };

  const handleAddSimpleColumn = () => {
    const newHeaders = [...formData.modelHeaders, `Coluna ${formData.modelHeaders.length + 1}`];
    const newModels = formData.models.map(row => [...row, '']);
    setFormData({ ...formData, modelHeaders: newHeaders, models: newModels });
  };

  const handleRemoveSimpleColumn = (index) => {
    if (formData.modelHeaders.length <= 1) return;
    const newHeaders = formData.modelHeaders.filter((_, i) => i !== index);
    const newModels = formData.models.map(row => row.filter((_, i) => i !== index));
    setFormData({ ...formData, modelHeaders: newHeaders, models: newModels });
  };

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category_name && p.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading && activeTab === 'dashboard' && products.length === 0) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Carregando Painel Administrativo...</p>
      </div>
    );
  }

  return (
    <div className={`admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!isSidebarCollapsed && (
            <div className="sidebar-logo-text">
              <span className="brand">TALMAX</span>
              <span className="separator">|</span>
              <span className="subtitle">PAINEL ADM</span>
            </div>
          )}
          <button 
            className="btn-toggle-sidebar"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        <nav className="sidebar-nav">
          <div 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            title="Painel Geral"
          >
            <LayoutDashboard size={20} /> <span>Painel Geral</span>
          </div>
          <div 
            className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
            title="Produtos"
          >
            <Package size={20} /> <span>Produtos</span>
          </div>
          <div 
            className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
            title="Categorias"
          >
            <Layers size={20} /> <span>Categorias</span>
          </div>
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" title="Sair do Painel">
            <LogOut size={18} /> <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {activeTab === 'dashboard' && 'Dashboard Overview'}
            {activeTab === 'products' && 'Gerenciamento de Produtos'}
            {activeTab === 'categories' && 'Categorias de Produtos'}
          </motion.h1>
          <div className="admin-user-info">
            {activeTab === 'products' && (
              <button 
                className="btn-secondary" 
                onClick={() => setIsListVisible(!isListVisible)}
                style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '0.85rem'}}
              >
                {isListVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                {isListVisible ? 'Esconder Lista' : 'Mostrar Lista'}
              </button>
            )}
            <span style={{fontSize: '0.9rem', color: 'var(--admin-text-light)'}}>Olá, Administrador</span>
            <div className="user-avatar">AD</div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon blue"><Package size={24} /></div>
                  <div className="stat-info">
                    <h3>Total Produtos</h3>
                    <p>{products.length}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green"><Layers size={24} /></div>
                  <div className="stat-info">
                    <h3>Categorias</h3>
                    <p>{categories.length}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orange"><Plus size={24} /></div>
                  <div className="stat-info">
                    <h3>Novos Este Mês</h3>
                    <p>4</p>
                  </div>
                </div>
              </div>

              <div className="admin-card">
                <div className="card-header">
                  <h2><List size={20} /> Produtos Recentes</h2>
                  <button className="btn-secondary" onClick={() => setActiveTab('products')}>Ver Todos</button>
                </div>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 5).map(p => (
                        <tr key={p.id}>
                          <td>
                            <div className="product-cell">
                              <img src={p.main_image || '/img/placeholder.png'} alt={p.name} />
                              <div className="product-info">
                                <h4>{p.name}</h4>
                              </div>
                            </div>
                          </td>
                          <td><span className="badge badge-blue">{p.category_name}</span></td>
                          <td><span style={{color: 'var(--admin-success)', fontSize: '0.85rem', fontWeight: 600}}>Ativo</span></td>
                          <td className="actions-cell">
                            <button className="btn-icon edit" onClick={() => handleEdit(p)}><Edit size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div 
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div 
                className="admin-grid-management" 
                style={{
                  display: 'grid', 
                  gridTemplateColumns: isListVisible ? '1fr 1.5fr' : '1fr', 
                  gap: '2rem',
                  transition: 'grid-template-columns 0.3s ease'
                }}
              >
                {/* Form Column */}
                <section className="admin-card">
                  <div className="card-header">
                    <h2>{isEditing ? <Edit size={20} /> : <Plus size={20} />} {isEditing ? 'Editar Produto' : 'Novo Produto'}</h2>
                    {isEditing && (
                      <button className="btn-secondary" onClick={resetForm} style={{padding: '4px 8px', fontSize: '0.8rem'}}>
                        <X size={14} /> Cancelar
                      </button>
                    )}
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmit} className="admin-form">
                      <div className="form-group">
                        <label>Nome do Produto</label>
                        <input 
                          type="text" required 
                          placeholder="Ex: Gesso Troquelização"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Categoria</label>
                          <select 
                            required
                            value={formData.category_id}
                            onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                          >
                            <option value="">Selecione...</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Descrição Curta</label>
                        <textarea 
                          placeholder="Descreva o produto..."
                          value={formData.description}
                          onChange={(e) => {
                            setFormData({...formData, description: e.target.value});
                            // Auto-ajuste de altura
                            e.target.style.height = 'inherit';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          onFocus={(e) => {
                            e.target.style.height = 'inherit';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                        ></textarea>
                      </div>

                      <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '-10px', marginBottom: '15px'}}>
                        <input 
                          type="checkbox" 
                          id="descAsList"
                          style={{width: '18px', height: '18px', cursor: 'pointer'}}
                          checked={formData.descriptionAsList}
                          onChange={(e) => setFormData({...formData, descriptionAsList: e.target.checked})}
                        />
                        <label htmlFor="descAsList" style={{marginBottom: 0, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: 'var(--admin-primary)'}}>Exibir descrição como lista de tópicos</label>
                      </div>

                      <div className="form-group">
                        <label>Fotos do Produto</label>
                        <div className="file-upload-area">
                          <UploadCloud size={32} color="var(--admin-primary)" />
                          <p>Clique ou arraste imagens para upload</p>
                          <input 
                            type="file" 
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </div>
                        {previews.length > 0 && (
                          <div className="admin-previews">
                            {previews.map((src, idx) => (
                              <div key={idx} className="preview-thumb">
                                <img src={src} alt="Preview" />
                                <button type="button" className="remove-preview" onClick={() => removeImage(idx)}>
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="admin-section">
                        <label style={{fontWeight: 600, display: 'block', marginBottom: '10px'}}>Características</label>
                        {formData.features.map((feature, index) => (
                          <div key={index} className="dynamic-input">
                            <input 
                              placeholder="Ex: Alta resistência"
                              value={feature}
                              onChange={(e) => {
                                const newFeatures = [...formData.features];
                                newFeatures[index] = e.target.value;
                                setFormData({...formData, features: newFeatures});
                              }}
                            />
                            <button type="button" className="btn-icon delete" onClick={() => handleRemoveFeature(index)}><Trash2 size={16}/></button>
                          </div>
                        ))}
                        <button type="button" className="btn-add" onClick={handleAddFeature}><Plus size={14}/> Adicionar Linha</button>
                      </div>

                      <div className="admin-section">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                          <label style={{fontWeight: 600}}>Modelos / Códigos</label>
                          <button 
                            type="button" 
                            className="btn-add" 
                            style={{width: 'auto', margin: 0}} 
                            onClick={toggleModelTable}
                          >
                            {formData.modelTable ? 'Usar Lista Simples' : 'Usar Tabela/Grade'}
                          </button>
                        </div>

                        <div className="form-group" style={{marginBottom: '15px'}}>
                          <label style={{fontSize: '0.8rem', color: 'var(--admin-text-light)'}}>Título da Seção (Ex: Especificações)</label>
                          <input 
                            type="text" 
                            placeholder="Modelos / Códigos"
                            value={formData.modelTitle}
                            onChange={(e) => setFormData({...formData, modelTitle: e.target.value})}
                            style={{padding: '8px 12px', fontSize: '0.9rem'}}
                          />
                        </div>

                        <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '-5px', marginBottom: '15px'}}>
                          <input 
                            type="checkbox" 
                            id="hideModelData"
                            style={{width: '18px', height: '18px', cursor: 'pointer'}}
                            checked={formData.hideModelData}
                            onChange={(e) => setFormData({...formData, hideModelData: e.target.checked})}
                          />
                          <label htmlFor="hideModelData" style={{marginBottom: 0, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: 'var(--admin-primary)'}}>Ocultar corpo da tabela (Mostrar apenas cabeçalho)</label>
                        </div>

                        {!formData.modelTable ? (
                          <>
                            <div className="simple-headers" style={{display: 'flex', gap: '10px', marginBottom: '10px', paddingRight: '45px'}}>
                              {formData.modelHeaders.map((header, hIdx) => (
                                <div key={hIdx} style={{flex: 1, position: 'relative'}}>
                                  <input 
                                    style={{fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', background: '#f1f5f9', border: 'none', padding: '4px 8px'}}
                                    value={header}
                                    onChange={(e) => {
                                      const newHeaders = [...formData.modelHeaders];
                                      newHeaders[hIdx] = e.target.value;
                                      setFormData({...formData, modelHeaders: newHeaders});
                                    }}
                                  />
                                  {formData.modelHeaders.length > 1 && (
                                    <button 
                                      type="button" 
                                      onClick={() => handleRemoveSimpleColumn(hIdx)}
                                      style={{position: 'absolute', right: -5, top: -5, background: 'var(--admin-danger)', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button 
                                type="button" 
                                className="btn-add" 
                                style={{width: 'auto', margin: 0, padding: '2px 8px', fontSize: '0.7rem'}}
                                onClick={handleAddSimpleColumn}
                              >
                                + Coluna
                              </button>
                            </div>

                            {formData.models.map((modelRow, rowIndex) => (
                              <div key={rowIndex} className="dynamic-input-group">
                                {modelRow.map((cell, colIndex) => (
                                  <input 
                                    key={colIndex}
                                    placeholder={formData.modelHeaders[colIndex]}
                                    value={cell}
                                    onChange={(e) => {
                                      const newModels = [...formData.models];
                                      newModels[rowIndex][colIndex] = e.target.value;
                                      setFormData({...formData, models: newModels});
                                    }}
                                  />
                                ))}
                                <button type="button" className="btn-icon delete" onClick={() => handleRemoveModel(rowIndex)}><Trash2 size={16}/></button>
                              </div>
                            ))}
                            <button type="button" className="btn-add" onClick={handleAddModel}><Plus size={14}/> Adicionar Modelo</button>
                          </>
                        ) : (
                          <div className="table-builder-container">
                            <div className="table-builder-scroll">
                              <table className="builder-table">
                                <thead>
                                  <tr>
                                    {formData.modelTable.headers.map((header, hIdx) => (
                                      <th key={hIdx}>
                                        <div className="header-cell">
                                          <input 
                                            value={header}
                                            onChange={(e) => updateTableHeader(hIdx, e.target.value)}
                                          />
                                          <button type="button" onClick={() => removeTableHeader(hIdx)}><X size={12}/></button>
                                        </div>
                                      </th>
                                    ))}
                                    <th><button type="button" className="btn-add-col" onClick={addTableHeader}><Plus size={14}/></button></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {formData.modelTable.rows.map((row, rIdx) => (
                                    <tr key={rIdx}>
                                      {row.map((cell, cIdx) => (
                                        <td key={cIdx}>
                                          <input 
                                            value={cell}
                                            onChange={(e) => updateTableCell(rIdx, cIdx, e.target.value)}
                                          />
                                        </td>
                                      ))}
                                      <td>
                                        <button type="button" className="btn-icon delete" onClick={() => removeTableRow(rIdx)}><Trash2 size={14}/></button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <button type="button" className="btn-add" onClick={addTableRow}><Plus size={14}/> Adicionar Linha</button>
                          </div>
                        )}
                      </div>

                      <button type="submit" className="btn-primary" style={{width: '100%', justifyContent: 'center', padding: '1rem'}}>
                        <Save size={18} /> {isEditing ? 'ATUALIZAR PRODUTO' : 'CADASTRAR PRODUTO'}
                      </button>
                    </form>
                  </div>
                </section>

                {/* List Column */}
                {isListVisible && (
                  <section className="admin-card">
                    <div className="card-header">
                      <h2><List size={20} /> Lista de Produtos</h2>
                      <div className="search-box" style={{position: 'relative'}}>
                        <Search size={16} style={{position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8'}} />
                        <input 
                          type="text" 
                          placeholder="Buscar..." 
                          style={{paddingLeft: '35px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px', borderRadius: '20px', border: '1px solid var(--admin-border)', fontSize: '0.85rem'}}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Produto</th>
                            <th>Categoria</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map(p => (
                            <tr key={p.id}>
                              <td>
                                <div className="product-cell">
                                  <img src={p.main_image || '/img/placeholder.png'} alt={p.name} />
                                  <div className="product-info">
                                    <h4>{p.name}</h4>
                                    <p>ID: #{p.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td><span className="badge badge-blue">{p.category_name}</span></td>
                              <td className="actions-cell">
                                <button className="btn-icon edit" title="Editar" onClick={() => handleEdit(p)}><Edit size={16} /></button>
                                <button className="btn-icon delete" title="Excluir" onClick={() => handleDeleteClick(p)}><Trash2 size={16} /></button>
                              </td>
                            </tr>
                          ))}
                          {filteredProducts.length === 0 && (
                            <tr>
                              <td colSpan="3" style={{textAlign: 'center', padding: '3rem', color: 'var(--admin-text-light)'}}>
                                Nenhum produto encontrado.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'categories' && (
            <motion.div 
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="admin-card">
                <div className="card-header">
                  <h2><Layers size={20} /> Gerenciar Categorias</h2>
                  <button className="btn-primary"><Plus size={18} /> Nova Categoria</button>
                </div>
                <div className="card-body">
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Slug</th>
                          <th>Produtos</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map(cat => (
                          <tr key={cat.id}>
                            <td><strong>{cat.name}</strong></td>
                            <td><code>{cat.slug}</code></td>
                            <td>{products.filter(p => p.category_id === cat.id).length}</td>
                            <td className="actions-cell">
                              <button className="btn-icon edit"><Edit size={16} /></button>
                              <button className="btn-icon delete"><Trash2 size={16} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-body">
                <div className="modal-icon">
                  <AlertCircle size={32} />
                </div>
                <h3>Confirmar Exclusão</h3>
                <p>Você tem certeza que deseja excluir o produto <strong>{productToDelete?.name}</strong>? Esta ação não pode ser desfeita.</p>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                <button className="btn-primary" style={{backgroundColor: 'var(--admin-danger)'}} onClick={confirmDelete}>Sim, Excluir</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast System */}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div 
              key={toast.id}
              className={`toast ${toast.type}`}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
            >
              {toast.type === 'success' ? <CheckCircle size={20} color="var(--admin-success)" /> : <AlertCircle size={20} color="var(--admin-danger)" />}
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};


export default Admin;
