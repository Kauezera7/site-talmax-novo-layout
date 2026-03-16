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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isListVisible, setIsListVisible] = useState(true);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isMainCategoryDropdownOpen, setIsMainCategoryDropdownOpen] = useState(false);
  const [previews, setPreviews] = useState([]);
  
  // Estado do Formulário de Produtos
  const [formData, setFormData] = useState({
    name: '',
    main_category_ids: [],
    category_ids: [],
    description: '',
    descriptionAsList: false,
    hideModelData: false,
    images: [],
    features: [''],
    modelTitle: '',
    modelTable: { headers: ['Tipo / Referência', 'Código'], rows: [['', '']] }
  });

  const mainCategories = Array.isArray(categories) ? categories.filter(c => !c.parent_id) : [];
  const subCategories = Array.isArray(categories) ? categories.filter(c => c.parent_id) : [];

  const getFilteredSubCategories = () => {
    if (formData.main_category_ids.length === 0 || !Array.isArray(subCategories)) return [];
    return subCategories.filter(s => formData.main_category_ids.includes(Number(s.parent_id)));
  };

  // Estado do Formulário de Categorias
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    icon: null,
    is_visible: true,
    parent_id: null
  });

  const [categoryIconPreview, setCategoryIconPreview] = useState(null);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [quickSubNames, setQuickSubNames] = useState({}); // Estado para o input rápido

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showCategoryDeleteModal, setShowCategoryDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
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
      name: '', 
      main_category_ids: [],
      category_ids: [], 
      description: '', 
      images: [],
      descriptionAsList: false,
      hideModelData: false,
      features: [''], 
      modelTitle: '',
      modelTable: { headers: ['Tipo / Referência', 'Código'], rows: [['', '']] }
    });
    setPreviews([]);
    setIsEditing(false);
    setEditingId(null);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      slug: '',
      icon: null,
      is_visible: true,
      parent_id: null
    });
    setCategoryIconPreview(null);
    setIsEditingCategory(false);
    setEditingCategoryId(null);
  };

  const handleEdit = (product) => {
    let extra = {};
    try {
      extra = typeof product.extra_data === 'string' ? JSON.parse(product.extra_data) : product.extra_data;
    } catch(e) { extra = {}; }

    // Separar categorias em Principais e Subcategorias
    const allCategoryIds = Array.isArray(product.category_ids) ? product.category_ids : [];
    const mainCatIds = [];
    const subCatIds = [];

    allCategoryIds.forEach(id => {
      const cat = categories.find(c => c.id === id);
      if (cat) {
        if (!cat.parent_id) {
          mainCatIds.push(id);
        } else {
          subCatIds.push(id);
        }
      }
    });

    // Migração de dados antigos para o novo formato de Tabela Unificada
    let finalModelTable = extra.modelTable;

    if (!finalModelTable && extra.models && extra.models.length > 0) {
      // Se não tem modelTable mas tem models antigo, converte agora
      let rows = [];
      if (typeof extra.models[0] === 'object' && !Array.isArray(extra.models[0])) {
        rows = extra.models.map(m => [m.type || '', m.code || '']);
      } else {
        rows = extra.models;
      }
      
      finalModelTable = {
        headers: extra.modelHeaders || ['Tipo / Referência', 'Código'],
        rows: rows
      };
    }

    // Caso ainda esteja vazio após a migração
    if (!finalModelTable) {
      finalModelTable = { headers: ['Tipo / Referência', 'Código'], rows: [['', '']] };
    }

    setFormData({
      name: product.name,
      main_category_ids: mainCatIds,
      category_ids: subCatIds,
      description: product.description,
      descriptionAsList: extra.descriptionAsList || false,
      hideModelData: extra.hideModelData || false,
      images: [],
      features: (extra.features && extra.features.length > 0) ? extra.features : [''],
      modelTitle: extra.modelTitle || '',
      modelTable: finalModelTable
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


  // Funções de Categoria
  const toggleCategoryVisibility = async (category) => {
    try {
        const data = new FormData();
        data.append('name', category.name);
        data.append('slug', category.slug);
        data.append('is_visible', !category.is_visible);
        if (category.parent_id) {
            data.append('parent_id', category.parent_id);
        }

        const res = await fetch(`http://localhost:5000/api/categories/${category.id}`, {
            method: 'PUT',
            body: data
        });

        if (res.ok) {
            addToast(`Categoria ${!category.is_visible ? 'visível' : 'oculta'} com sucesso`);
            fetchData();
        } else {
            addToast('Erro ao alterar visibilidade', 'error');
        }
    } catch (err) {
        addToast('Erro de conexão', 'error');
    }
  };

  const handleEditCategory = (category) => {
    setCategoryFormData({
      name: category.name,
      slug: category.slug,
      icon: null,
      is_visible: category.is_visible !== 0, // Converte 1/0 do MySQL para boolean
      parent_id: category.parent_id || null
    });
    setCategoryIconPreview(category.icon_url);
    setIsEditingCategory(true);
    setEditingCategoryId(category.id);
    setShowCategoryModal(true);
  };

  const handleCategoryDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowCategoryDeleteModal(true);
  };

  const confirmCategoryDelete = async () => {
    if (!categoryToDelete) return;
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${categoryToDelete.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setShowCategoryDeleteModal(false);
        setCategoryToDelete(null);
        addToast('Categoria excluída com sucesso');
        fetchData();
      }
    } catch (err) {
      addToast('Erro ao excluir categoria', 'error');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryFormData.name || !categoryFormData.slug) {
      addToast('Nome e Slug são obrigatórios', 'error');
      return;
    }

    console.log("🚀 Enviando categoria...", categoryFormData);

    try {
      const data = new FormData();
      data.append('name', categoryFormData.name.trim());
      data.append('slug', categoryFormData.slug.trim());
      data.append('is_visible', categoryFormData.is_visible); // Adiciona visibilidade
      
      if (categoryFormData.parent_id) {
        data.append('parent_id', categoryFormData.parent_id);
      }

      if (categoryFormData.icon instanceof File) {
        data.append('icon', categoryFormData.icon);
      }

      const url = isEditingCategory 
        ? `http://localhost:5000/api/categories/${editingCategoryId}` 
        : 'http://localhost:5000/api/categories';
      
      const method = isEditingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, { 
        method: method, 
        body: data 
      });

      // Tenta ler o JSON, mas trata erro se não for JSON
      let resultData;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        resultData = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || "Erro desconhecido no servidor");
      }

      if (res.ok) {
        addToast(isEditingCategory ? "Categoria atualizada com sucesso!" : "Categoria criada com sucesso!");
        setShowCategoryModal(false);
        resetCategoryForm();
        // Recarrega os dados do banco para atualizar a lista
        await fetchData();
      } else {
        addToast(resultData.error || 'Erro ao salvar categoria', 'error');
      }
    } catch (err) {
      console.error("❌ Erro no submit de categoria:", err);
      addToast(err.message || 'Erro de conexão com o servidor', 'error');
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const handleCategoryNameChange = (e) => {
    const name = e.target.value;
    setCategoryFormData({
      ...categoryFormData,
      name,
      slug: generateSlug(name)
    });
  };

  const handleAddSubcategory = (parent) => {
    resetCategoryForm();
    setCategoryFormData({
      name: '',
      slug: '',
      icon: null,
      is_visible: true,
      parent_id: parent.id
    });
    setShowCategoryModal(true);
  };

  const handleQuickAddSub = async (parentId) => {
    const name = quickSubNames[parentId];
    if (!name || !name.trim()) {
      addToast('Digite um nome para a subcategoria', 'error');
      return;
    }

    try {
      const slug = generateSlug(name);
      const data = new FormData();
      data.append('name', name.trim());
      data.append('slug', slug);
      data.append('is_visible', true);
      data.append('parent_id', parentId);

      const res = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        body: data
      });

      if (res.ok) {
        addToast('Subcategoria adicionada com sucesso!');
        setQuickSubNames(prev => ({ ...prev, [parentId]: '' })); // Limpa o input
        fetchData();
        // Expande a categoria pai automaticamente para mostrar a nova sub
        setExpandedCategories(prev => ({ ...prev, [parentId]: true }));
      } else {
        const errorData = await res.json();
        addToast(errorData.error || 'Erro ao adicionar', 'error');
      }
    } catch (err) {
      addToast('Erro de conexão', 'error');
    }
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

    if (formData.main_category_ids.length === 0) {
      addToast('Selecione pelo menos uma categoria principal', 'error');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    
    // Une as categorias principais com as subcategorias selecionadas
    const allSelectedCategories = [...formData.main_category_ids, ...formData.category_ids];
    data.append('category_ids', JSON.stringify(allSelectedCategories));
    
    data.append('description', formData.description);
    
    formData.images.forEach(file => {
      data.append('images', file);
    });
    
    const extraData = {
      features: formData.features.filter(f => f !== ''),
      modelTitle: formData.modelTitle,
      descriptionAsList: formData.descriptionAsList,
      hideModelData: formData.hideModelData,
      modelTable: {
        headers: formData.modelTable.headers,
        rows: formData.modelTable.rows.filter(row => row.some(cell => cell.trim() !== ''))
      }
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
      } else {
        const errorData = await res.json();
        addToast(errorData.error || 'Erro ao salvar produto', 'error');
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

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category_names && p.category_names.toLowerCase().includes(searchTerm.toLowerCase()))
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
      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay-mobile" 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
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
            onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
            title="Painel Geral"
          >
            <LayoutDashboard size={20} /> <span>Painel Geral</span>
          </div>
          <div 
            className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }}
            title="Produtos"
          >
            <Package size={20} /> <span>Produtos</span>
          </div>
          <div 
            className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => { setActiveTab('categories'); setIsMobileMenuOpen(false); }}
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
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <button 
              className="btn-mobile-menu"
              onClick={() => setIsMobileMenuOpen(true)}
              style={{
                display: 'none',
                background: 'white',
                border: '1px solid var(--admin-border)',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <List size={20} />
            </button>
            <h1>
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'products' && 'Gerenciamento de Produtos'}
              {activeTab === 'categories' && 'Categorias de Produtos'}
            </h1>
          </div>
          <div className="admin-user-info">
            {activeTab === 'products' && (
              <button 
                className="btn-secondary btn-hide-list" 
                onClick={() => setIsListVisible(!isListVisible)}
                style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '0.85rem'}}
              >
                {isListVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                {isListVisible ? 'Esconder Lista' : 'Mostrar Lista'}
              </button>
            )}
            <span className="user-name" style={{fontSize: '0.9rem', color: 'var(--admin-text-light)'}}>Olá, Administrador</span>
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
                          <td>
                            <div className="badge-container">
                              {p.category_names ? p.category_names.split(', ').map((cat, i) => (
                                <span key={i} className="badge-soft-blue">{cat}</span>
                              )) : <span className="badge-soft-blue badge-secondary">Sem categoria</span>}
                            </div>
                          </td>
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
                className={`admin-grid-management ${!isListVisible ? 'list-hidden' : ''}`}
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
                      
                      {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
                      <div className="admin-section-group">
                        <span className="section-label">1. Informações Básicas</span>
                        <div className="form-group">
                          <label>Nome Comercial do Produto</label>
                          <input 
                            type="text" required 
                            placeholder="Ex: Gesso Troquelização Talmax"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                        </div>

                        <div className="form-group">
                          <label>Categorias Principais (Selecione uma ou mais)</label>
                          <div className="custom-multi-select">
                            <div 
                              className="multi-select-header" 
                              onClick={() => setIsMainCategoryDropdownOpen(!isMainCategoryDropdownOpen)}
                            >
                              <div className="selected-tags-container">
                                {formData.main_category_ids.length > 0 ? (
                                  formData.main_category_ids.map(id => {
                                    const cat = categories.find(c => c.id === id);
                                    return (
                                      <span key={id} className="header-tag">
                                        {cat?.name}
                                        <button 
                                          type="button" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const newIds = formData.main_category_ids.filter(cid => cid !== id);
                                            // Também limpa subcategorias que não pertencem mais a nenhuma categoria principal selecionada
                                            const remainingSubCats = subCategories.filter(s => newIds.includes(Number(s.parent_id)));
                                            const newSubIds = formData.category_ids.filter(sid => remainingSubCats.some(rs => rs.id === sid));
                                            
                                            setFormData({
                                              ...formData, 
                                              main_category_ids: newIds,
                                              category_ids: newSubIds
                                            });
                                          }}
                                        >
                                          <X size={12} />
                                        </button>
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span className="placeholder">Selecione as categorias principais...</span>
                                )}
                              </div>
                              <ChevronRight 
                                size={16} 
                                style={{ 
                                  transform: isMainCategoryDropdownOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s',
                                  color: '#94a3b8'
                                }} 
                              />
                            </div>

                            <AnimatePresence>
                              {isMainCategoryDropdownOpen && (
                                <motion.div 
                                  className="multi-select-options"
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {mainCategories.map(cat => (
                                    <div 
                                      key={cat.id} 
                                      className={`multi-select-option ${formData.main_category_ids.includes(cat.id) ? 'selected' : ''}`}
                                      onClick={() => {
                                        const isSelected = formData.main_category_ids.includes(cat.id);
                                        const newIds = isSelected
                                          ? formData.main_category_ids.filter(id => id !== cat.id)
                                          : [...formData.main_category_ids, cat.id];
                                        
                                        // Se desmarcou, limpa subcategorias órfãs
                                        let newSubIds = formData.category_ids;
                                        if (isSelected) {
                                          const remainingSubCats = subCategories.filter(s => newIds.includes(Number(s.parent_id)));
                                          newSubIds = formData.category_ids.filter(sid => remainingSubCats.some(rs => rs.id === sid));
                                        }

                                        setFormData({
                                          ...formData, 
                                          main_category_ids: newIds,
                                          category_ids: newSubIds
                                        });
                                      }}
                                    >
                                      <span>{cat.name}</span>
                                      <CheckCircle className="check-icon" size={16} />
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {formData.main_category_ids.length > 0 && (
                          <div className="form-group">
                            <label>Subcategorias (Selecione uma ou mais)</label>
                            <div className="custom-multi-select">
                              <div 
                                className="multi-select-header" 
                                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                              >
                                <div className="selected-tags-container">
                                  {formData.category_ids.length > 0 ? (
                                    formData.category_ids.map(id => {
                                      const cat = categories.find(c => c.id === id);
                                      return (
                                        <span key={id} className="header-tag">
                                          {cat?.name}
                                          <button 
                                            type="button" 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const newIds = formData.category_ids.filter(cid => cid !== id);
                                              setFormData({...formData, category_ids: newIds});
                                            }}
                                          >
                                            <X size={12} />
                                          </button>
                                        </span>
                                      );
                                    })
                                  ) : (
                                    <span className="placeholder">Selecione as subcategorias...</span>
                                  )}
                                </div>
                                <ChevronRight 
                                  size={16} 
                                  style={{ 
                                    transform: isCategoryDropdownOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s',
                                    color: '#94a3b8'
                                  }} 
                                />
                              </div>

                              <AnimatePresence>
                                {isCategoryDropdownOpen && (
                                  <motion.div 
                                    className="multi-select-options"
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {getFilteredSubCategories().map(cat => (
                                      <div 
                                        key={cat.id} 
                                        className={`multi-select-option ${formData.category_ids.includes(cat.id) ? 'selected' : ''}`}
                                        onClick={() => {
                                          const newIds = formData.category_ids.includes(cat.id)
                                            ? formData.category_ids.filter(id => id !== cat.id)
                                            : [...formData.category_ids, cat.id];
                                          setFormData({...formData, category_ids: newIds});
                                        }}
                                      >
                                        <span>{cat.name}</span>
                                        <CheckCircle className="check-icon" size={16} />
                                      </div>
                                    ))}
                                    {getFilteredSubCategories().length === 0 && (
                                      <div className="multi-select-option" style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                        Nenhuma subcategoria disponível para as categorias selecionadas
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* SEÇÃO 2: CONTEÚDO DESCRITIVO */}
                      <div className="admin-section-group">
                        <span className="section-label">2. Descrição do Produto</span>
                        <div className="form-group">
                          <label>Texto Descritivo</label>
                          <textarea 
                            placeholder="Conte os detalhes do produto aqui..."
                            value={formData.description}
                            onChange={(e) => {
                              setFormData({...formData, description: e.target.value});
                              e.target.style.height = 'inherit';
                              e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                            onFocus={(e) => {
                              e.target.style.height = 'inherit';
                              e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                          ></textarea>
                        </div>

                        <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--admin-border)'}}>
                          <input 
                            type="checkbox" 
                            id="descAsList"
                            style={{width: '20px', height: '20px', cursor: 'pointer'}}
                            checked={formData.descriptionAsList}
                            onChange={(e) => setFormData({...formData, descriptionAsList: e.target.checked})}
                          />
                          <label htmlFor="descAsList" style={{marginBottom: 0, cursor: 'pointer', fontWeight: 600}}>Exibir descrição em tópicos (bolinhas)</label>
                        </div>

                        <div style={{marginTop: '10px'}}>
                          <label style={{fontWeight: 600, display: 'block', marginBottom: '10px'}}>Destaques / Diferenciais</label>
                          {formData.features.map((feature, index) => (
                            <div key={index} className="dynamic-input-group">
                              <input 
                                placeholder="Ex: Secagem em 30 minutos"
                                value={feature}
                                onChange={(e) => {
                                  const newFeatures = [...formData.features];
                                  newFeatures[index] = e.target.value;
                                  setFormData({...formData, features: newFeatures});
                                }}
                              />
                              <button type="button" className="btn-icon delete" onClick={() => handleRemoveFeature(index)}><Trash2 size={18}/></button>
                            </div>
                          ))}
                          <button type="button" className="btn-add" onClick={handleAddFeature}><Plus size={16}/> Adicionar Destaque</button>
                        </div>
                      </div>

                      {/* SEÇÃO 3: MÍDIA (IMAGENS) */}
                      <div className="admin-section-group">
                        <span className="section-label">3. Mídia e Fotos</span>
                        <div className="form-group">
                          <label>Galeria de Imagens</label>
                          <div className="file-upload-area">
                            <UploadCloud size={40} color="var(--admin-primary)" style={{marginBottom: '10px'}} />
                            <p style={{fontWeight: 600, color: 'var(--admin-text)', marginBottom: '5px'}}>Upload de Fotos</p>
                            <p style={{fontSize: '0.8rem', color: 'var(--admin-secondary)'}}>Arraste arquivos ou clique para selecionar</p>
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
                      </div>

                      {/* SEÇÃO 4: ESPECIFICAÇÕES TÉCNICAS */}
                      <div className="admin-section-group">
                        <span className="section-label">4. Modelos e Especificações</span>
                        
                        <div className="form-group">
                          <label>Título desta Seção</label>
                          <input 
                            type="text" 
                            placeholder="Ex: Modelos Disponíveis ou Especificações"
                            value={formData.modelTitle}
                            onChange={(e) => setFormData({...formData, modelTitle: e.target.value})}
                          />
                        </div>

                        <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--admin-border)', marginBottom: '15px'}}>
                          <input 
                            type="checkbox" 
                            id="hideModelData"
                            style={{width: '20px', height: '20px', cursor: 'pointer'}}
                            checked={formData.hideModelData}
                            onChange={(e) => setFormData({...formData, hideModelData: e.target.checked})}
                          />
                          <label htmlFor="hideModelData" style={{marginBottom: 0, cursor: 'pointer', fontWeight: 600}}>Ocultar corpo (Mostrar apenas a tira superior)</label>
                        </div>

                        <div className="table-builder-container" style={{background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid var(--admin-border)'}}>
                          <div className="table-builder-scroll">
                            <table className="builder-table">
                              <thead>
                                <tr>
                                  {formData.modelTable.headers.map((header, hIdx) => (
                                    <th key={hIdx}>
                                      <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                        <input 
                                          value={header}
                                          onChange={(e) => updateTableHeader(hIdx, e.target.value)}
                                          style={{fontWeight: 800, textTransform: 'uppercase', border: 'none', background: '#f1f5f9', padding: '5px'}}
                                        />
                                        <button type="button" onClick={() => removeTableHeader(hIdx)} style={{background: 'none', border: 'none', color: 'red', cursor: 'pointer'}}><X size={14}/></button>
                                      </div>
                                    </th>
                                  ))}
                                  <th><button type="button" className="btn-add" style={{margin: 0}} onClick={addTableHeader}><Plus size={14}/></button></th>
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
                                          style={{border: '1px solid #eee', padding: '8px', borderRadius: '4px'}}
                                        />
                                      </td>
                                    ))}
                                    <td>
                                      <button type="button" className="btn-icon delete" onClick={() => removeTableRow(rIdx)}><Trash2 size={16}/></button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <button type="button" className="btn-add" onClick={addTableRow}><Plus size={16}/> Nova Linha na Tabela</button>
                        </div>
                      </div>

                      <button type="submit" className="btn-primary" style={{padding: '1.25rem', fontSize: '1.1rem', marginTop: '1rem'}}>
                        <Save size={22} /> {isEditing ? 'SALVAR ALTERAÇÕES NO PRODUTO' : 'FINALIZAR E CADASTRAR PRODUTO'}
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
                              <td>
                            <div className="badge-container">
                              {p.category_names ? p.category_names.split(', ').map((cat, i) => (
                                <span key={i} className="badge-soft-blue">{cat}</span>
                              )) : <span className="badge-soft-blue badge-secondary">Sem categoria</span>}
                            </div>
                          </td>
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
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <motion.button 
                      className="btn-secondary" 
                      whileHover={{ 
                        scale: 1.05, 
                        backgroundColor: "var(--admin-primary)", 
                        color: "#fff",
                        boxShadow: "0 4px 15px rgba(37, 99, 235, 0.2)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { resetCategoryForm(); setShowCategoryModal(true); }}
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        border: '1px solid var(--admin-primary)', 
                        color: 'var(--admin-primary)',
                        padding: '0.6rem 1.2rem',
                        transition: 'background-color 0.2s, color 0.2s'
                      }}
                    >
                      <Plus size={18} /> Nova Categoria
                    </motion.button>
                    <motion.button 
                      className="btn-secondary" 
                      whileHover={{ 
                        scale: 1.05, 
                        backgroundColor: "var(--admin-primary)", 
                        color: "#fff",
                        boxShadow: "0 4px 15px rgba(37, 99, 235, 0.2)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { 
                        resetCategoryForm(); 
                        setCategoryFormData(prev => ({ ...prev, parent_id: mainCategories[0]?.id || null }));
                        setShowCategoryModal(true); 
                      }}
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        border: '1px solid var(--admin-primary)', 
                        color: 'var(--admin-primary)',
                        padding: '0.6rem 1.2rem',
                        transition: 'background-color 0.2s, color 0.2s'
                      }}
                    >
                      <Plus size={18} /> Nova Subcategoria
                    </motion.button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Ícone</th>
                          <th>Nome</th>
                          <th>Slug</th>
                          <th>Status</th>
                          <th>Produtos</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mainCategories.map(cat => (
                          <React.Fragment key={cat.id}>
                            <tr className="main-category-row">
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <button 
                                    className="btn-icon" 
                                    style={{ width: '24px', height: '24px', border: 'none', background: '#f1f5f9' }}
                                    onClick={() => setExpandedCategories(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                                  >
                                    <ChevronRight 
                                      size={16} 
                                      style={{ 
                                        transform: expandedCategories[cat.id] ? 'rotate(90deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s'
                                      }} 
                                    />
                                  </button>
                                  <div className="category-icon-cell">
                                    {cat.icon_url ? <img src={cat.icon_url} alt={cat.name} /> : <ImageIcon size={20} color="#94a3b8" />}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <strong>{cat.name}</strong>
                              </td>
                              <td><code>{cat.slug}</code></td>
                              <td>
                                <span 
                                  className={`badge ${cat.is_visible ? 'badge-blue' : 'badge-secondary'}`} 
                                  onClick={() => toggleCategoryVisibility(cat)}
                                  style={{
                                    backgroundColor: cat.is_visible ? '#eff6ff' : '#f1f5f9',
                                    color: cat.is_visible ? '#2563eb' : '#64748b',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    width: 'fit-content'
                                  }}
                                  title="Clique para alternar visibilidade"
                                >
                                  {cat.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                                  {cat.is_visible ? 'VISÍVEL' : 'OCULTA'}
                                </span>
                              </td>
                              <td>{products.filter(p => p.category_ids && p.category_ids.includes(cat.id)).length}</td>
                              <td className="actions-cell">
                                <button className="btn-icon edit" onClick={() => handleEditCategory(cat)}><Edit size={16} /></button>
                                <button className="btn-icon delete" onClick={() => handleCategoryDeleteClick(cat)}><Trash2 size={16} /></button>
                              </td>
                            </tr>
                            {/* Subcategorias */}
                            {expandedCategories[cat.id] && subCategories
                              .filter(sub => Number(sub.parent_id) === Number(cat.id))
                              .map(subCat => (
                                <tr key={subCat.id} className="subcategory-row">
                                  <td></td>
                                  <td>{subCat.name}</td>
                                  <td><code>{subCat.slug}</code></td>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span className="badge badge-secondary" style={{fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px'}}>SUBCATEGORIA</span>
                                      <button 
                                        onClick={() => toggleCategoryVisibility(subCat)}
                                        style={{ 
                                          background: 'none', 
                                          border: 'none', 
                                          cursor: 'pointer',
                                          color: subCat.is_visible ? 'var(--admin-primary)' : 'var(--admin-secondary)',
                                          display: 'flex',
                                          alignItems: 'center'
                                        }}
                                        title={subCat.is_visible ? 'Ocultar Subcategoria' : 'Mostrar Subcategoria'}
                                      >
                                        {subCat.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                      </button>
                                    </div>
                                  </td>
                                  <td>{products.filter(p => p.category_ids && p.category_ids.includes(subCat.id)).length}</td>
                                  <td className="actions-cell">
                                    <button className="btn-icon edit" onClick={() => handleEditCategory(subCat)}><Edit size={16} /></button>
                                    <button className="btn-icon delete" onClick={() => handleCategoryDeleteClick(subCat)}><Trash2 size={16} /></button>
                                  </td>
                                </tr>
                              ))
                            }
                          </React.Fragment>
                        ))}
                        {/* Mostrar subcategorias órfãs se houver */}
                        {subCategories.filter(sub => !mainCategories.some(m => m.id === Number(sub.parent_id))).map(orphan => (
                          <tr key={orphan.id} className="subcategory-row orphan">
                            <td></td>
                            <td>{orphan.name} (Órfã)</td>
                            <td><code>{orphan.slug}</code></td>
                            <td><span className="badge badge-danger" style={{fontSize: '0.7rem'}}>SEM PAI</span></td>
                            <td>{products.filter(p => p.category_ids && p.category_ids.includes(orphan.id)).length}</td>
                            <td className="actions-cell">
                              <button className="btn-icon edit" onClick={() => handleEditCategory(orphan)}><Edit size={16} /></button>
                              <button className="btn-icon delete" onClick={() => handleCategoryDeleteClick(orphan)}><Trash2 size={16} /></button>
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

      {/* Modal de Nova/Editar Categoria */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ maxWidth: '500px' }}
            >
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>
                  {isEditingCategory 
                    ? (categoryFormData.parent_id ? 'Editar Subcategoria' : 'Editar Categoria') 
                    : (categoryFormData.parent_id ? 'Nova Subcategoria' : 'Nova Categoria')
                  }
                </h3>
                <button className="btn-icon" onClick={() => setShowCategoryModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleCategorySubmit}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {(categoryFormData.parent_id || isEditingCategory && categories.find(c => c.id === editingCategoryId)?.parent_id) && (
                    <div className="form-group" style={{ textAlign: 'left' }}>
                      <label>Categoria Principal (Pai)</label>
                      <select 
                        value={categoryFormData.parent_id || ''} 
                        onChange={(e) => setCategoryFormData({...categoryFormData, parent_id: e.target.value || null})}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid var(--admin-border)',
                          background: 'white'
                        }}
                      >
                        {mainCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label>{categoryFormData.parent_id ? 'Nome da Subcategoria' : 'Nome da Categoria'}</label>
                    <input 
                      type="text" required 
                      placeholder={categoryFormData.parent_id ? "Ex: Silicone por Condensação" : "Ex: Gessos e Revestimentos"}
                      value={categoryFormData.name}
                      onChange={handleCategoryNameChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Slug (URL amigável)</label>
                    <input 
                      type="text" required 
                      value={categoryFormData.slug}
                      onChange={(e) => setCategoryFormData({...categoryFormData, slug: e.target.value})}
                    />
                  </div>

                  <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--admin-border)'}}>
                    <input 
                      type="checkbox" 
                      id="catVisible"
                      style={{width: '20px', height: '20px', cursor: 'pointer'}}
                      checked={categoryFormData.is_visible}
                      onChange={(e) => setCategoryFormData({...categoryFormData, is_visible: e.target.checked})}
                    />
                    <label htmlFor="catVisible" style={{marginBottom: 0, cursor: 'pointer', fontWeight: 600}}>Exibir categoria no site</label>
                  </div>

                  <div className="form-group">
                    <label>Ícone da Categoria</label>
                    <div className="file-upload-area" style={{ padding: '15px' }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setCategoryFormData({...categoryFormData, icon: file});
                            setCategoryIconPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                      <p>Clique para enviar o ícone</p>
                    </div>
                    {categoryIconPreview && (
                      <div className="preview-thumb" style={{ marginTop: '10px', width: '60px', height: '60px', position: 'relative' }}>
                        <img src={categoryIconPreview} alt="Preview Icon" />
                        <button 
                          type="button" 
                          className="remove-preview" 
                          onClick={() => {
                            setCategoryFormData({...categoryFormData, icon: null});
                            setCategoryIconPreview(null);
                          }}
                          style={{ width: '18px', height: '18px', top: '-5px', right: '-5px' }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowCategoryModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-primary">
                    <Save size={18} /> {isEditingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Exclusão de Categoria */}
      <AnimatePresence>
        {showCategoryDeleteModal && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-body">
                <div className="modal-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                  <AlertCircle size={32} />
                </div>
                <h3>Excluir Categoria?</h3>
                <p>Tem certeza que deseja excluir <strong>{categoryToDelete?.name}</strong>?</p>
                <p style={{ fontSize: '0.85rem', color: '#ef4444', marginTop: '10px' }}>
                  ⚠️ Atenção: Produtos vinculados a esta categoria ficarão "Sem Categoria".
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowCategoryDeleteModal(false)}>Cancelar</button>
                <button className="btn-primary" style={{backgroundColor: 'var(--admin-danger)'}} onClick={confirmCategoryDelete}>Sim, Excluir</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Exclusão de Produto */}
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
