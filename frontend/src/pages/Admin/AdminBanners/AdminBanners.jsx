import React, { useState } from 'react';
import { Plus, Image as ImageIcon, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../../context/AdminContext';
import BannerTable from './BannerTable';
import BannerForm from './BannerForm';

const AdminBanners = () => {
  const { banners, bannersHook, addToast } = useAdmin();
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  const handleCreate = () => {
    setEditingBanner(null);
    setShowModal(true);
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    let result;
    if (editingBanner) {
      result = await bannersHook.updateBanner(editingBanner.id, formData);
    } else {
      result = await bannersHook.createBanner(formData);
    }

    if (result.success) {
      addToast(editingBanner ? 'Banner atualizado!' : 'Banner criado!');
      setShowModal(false);
    } else {
      addToast(result.error, 'error');
    }
  };

  const handleDeleteClick = (banner) => {
    setBannerToDelete(banner);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const result = await bannersHook.deleteBanner(bannerToDelete.id);
    if (result.success) {
      addToast('Banner excluído!');
      setShowDeleteModal(false);
    } else {
      addToast(result.error, 'error');
    }
  };

  const handleToggleStatus = async (banner) => {
    const data = new FormData();
    data.append('active', !banner.active);
    data.append('title', banner.title || '');
    
    const result = await bannersHook.updateBanner(banner.id, data);
    if (result.success) {
      addToast(`Banner ${!banner.active ? 'ativado' : 'desativado'}!`);
    } else {
      addToast(result.error, 'error');
    }
  };

  return (
    <div className="admin-banners">
      <div className="admin-card">
        <div className="card-header">
          <h2><ImageIcon size={20} /> Gerenciar Banners</h2>
          <button className="btn-primary" onClick={handleCreate}>
            <Plus size={18} /> Novo Banner
          </button>
        </div>
        <div className="card-body">
          <BannerTable 
            banners={banners} 
            onEdit={handleEdit} 
            onDelete={handleDeleteClick}
            onToggleStatus={handleToggleStatus}
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
            >
              <div className="modal-header">
                <h3>{editingBanner ? 'Editar Banner' : 'Novo Banner'}</h3>
                <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <BannerForm 
                initialData={editingBanner}
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
                <h3>Excluir Banner?</h3>
                <p>Tem certeza que deseja remover este banner? Esta ação não pode ser desfeita.</p>
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

export default AdminBanners;
