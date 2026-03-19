import React, { useState } from 'react';
import { Plus, Layers, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../../context/AdminContext';
import CategoryTable from './CategoryTable';
import CategoryForm from './CategoryForm';
import './AdminCategories.css';

const AdminCategories = () => {
  const { mainCategories, subCategories, products, categoriesHook, addToast } = useAdmin();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const handleCreate = (isSub = false) => {
    setEditingCategory(isSub ? { parent_id: mainCategories[0]?.id || true } : null);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    let result;
    if (editingCategory && editingCategory.id) {
      result = await categoriesHook.updateCategory(editingCategory.id, formData);
    } else {
      result = await categoriesHook.createCategory(formData);
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
      addToast('Categoria excluída!');
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
      addToast(`Categoria ${!category.is_visible ? 'visível' : 'oculta'}!`);
    } else {
      addToast(result.error, 'error');
    }
  };

  return (
    <div className="admin-categories">
      <div className="admin-card">
        <div className="card-header">
          <h2><Layers size={20} /> Gerenciar Categorias</h2>
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
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onToggleVisibility={handleToggleVisibility}
          />
        </div>
      </div>

      {/* Modal de Formulário */}
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
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                <h3>Excluir Categoria?</h3>
                <p>Tem certeza que deseja excluir <strong>{categoryToDelete?.name}</strong>?</p>
                <p style={{ fontSize: '0.85rem', color: '#ef4444', marginTop: '10px' }}>
                  Atenção: produtos vinculados a esta categoria ficarão "Sem Categoria".
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
