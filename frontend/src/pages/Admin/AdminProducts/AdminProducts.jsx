import React, { useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../../context/AdminContext';
import ProductTable from './ProductTable';
import ProductForm from './ProductForm';
import './AdminProducts.css';

const normalizeProductName = (value) => (value || '').trim().toLocaleLowerCase('pt-BR');

const AdminProducts = () => {
  const { products, categories, mainCategories, subCategories, productsHook, addToast } = useAdmin();
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSessionKey, setFormSessionKey] = useState(0);
  const [isProductListCollapsed, setIsProductListCollapsed] = useState(false);

  const handleCreate = () => {
    setEditingProduct(null);
    setFormSessionKey((current) => current + 1);
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
    if (isSubmitting) return;

    const incomingName = normalizeProductName(formData.get('name'));
    const duplicateProduct = products.find((product) => (
      normalizeProductName(product.name) === incomingName
      && product.id !== editingProduct?.id
    ));

    if (duplicateProduct) {
      addToast('Ja existe um produto com esse nome.', 'error');
      return;
    }

    setIsSubmitting(true);
    let result;

    try {
      if (editingProduct) {
        result = await productsHook.updateProduct(editingProduct.id, formData);
      } else {
        result = await productsHook.createProduct(formData);
      }
    } finally {
      setIsSubmitting(false);
    }

    if (result.success) {
      addToast(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');

      if (editingProduct) {
        setEditingProduct(null);
        setFormSessionKey((current) => current + 1);
      } else {
        handleCreate();
      }
    } else {
      addToast(result.error, 'error');
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
  };

  return (
    <div className="admin-products">
      <div className={`admin-products-layout ${isProductListCollapsed ? 'is-list-collapsed' : ''}`}>
        <AnimatePresence initial={false}>
          {!isProductListCollapsed && (
            <motion.aside
              className="admin-products-sidebar"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
            >
              <ProductTable
                products={products}
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                selectedProductId={editingProduct?.id || null}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        <motion.section
          className="admin-products-content"
          key={editingProduct ? `edit-${editingProduct.id}-${formSessionKey}` : `create-${formSessionKey}`}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="admin-card product-form-card">
            <div className="card-header product-form-header">
              <div>
                <h2>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
                <p>
                  {editingProduct
                    ? 'Atualize os dados do produto selecionado e use o botao ao lado para recolher ou reabrir a lista.'
                    : 'Cadastre um novo produto e controle a lista de produtos pelo botao ao lado.'}
                </p>
              </div>
              <div className="product-form-header-actions">
                <button
                  type="button"
                  className="btn-secondary product-list-toggle"
                  onClick={() => setIsProductListCollapsed((current) => !current)}
                  aria-expanded={!isProductListCollapsed}
                  aria-label={isProductListCollapsed ? 'Mostrar lista de produtos' : 'Recolher lista de produtos'}
                >
                  {isProductListCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                  {isProductListCollapsed ? 'Mostrar Lista' : 'Recolher Lista'}
                </button>
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
                isSubmitting={isSubmitting}
                onValidationError={(message) => addToast(message, 'error')}
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
