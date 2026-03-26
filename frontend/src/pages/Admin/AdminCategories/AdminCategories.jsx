import React, { useEffect, useRef, useState } from 'react';
import { Plus, Layers, AlertCircle, X, Search, Filter, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../../context/AdminContext';
import CategoryTable from './CategoryTable';
import CategoryForm from './CategoryForm';
import './AdminCategories.css';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Ver Todas' },
  { value: 'visible', label: 'Somente Visiveis' },
  { value: 'hidden', label: 'Somente Ocultas' }
];

const AdminCategories = () => {
  const { mainCategories, subCategories, products, categoriesHook, addToast } = useAdmin();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const statusDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!statusDropdownRef.current?.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreate = (isSub = false) => {
    setEditingCategory(isSub ? { parent_id: mainCategories[0]?.id || true } : null);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    let result;

    try {
      if (editingCategory && editingCategory.id) {
        result = await categoriesHook.updateCategory(editingCategory.id, formData);
      } else {
        result = await categoriesHook.createCategory(formData);
      }
    } finally {
      setIsSubmitting(false);
    }

    if (result.success) {
      addToast(editingCategory?.id ? 'Categoria atualizada!' : 'Categoria criada!');
      setShowModal(false);
    } else {
      addToast(result.error, 'error');
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    const result = await categoriesHook.deleteCategory(categoryToDelete.id);
    if (result.success) {
      addToast('Categoria excluida!');
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } else {
      addToast(result.error, 'error');
    }
  };

  const handleToggleVisibility = async (category) => {
    const data = new FormData();
    data.append('is_visible', !category.is_visible);
    data.append('name', category.name);
    data.append('slug', category.slug);
    if (category.parent_id) data.append('parent_id', category.parent_id);

    const result = await categoriesHook.updateCategory(category.id, data);
    if (result.success) {
      addToast(`Categoria ${!category.is_visible ? 'visivel' : 'oculta'}!`);
    } else {
      addToast(result.error, 'error');
    }
  };

  return (
    <div className="admin-categories">
      <div className="admin-card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <h2><Layers size={20} /> Gerenciar Categorias</h2>

            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="filter-group">
              <div className="filter-control filter-control-status" ref={statusDropdownRef}>
                <button
                  type="button"
                  className={`filter-control-status-trigger ${isStatusDropdownOpen ? 'is-open' : ''}`}
                  onClick={() => setIsStatusDropdownOpen((current) => !current)}
                  aria-haspopup="listbox"
                  aria-expanded={isStatusDropdownOpen}
                >
                  <div className="filter-control-icon">
                    <Filter size={14} />
                  </div>
                  <div className="filter-control-copy">
                    <span className="filter-control-label">Status</span>
                    <span className="filter-control-value">
                      {STATUS_OPTIONS.find((option) => option.value === filterStatus)?.label}
                    </span>
                  </div>
                  <ChevronDown size={16} className="filter-control-chevron-icon" />
                </button>

                {isStatusDropdownOpen && (
                  <div className="filter-control-status-menu" role="listbox" aria-label="Filtrar categorias por status">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`filter-control-status-option ${filterStatus === option.value ? 'is-selected' : ''}`}
                        onClick={() => {
                          setFilterStatus(option.value);
                          setIsStatusDropdownOpen(false);
                        }}
                      >
                        <span>{option.label}</span>
                        {filterStatus === option.value && <Check size={15} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={() => handleCreate(false)}>
              <Plus size={18} /> Nova Categoria
            </button>
            <button className="btn-secondary" onClick={() => handleCreate(true)}>
              <Plus size={18} /> Nova Subcategoria
            </button>
          </div>
        </div>
        <div className="card-body">
          <CategoryTable
            mainCategories={mainCategories}
            subCategories={subCategories}
            products={products}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onToggleVisibility={handleToggleVisibility}
          />
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ maxWidth: '500px' }}
            >
              <div className="modal-header">
                <h3>{editingCategory?.id ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <CategoryForm
                initialData={editingCategory?.id ? editingCategory : null}
                mainCategories={mainCategories}
                onSubmit={handleSubmit}
                onCancel={() => setShowModal(false)}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                <h3>Excluir Categoria?</h3>
                <p>Tem certeza que deseja excluir <strong>{categoryToDelete?.name}</strong>?</p>
                <p style={{ fontSize: '0.85rem', color: '#ef4444', marginTop: '10px' }}>
                  Atencao: produtos vinculados a esta categoria ficarao "Sem Categoria".
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                <button className="btn-primary" style={{ backgroundColor: 'var(--admin-danger)' }} onClick={confirmDelete}>Sim, Excluir</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategories;
