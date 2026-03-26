import React, { useState, useMemo, useEffect } from 'react';
import { Edit, Trash2, Eye, EyeOff, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { apiAssetPath } from '../../../utils/assets';

const CategoryTable = ({ mainCategories, subCategories, products, searchTerm, filterStatus, onEdit, onDelete, onToggleVisibility }) => {
  const [expandedCategories, setExpandedCategories] = useState({});

  // Auto-expand categories when searching
  useEffect(() => {
    if (searchTerm) {
      const newExpanded = {};
      mainCategories.forEach(cat => {
        const hasMatchingSub = subCategories.some(sub => 
          Number(sub.parent_id) === Number(cat.id) && 
          sub.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (hasMatchingSub || cat.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          newExpanded[cat.id] = true;
        }
      });
      setExpandedCategories(newExpanded);
    }
  }, [searchTerm, mainCategories, subCategories]);

  const toggleExpand = (id) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getProductCount = (categoryId) => {
    return products.filter((p) => p.category_ids && p.category_ids.includes(categoryId)).length;
  };

  const filteredAndSortedCategories = useMemo(() => {
    let result = [...mainCategories];

    // 1. Filter by Status
    if (filterStatus === 'visible') {
      result = result.filter(cat => cat.is_visible);
    } else if (filterStatus === 'hidden') {
      result = result.filter(cat => !cat.is_visible);
    }

    // 2. Filter by Search Term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(cat => {
        const matchesMain = cat.name.toLowerCase().includes(term);
        const hasMatchingSub = subCategories.some(sub => 
          Number(sub.parent_id) === Number(cat.id) && 
          sub.name.toLowerCase().includes(term)
        );
        return matchesMain || hasMatchingSub;
      });
    }

    return result;
  }, [mainCategories, subCategories, searchTerm, filterStatus, products]);

  const getFilteredSubcategories = (parentId) => {
    let subs = subCategories.filter((sub) => Number(sub.parent_id) === Number(parentId));
    
    // Filter by status
    if (filterStatus === 'visible') {
      subs = subs.filter(sub => sub.is_visible);
    } else if (filterStatus === 'hidden') {
      subs = subs.filter(sub => !sub.is_visible);
    }

    if (!searchTerm) return subs;

    const term = searchTerm.toLowerCase();
    const parentMatches = mainCategories.find(c => c.id === parentId)?.name.toLowerCase().includes(term);
    
    if (parentMatches) return subs;
    
    return subs.filter(sub => sub.name.toLowerCase().includes(term));
  };

  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Icone / Nome</th>
            <th>Slug</th>
            <th>Status</th>
            <th>Produtos</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedCategories.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                Nenhuma categoria encontrada
              </td>
            </tr>
          ) : (
            filteredAndSortedCategories.map((cat) => (
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
                        {cat.icon_url ? <img src={apiAssetPath(cat.icon_url)} alt={cat.name} /> : <ImageIcon size={20} color="#94a3b8" />}
                      </div>
                      <strong>{cat.name}</strong>
                    </div>
                  </td>
                  <td><code>{cat.slug}</code></td>
                  <td>
                    <span
                      className={`status-badge ${cat.is_visible ? 'status-active' : 'status-inactive'}`}
                      onClick={() => onToggleVisibility(cat)}
                    >
                      {cat.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                      {cat.is_visible ? 'Visivel' : 'Oculta'}
                    </span>
                  </td>
                  <td>{getProductCount(cat.id)}</td>
                  <td className="actions-cell">
                    <button className="btn-icon edit" onClick={() => onEdit(cat)}><Edit size={16} /></button>
                    <button className="btn-icon delete" onClick={() => onDelete(cat)}><Trash2 size={16} /></button>
                  </td>
                </tr>

                {expandedCategories[cat.id] && getFilteredSubcategories(cat.id).map((subCat) => (
                    <tr key={subCat.id} className="subcategory-row">
                      <td style={{ paddingLeft: '60px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--admin-primary)' }} />
                          {subCat.name}
                        </div>
                      </td>
                      <td><code>{subCat.slug}</code></td>
                      <td>
                        <span
                          className={`status-badge ${subCat.is_visible ? 'status-active' : 'status-inactive'}`}
                          onClick={() => onToggleVisibility(subCat)}
                        >
                          {subCat.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                          {subCat.is_visible ? 'Visivel' : 'Oculta'}
                        </span>
                      </td>
                      <td>{getProductCount(subCat.id)}</td>
                      <td className="actions-cell">
                        <button className="btn-icon edit" onClick={() => onEdit(subCat)}><Edit size={16} /></button>
                        <button className="btn-icon delete" onClick={() => onDelete(subCat)}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
