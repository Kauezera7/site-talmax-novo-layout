import React, { useState } from 'react';
import { Edit, Trash2, Search, List } from 'lucide-react';

const ProductTable = ({ products, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toString().includes(searchTerm) ||
    (p.category_names && p.category_names.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="admin-card">
      <div className="card-header">
        <h2><List size={20} /> Lista de Produtos</h2>
        <div className="search-box product-search-box">
          <Search size={16} className="product-search-icon" />
          <input
            type="text"
            placeholder="Buscar por nome, ID ou categoria..."
            className="product-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="product-cell">
                    <img src={p.main_image || '/img/placeholder.png'} alt={p.name} />
                    <div className="product-info">
                      <h4>{p.name}</h4>
                      <p>ID: #{p.id}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="product-badge-container">
                    {p.category_names ? p.category_names.split(', ').map((cat, i) => (
                      <span key={i} className="badge-soft-blue">{cat}</span>
                    )) : <span className="badge-soft-blue badge-secondary">Sem categoria</span>}
                  </div>
                </td>
                <td className="actions-cell">
                  <button className="btn-icon edit" title="Editar" onClick={() => onEdit(p)}><Edit size={16} /></button>
                  <button className="btn-icon delete" title="Excluir" onClick={() => onDelete(p)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="3" className="product-empty-state">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
