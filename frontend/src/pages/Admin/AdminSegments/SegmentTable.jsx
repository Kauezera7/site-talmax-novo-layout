import React from 'react';
import { Edit2, Trash2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { apiAssetPath, assetPath } from '../../../utils/assets';

const SegmentTable = ({ segments, onEdit, onDelete, onToggleStatus, togglingId }) => {
  if (segments.length === 0) {
    return (
      <div className="empty-state">
        <ImageIcon size={48} />
        <p>Nenhum segmento encontrado.</p>
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      <table className="admin-table admin-segments-table">
        <colgroup>
          <col style={{ width: '160px' }} />
          <col />
          <col style={{ width: '100px' }} />
          <col style={{ width: '70px' }} />
          <col style={{ width: '250px' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Imagem</th>
            <th>Nome</th>
            <th>Ordem</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((segment) => (
            <tr key={segment.id}>
              <td>
                <div className="admin-segments-table__image">
                  <img
                    src={segment.image_url ? apiAssetPath(segment.image_url) : assetPath('img/placeholder.png')}
                    alt={segment.name}
                    className="admin-segments-table__image-content"
                    onError={(e) => {
                      e.target.src = assetPath('img/placeholder.png');
                    }}
                  />
                </div>
              </td>
              <td className="admin-segments-table__name-cell">
                <div className="admin-segments-table__name-group">
                  <span className="admin-segments-table__name">{segment.name}</span>
                  <span
                    className="admin-segments-table__link"
                    title={segment.link_url || '-'}
                  >
                    {segment.link_url || '-'}
                  </span>
                </div>
              </td>
              <td className="admin-segments-table__order-cell">
                <span className="admin-segments-table__order-badge">
                  {segment.display_order}
                </span>
              </td>
              <td className="admin-segments-table__status-cell">
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
              </td>
              <td className="actions-cell admin-segments-table__actions-cell">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SegmentTable;
