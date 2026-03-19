import React, { useState } from 'react';
import { Plus, Package, AlertCircle, X, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../../context/AdminContext';
import ProductTable from './ProductTable';
import ProductForm from './ProductForm';

const AdminProducts = () => {
  const { products, categories, mainCategories, subCategories, productsHook, addToast } = useAdmin();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const result = await productsHook.deleteProduct(productToDelete.id);
    if (result.success) {
      addToast('Produto excluído com sucesso!');
      setShowDeleteModal(false);
    } else {
      addToast(result.error, 'error');
    }
  };

  const handleSubmit = async (formData) => {
    let result;
    if (editingProduct) {
      result = await productsHook.updateProduct(editingProduct.id, formData);
    } else {
      result = await productsHook.createProduct(formData);
    }

    if (result.success) {
      addToast(editingProduct ? 'Produto atualizado!' : 'Produto cadastrado!');
      setIsCreating(false);
      setEditingProduct(null);
    } else {
      addToast(result.error, 'error');
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingProduct(null);
  };

  return (
    <div className="admin-products">
      {!isCreating ? (
        <div className="admin-actions-bar" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={() => setIsCreating(true)}>
            <Plus size={18} /> Novo Produto
          </button>
        </div>
      ) : (
        <div className="admin-actions-bar" style={{ marginBottom: '20px' }}>
          <button className="btn-secondary" onClick={handleCancel} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ChevronLeft size={18} /> Voltar para a Lista
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {isCreating ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="admin-card">
              <div className="card-header">
                <h2>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
              </div>
              <div className="card-body">
                <ProductForm 
                  initialData={editingProduct}
                  categories={categories}
                  mainCategories={mainCategories}
                  subCategories={subCategories}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="table"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <ProductTable 
              products={products}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          </motion.div>
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
                <h3>Excluir Produto?</h3>
                <p>Tem certeza que deseja excluir o produto <strong>{productToDelete?.name}</strong>?</p>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '10px' }}>
                  Esta ação é irreversível.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                <button className="btn-primary" style={{backgroundColor: 'var(--admin-danger)'}} onClick={confirmDelete}>Sim, Excluir</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
