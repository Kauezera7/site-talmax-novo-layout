import React, { useState } from 'react';
import { Edit, Trash2, Eye, EyeOff, ChevronRight, Image as ImageIcon } from 'lucide-react';

const CategoryTable = ({ mainCategories, subCategories, products, onEdit, onDelete, onToggleVisibility }) => {
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleExpand = (id) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getProductCount = (categoryId) => {
    return products.filter((p) => p.category_ids && p.category_ids.includes(categoryId)).length;
  };

  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Ícone / Nome</th>
            <th>Slug</th>
            <th>Status</th>
            <th>Produtos</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {mainCategories.map((cat) => (
            <React.Fragment key={cat.id}>
              <tr className="main-category-row">
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      className="btn-icon"
                      style={{ width: '24px', height: '24px', border: 'none', background: '#f1f5f9' }}
                      onClick={() => toggleExpand(cat.id)}
                    >
                      <ChevronRight
                        size={16}
                        style={{
                          transform: expandedCategories[cat.id] ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}
                      />
                    </button>
                    <div className="category-icon-cell">
                      {cat.icon_url ? <img src={cat.icon_url} alt={cat.name} /> : <ImageIcon size={20} color="#94a3b8" />}
                    </div>
                    <strong>{cat.name}</strong>
                  </div>
                </td>
                <td><code>{cat.slug}</code></td>
                <td>
                  <span
                    className={`badge ${cat.is_visible ? 'badge-blue' : 'badge-secondary'}`}
                    onClick={() => onToggleVisibility(cat)}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content' }}
                  >
                    {cat.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    {cat.is_visible ? 'VISÍVEL' : 'OCULTA'}
                  </span>
                </td>
                <td>{getProductCount(cat.id)}</td>
                <td className="actions-cell">
                  <button className="btn-icon edit" onClick={() => onEdit(cat)}><Edit size={16} /></button>
                  <button className="btn-icon delete" onClick={() => onDelete(cat)}><Trash2 size={16} /></button>
                </td>
              </tr>

              {expandedCategories[cat.id] && subCategories
                .filter((sub) => Number(sub.parent_id) === Number(cat.id))
                .map((subCat) => (
                  <tr key={subCat.id} className="subcategory-row">
                    <td style={{ paddingLeft: '60px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--admin-primary)' }} />
                        {subCat.name}
                      </div>
                    </td>
                    <td><code>{subCat.slug}</code></td>
                    <td>
                      <button
                        onClick={() => onToggleVisibility(subCat)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: subCat.is_visible ? 'var(--admin-primary)' : 'var(--admin-secondary)', display: 'flex', alignItems: 'center' }}
                      >
                        {subCat.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </td>
                    <td>{getProductCount(subCat.id)}</td>
                    <td className="actions-cell">
                      <button className="btn-icon edit" onClick={() => onEdit(subCat)}><Edit size={16} /></button>
                      <button className="btn-icon delete" onClick={() => onDelete(subCat)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
