import React, { useEffect, useState } from 'react';
import { Plus, Layout, AlertCircle, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../../context/AdminContext';
import homeService from '../../../services/homeService';
import SegmentTable from './SegmentTable';
import SegmentForm from './SegmentForm';
import './AdminSegments.css';

const AdminSegments = () => {
  const { addToast } = useAdmin();
  const [segments, setSegments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [segmentToDelete, setSegmentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchSegments = async () => {
    setIsLoading(true);
    try {
      const data = await homeService.getAll();
      setSegments(data);
    } catch (error) {
      console.error('Erro ao carregar segmentos:', error);
      addToast('Erro ao carregar segmentos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const handleCreate = () => {
    setEditingSegment(null);
    setShowModal(true);
  };

  const handleEdit = (segment) => {
    setEditingSegment(segment);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingSegment && editingSegment.id) {
        await homeService.update(editingSegment.id, formData);
        addToast('Segmento atualizado com sucesso!');
      } else {
        await homeService.create(formData);
        addToast('Segmento criado com sucesso!');
      }
      setShowModal(false);
      fetchSegments();
    } catch (error) {
      console.error('Erro ao salvar segmento:', error);
      addToast(error.message || 'Erro ao salvar segmento', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (segment) => {
    setSegmentToDelete(segment);
    setShowDeleteModal(true);
  };

  const handleToggleStatus = async (segment) => {
    if (togglingId === segment.id) return;

    try {
      setTogglingId(segment.id);
      const nextStatus = !segment.active;
      await homeService.updateActiveStatus(segment.id, nextStatus);
      addToast(nextStatus ? 'Segmento ativado com sucesso!' : 'Segmento ocultado com sucesso!');
      fetchSegments();
    } catch (error) {
      console.error('Erro ao atualizar status do segmento:', error);
      addToast(error.message || 'Erro ao atualizar status do segmento', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!segmentToDelete) return;

    try {
      await homeService.delete(segmentToDelete.id);
      addToast('Segmento excluido com sucesso!');
      setShowDeleteModal(false);
      setSegmentToDelete(null);
      fetchSegments();
    } catch (error) {
      console.error('Erro ao excluir segmento:', error);
      addToast(error.message || 'Erro ao excluir segmento', 'error');
    }
  };

  const filteredSegments = segments.filter((segment) =>
    segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-segments">
      <div className="admin-card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <h2><Layout size={20} /> Gerenciar Segmentos (Cards Home)</h2>

            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar segmento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <button className="btn-secondary" onClick={handleCreate}>
            <Plus size={18} /> Novo Segmento
          </button>
        </div>

        <div className="card-body">
          {isLoading ? (
            <div className="loading-container">Carregando segmentos...</div>
          ) : (
            <SegmentTable
              segments={filteredSegments}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onToggleStatus={handleToggleStatus}
              togglingId={togglingId}
            />
          )}
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
              style={{ maxWidth: '600px', width: '95%' }}
            >
              <div className="modal-header">
                <h3>{editingSegment?.id ? 'Editar Segmento' : 'Novo Segmento'}</h3>
                <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <SegmentForm
                initialData={editingSegment}
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
                <h3>Excluir Segmento?</h3>
                <p>Tem certeza que deseja excluir o segmento <strong>{segmentToDelete?.name}</strong>?</p>
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '10px' }}>
                  Esta acao nao podera ser desfeita.
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

export default AdminSegments;
