import React, { useState } from 'react';
import { Edit, Trash2, Search, List, Plus } from 'lucide-react';
import { apiAssetPath, assetPath } from '../../../utils/assets';

const ProductTable = ({ products, onCreate, onEdit, onDelete, selectedProductId }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toString().includes(searchTerm) ||
    (product.category_names && product.category_names.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="admin-card">
      <div className="card-header product-list-header">
        <div>
          <h2><List size={20} /> Lista de Produtos</h2>
          <p>{filteredProducts.length} item(ns) encontrados</p>
        </div>
        <button className="btn-primary product-list-create" onClick={onCreate}>
          <Plus size={16} /> Novo
        </button>
      </div>

      <div className="product-list-search">
        <Search size={16} className="product-search-icon" />
        <input
          type="text"
          placeholder="Buscar por nome, ID ou categoria..."
          className="product-search-input"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="product-sidebar-list">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`product-sidebar-item ${selectedProductId === product.id ? 'active' : ''}`}
            onClick={() => onEdit(product)}
          >
            <div className="product-cell">
              <img src={product.main_image ? apiAssetPath(product.main_image) : assetPath('img/placeholder.png')} alt={product.name} />
              <div className="product-info">
                <h4>{product.name}</h4>
                <p>ID: #{product.id}</p>
              </div>
            </div>

            <div className="product-badge-container">
              {product.category_names ? (
                product.category_names.split(', ').slice(0, 2).map((category, index) => (
                  <span key={index} className="badge-soft-blue">{category}</span>
                ))
              ) : (
                <span className="badge-soft-blue badge-secondary">Sem categoria</span>
              )}
            </div>

            <div className="product-sidebar-actions">
              <button
                type="button"
                className="btn-icon edit"
                title="Editar"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(product);
                }}
              >
                <Edit size={16} />
              </button>
              <button
                type="button"
                className="btn-icon delete"
                title="Excluir"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(product);
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="product-empty-state">
            Nenhum produto encontrado.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTable;
