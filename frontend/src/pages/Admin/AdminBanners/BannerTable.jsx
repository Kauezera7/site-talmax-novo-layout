import React from 'react';
import { Edit, Trash2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';

const BannerTable = ({ banners, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Imagem</th>
            <th>Título</th>
            <th>Ordem</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {banners.map(banner => (
            <tr key={banner.id}>
              <td>
                <div style={{ width: '120px', height: '50px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
                  <img 
                    src={banner.image_url} 
                    alt={banner.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              </td>
              <td>{banner.title || <span style={{color: '#ccc'}}>Sem título</span>}</td>
              <td>{banner.display_order}</td>
              <td>
                <span 
                  className={`badge ${banner.active ? 'badge-blue' : 'badge-secondary'}`} 
                  onClick={() => onToggleStatus(banner)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content', margin: '0 auto' }}
                >
                  {banner.active ? <Eye size={12} /> : <EyeOff size={12} />}
                  {banner.active ? 'ATIVO' : 'INATIVO'}
                </span>
              </td>
              <td className="actions-cell">
                <button className="btn-icon edit" title="Editar" onClick={() => onEdit(banner)}><Edit size={16} /></button>
                <button className="btn-icon delete" title="Excluir" onClick={() => onDelete(banner)}><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
          {banners.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-light)' }}>
                Nenhum banner cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BannerTable;
