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
      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ width: '100px' }}>Imagem</th>
            <th>Nome</th>
            <th>Descricao</th>
            <th style={{ width: '80px', textAlign: 'center' }}>Ordem</th>
            <th style={{ width: '120px', textAlign: 'center' }}>Status</th>
            <th style={{ width: '120px', textAlign: 'center' }}>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((segment) => (
            <tr key={segment.id}>
              <td>
                <div className="table-img-wrapper" style={{ width: '80px', height: '45px', borderRadius: '6px', overflow: 'hidden' }}>
                  <img
                    src={segment.image_url ? apiAssetPath(segment.image_url) : assetPath('img/placeholder.png')}
                    alt={segment.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = assetPath('img/placeholder.png');
                    }}
                  />
                </div>
              </td>
              <td>
                <span style={{ fontWeight: 700, color: 'var(--admin-text)' }}>{segment.name}</span>
              </td>
              <td>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--admin-text-light)',
                    maxWidth: '300px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    margin: 0
                  }}
                >
                  {segment.description || '-'}
                </p>
              </td>
              <td style={{ textAlign: 'center' }}>
                <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {segment.display_order}
                </span>
              </td>
              <td style={{ textAlign: 'center' }}>
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
              <td className="actions-cell">
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
