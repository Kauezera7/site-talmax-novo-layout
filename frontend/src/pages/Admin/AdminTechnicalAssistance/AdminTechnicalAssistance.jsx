import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Wrench,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../../context/AdminContext';
import technicalAssistanceService from '../../../services/technicalAssistanceService';
import './AdminTechnicalAssistance.css';

const buildEmptyForm = () => ({
  company: '',
  address: '',
  city: '',
  state_code: '',
  phone: '',
  phone_2: '',
  phone_3: '',
  email: '',
  map_url: '',
  site_url: ''
});

const normalizeFormValue = (field, value) => {
  if (field === 'state_code') {
    return String(value || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
  }

  return value;
};

const AdminTechnicalAssistance = () => {
  const { addToast } = useAdmin();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(buildEmptyForm());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadItems = async () => {
    setIsLoading(true);

    try {
      const data = await technicalAssistanceService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar cards da assistencia tecnica:', error);
      addToast(error.message || 'Erro ao carregar cards da assistencia tecnica', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return items;
    }

    return items.filter((item) => (
      [
        item.company,
        item.address,
        item.city,
        item.state_code,
        item.phone,
        item.phone_2,
        item.phone_3,
        item.email
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)
    ));
  }, [items, searchTerm]);

  const resetForm = () => {
    setForm(buildEmptyForm());
    setEditingItem(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({
      company: item.company || '',
      address: item.address || '',
      city: item.city || '',
      state_code: item.state_code || '',
      phone: item.phone || '',
      phone_2: item.phone_2 || '',
      phone_3: item.phone_3 || '',
      email: item.email || '',
      map_url: item.map_url || '',
      site_url: item.site_url || ''
    });
    setShowModal(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleInputChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: normalizeFormValue(field, value)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingItem?.id) {
        await technicalAssistanceService.update(editingItem.id, form);
        addToast('Card de assistencia tecnica atualizado com sucesso!');
      } else {
        await technicalAssistanceService.create(form);
        addToast('Card de assistencia tecnica criado com sucesso!');
      }

      setShowModal(false);
      resetForm();
      await loadItems();
    } catch (error) {
      console.error('Erro ao salvar card de assistencia tecnica:', error);
      addToast(error.message || 'Erro ao salvar card de assistencia tecnica', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete?.id) {
      return;
    }

    try {
      await technicalAssistanceService.remove(itemToDelete.id);
      addToast('Card de assistencia tecnica removido com sucesso!');
      setShowDeleteModal(false);
      setItemToDelete(null);
      await loadItems();
    } catch (error) {
      console.error('Erro ao excluir card de assistencia tecnica:', error);
      addToast(error.message || 'Erro ao excluir card de assistencia tecnica', 'error');
    }
  };

  return (
    <div className="admin-technical-assistance">
      <div className="admin-card">
        <div className="card-header admin-technical-assistance__header">
          <div className="admin-technical-assistance__header-copy">
            <h2><Wrench size={20} /> Assistencia Tecnica</h2>
            <p>Cadastre e remova os cards da pagina publica com empresa, endereco, contatos e URLs de mapa/site.</p>
          </div>

          <div className="admin-technical-assistance__toolbar">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar card..."
              />
              {searchTerm && (
                <button type="button" className="clear-search" onClick={() => setSearchTerm('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <button type="button" className="btn-secondary" onClick={handleCreate}>
              <Plus size={18} />
              Novo card
            </button>
          </div>
        </div>

        <div className="card-body">
          {isLoading ? (
            <div className="loading-container">Carregando cards da assistencia tecnica...</div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <Wrench size={32} />
              <p>Nenhum card cadastrado para a pagina de assistencia tecnica.</p>
            </div>
          ) : (
            <div className="admin-technical-assistance__grid">
              {filteredItems.map((item) => {
                const locationLabel = [item.city, item.state_code].filter(Boolean).join(' - ');
                const detailItems = [
                  item.address
                    ? { key: 'address', icon: MapPin, text: item.address, title: item.address }
                    : null,
                  item.phone
                    ? { key: 'phone', icon: Phone, text: item.phone, title: item.phone }
                    : null,
                  item.phone_2
                    ? { key: 'phone_2', icon: Phone, text: item.phone_2, title: item.phone_2 }
                    : null,
                  item.phone_3
                    ? { key: 'phone_3', icon: Phone, text: item.phone_3, title: item.phone_3 }
                    : null,
                  item.email
                    ? { key: 'email', icon: Mail, text: item.email, title: item.email }
                    : null,
                  item.map_url
                    ? { key: 'map_url', icon: MapPin, text: 'Mapa configurado', title: item.map_url }
                    : null,
                  item.site_url
                    ? { key: 'site_url', icon: Globe, text: 'Site configurado', title: item.site_url }
                    : null
                ].filter(Boolean);

                return (
                  <article key={item.id} className="admin-technical-assistance__card">
                    <div className="admin-technical-assistance__card-head">
                      {item.state_code && (
                        <span className="admin-technical-assistance__state-tag">{item.state_code}</span>
                      )}
                      <h3 title={item.company}>{item.company}</h3>
                      {locationLabel && <p>{locationLabel}</p>}
                    </div>

                    <div className="admin-technical-assistance__details">
                      {detailItems.map(({ key, icon: Icon, text, title }) => (
                        <span
                          key={key}
                          className="admin-technical-assistance__detail"
                          title={title}
                        >
                          <Icon size={15} />
                          <span>{text}</span>
                        </span>
                      ))}
                    </div>

                    <div className="admin-technical-assistance__actions">
                      <button type="button" className="btn-secondary" onClick={() => handleEdit(item)}>
                        <Pencil size={16} />
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn-secondary admin-technical-assistance__danger-button"
                        onClick={() => handleDeleteClick(item)}
                      >
                        <Trash2 size={16} />
                        Excluir
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div
              className="modal-content admin-technical-assistance__modal"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
            >
              <div className="modal-header">
                <h3>{editingItem?.id ? 'Editar card' : 'Novo card de assistencia tecnica'}</h3>
                <button type="button" className="btn-icon" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body admin-technical-assistance__modal-body">
                  <div className="admin-technical-assistance__form-grid">
                    <div className="form-group admin-technical-assistance__form-group--full">
                      <label>Empresa</label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(event) => handleInputChange('company', event.target.value)}
                        placeholder="Nome da empresa"
                        required
                      />
                    </div>

                    <div className="form-group admin-technical-assistance__form-group--full">
                      <label>Endereco</label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(event) => handleInputChange('address', event.target.value)}
                        placeholder="Rua, numero e complemento"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Cidade</label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(event) => handleInputChange('city', event.target.value)}
                        placeholder="Cidade"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>UF</label>
                      <input
                        type="text"
                        value={form.state_code}
                        onChange={(event) => handleInputChange('state_code', event.target.value)}
                        placeholder="PR"
                        maxLength={2}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Telefone</label>
                      <input
                        type="text"
                        value={form.phone}
                        onChange={(event) => handleInputChange('phone', event.target.value)}
                        placeholder="Telefone principal"
                      />
                    </div>

                    <div className="form-group">
                      <label>Telefone 2</label>
                      <input
                        type="text"
                        value={form.phone_2}
                        onChange={(event) => handleInputChange('phone_2', event.target.value)}
                        placeholder="Segundo telefone"
                      />
                    </div>

                    <div className="form-group">
                      <label>Telefone 3</label>
                      <input
                        type="text"
                        value={form.phone_3}
                        onChange={(event) => handleInputChange('phone_3', event.target.value)}
                        placeholder="Terceiro telefone"
                      />
                    </div>

                    <div className="form-group admin-technical-assistance__form-group--full">
                      <label>E-mail</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) => handleInputChange('email', event.target.value)}
                        placeholder="contato@empresa.com.br"
                      />
                    </div>

                    <div className="form-group admin-technical-assistance__form-group--full">
                      <label>Mapa</label>
                      <input
                        type="url"
                        value={form.map_url}
                        onChange={(event) => handleInputChange('map_url', event.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="form-group admin-technical-assistance__form-group--full">
                      <label>Site</label>
                      <input
                        type="url"
                        value={form.site_url}
                        onChange={(event) => handleInputChange('site_url', event.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Salvar card'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <div className="modal-overlay">
            <motion.div
              className="modal-content"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
            >
              <div className="modal-body">
                <div className="modal-icon">
                  <AlertCircle size={32} />
                </div>
                <h3>Excluir card?</h3>
                <p>Deseja remover o card da empresa <strong>{itemToDelete?.company}</strong>?</p>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-primary admin-technical-assistance__danger-button"
                  onClick={confirmDelete}
                >
                  Sim, excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTechnicalAssistance;
