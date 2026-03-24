import React from 'react';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { apiAssetPath } from '../../../utils/assets';

const BannerTable = ({ banners, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Imagem</th>
            <th>Titulo</th>
            <th>Ordem</th>
            <th>Status</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {banners.map((banner) => (
            <tr key={banner.id}>
              <td>
                <div className="banner-table-image">
                  <img
                    src={apiAssetPath(banner.image_url)}
                    alt={banner.title}
                    className="banner-table-image-content"
                  />
                </div>
                <div className="banner-image-path">{banner.image_url || 'Sem imagem'}</div>
              </td>
              <td>{banner.title || <span className="banner-empty-title">Sem titulo</span>}</td>
              <td>{banner.display_order}</td>
              <td>
                <span
                  className={`status-badge banner-status-badge ${banner.active ? 'status-active' : 'status-inactive'}`}
                  onClick={() => onToggleStatus(banner)}
                >
                  {banner.active ? <Eye size={12} /> : <EyeOff size={12} />}
                  {banner.active ? 'Ativo' : 'Inativo'}
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
              <td colSpan="5" className="banner-empty-state">
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
