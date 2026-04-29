import React from 'react';
import { Check, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon, X } from 'lucide-react';
import { apiAssetPath } from '../../../utils/assets';

const SegmentTable = ({
  segments,
  onEdit,
  onDelete,
  onToggleStatus,
  togglingId,
  editingOrderId,
  orderDrafts,
  savingOrderId,
  onOrderEditStart,
  onOrderDraftChange,
  onOrderSave,
  onOrderEditCancel
}) => {
  if (segments.length === 0) {
    return (
      <div className="empty-state">
        <ImageIcon size={48} />
        <p>Nenhum segmento encontrado.</p>
      </div>
    );
  }

  return (
    <div className="admin-segments-grid">
      {segments.map((segment) => (
        <article key={segment.id} className="admin-segments-card">
          <div className="admin-segments-card__media">
            {segment.image_url && (
              <img
                src={apiAssetPath(segment.image_url)}
                alt={segment.name}
                className="admin-segments-card__image"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            )}
            {editingOrderId === segment.id ? (
              <div className="admin-segments-card__order-editor">
                <input
                  type="number"
                  min="0"
                  value={orderDrafts[segment.id] ?? ''}
                  className="admin-segments-card__order-input"
                  onChange={(event) => onOrderDraftChange(segment.id, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      onOrderSave(segment);
                    }

                    if (event.key === 'Escape') {
                      event.preventDefault();
                      onOrderEditCancel(segment.id);
                    }
                  }}
                  onBlur={() => onOrderSave(segment)}
                  autoFocus
                  disabled={savingOrderId === segment.id}
                />
                <button
                  type="button"
                  className="admin-segments-card__order-action"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onOrderSave(segment)}
                  disabled={savingOrderId === segment.id}
                  title="Salvar ordem"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  className="admin-segments-card__order-action is-cancel"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onOrderEditCancel(segment.id)}
                  disabled={savingOrderId === segment.id}
                  title="Cancelar edicao"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="admin-segments-card__order-badge"
                onClick={() => onOrderEditStart(segment)}
                title="Clique para editar a ordem"
              >
                Ordem {segment.display_order}
              </button>
            )}
          </div>

          <div className="admin-segments-card__body">
            <div className="admin-segments-card__copy">
              <h3 className="admin-segments-card__name">{segment.name}</h3>
              {segment.description ? (
                <p className="admin-segments-card__description">{segment.description}</p>
              ) : (
                <p className="admin-segments-card__description is-empty">Sem descricao cadastrada.</p>
              )}
              <span className="admin-segments-card__link" title={segment.link_url || '-'}>
                {segment.link_url || '-'}
              </span>
            </div>

            <div className="admin-segments-card__footer">
              <button
                type="button"
                className={`status-badge ${segment.active ? 'status-active' : 'status-inactive'}${togglingId === segment.id ? ' is-toggling' : ''}`}
                onClick={() => onToggleStatus(segment)}
                disabled={togglingId === segment.id}
                title={segment.active ? 'Clique para ocultar o segmento' : 'Clique para ativar o segmento'}
              >
                {segment.active ? <Eye size={12} /> : <EyeOff size={12} />}
                {segment.active ? 'Ativo' : 'Oculto'}
              </button>

              <div className="admin-segments-card__actions">
                <button
                  className="btn-icon edit"
                  onClick={() => onEdit(segment)}
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="btn-icon delete"
                  onClick={() => onDelete(segment)}
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default SegmentTable;
