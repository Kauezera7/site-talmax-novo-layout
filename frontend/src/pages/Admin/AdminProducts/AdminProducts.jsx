import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../../context/AdminContext';
import ProductTable from './ProductTable';
import ProductForm from './ProductForm';
import './AdminProducts.css';

const AdminProducts = () => {
  const { products, categories, mainCategories, subCategories, productsHook, addToast } = useAdmin();
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const handleCreate = () => {
    setEditingProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    const result = await productsHook.deleteProduct(productToDelete.id);
    if (result.success) {
      addToast('Produto excluido com sucesso!');
      setShowDeleteModal(false);
      setProductToDelete(null);

      if (editingProduct?.id === productToDelete.id) {
        setEditingProduct(null);
      }
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
      setEditingProduct(null);
    } else {
      addToast(result.error, 'error');
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
  };

  return (
    <div className="admin-products">
      <div className="admin-products-layout">
        <motion.aside
          className="admin-products-sidebar"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ProductTable
            products={products}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            selectedProductId={editingProduct?.id || null}
          />
        </motion.aside>

        <motion.section
          className="admin-products-content"
          key={editingProduct ? `edit-${editingProduct.id}` : 'create'}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="admin-card product-form-card">
            <div className="card-header product-form-header">
              <div>
                <h2>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
                <p>
                  {editingProduct
                    ? 'Atualize os dados do produto selecionado na lista lateral.'
                    : 'Cadastre um novo produto mantendo a lista de produtos sempre visivel ao lado.'}
                </p>
              </div>
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
        </motion.section>
      </div>

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
                <p className="product-delete-warning">Esta acao e irreversivel.</p>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                <button className="btn-primary admin-danger-button" onClick={confirmDelete}>Sim, Excluir</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
