import React, { useEffect, useMemo, useState } from 'react';
import { Search, Save, CheckCircle, ChevronRight } from 'lucide-react';

const SpecialSectionManager = ({
  sectionTitle,
  sectionKey,
  products,
  mainCategories,
  subCategories = [],
  categoryMatcher,
  onSave
}) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCats, setSelectedCats] = useState([]);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  const allowedSubCategoryIds = useMemo(() => {
    if (!categoryMatcher) return [];
    return subCategories
      .filter(categoryMatcher)
      .map((category) => category.id);
  }, [subCategories, categoryMatcher]);

  const scopedProducts = useMemo(() => {
    if (allowedSubCategoryIds.length === 0) {
      return products;
    }

    return products.filter((product) =>
      product.category_ids && product.category_ids.some((id) => allowedSubCategoryIds.includes(id))
    );
  }, [products, allowedSubCategoryIds]);

  const availableMainCategories = useMemo(() => {
    const mainCategoryIds = new Set(
      scopedProducts.flatMap((product) =>
        (product.category_ids || []).filter((id) => mainCategories.some((category) => category.id === id))
      )
    );

    return mainCategories.filter((category) => mainCategoryIds.has(category.id));
  }, [scopedProducts, mainCategories]);

  useEffect(() => {
    const initial = scopedProducts
      .filter((p) => {
        if (sectionKey === 'upcera') return p.is_upcera;
        if (sectionKey === 'scanners') return p.is_scanner;
        if (sectionKey === 'printers') return p.is_3d_printer;
        return false;
      })
      .map((p) => ({
        id: p.id,
        order: (sectionKey === 'upcera' ? p.upcera_order : (sectionKey === 'scanners' ? p.scanner_order : p.printer_order)) || 0
      }));
    setSelectedProducts(initial);
  }, [scopedProducts, sectionKey]);

  const toggleProduct = (product) => {
    const isSelected = selectedProducts.find((sp) => sp.id === product.id);
    if (isSelected) {
      setSelectedProducts(selectedProducts.filter((sp) => sp.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, { id: product.id, order: 0 }]);
    }
  };

  const updateOrder = (id, order) => {
    setSelectedProducts(selectedProducts.map((sp) =>
      sp.id === id ? { ...sp, order: parseInt(order, 10) || 0 } : sp
    ));
  };

  const filteredProducts = scopedProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCats.length === 0 || (p.category_ids && p.category_ids.some((id) => selectedCats.includes(id)));
    return matchesSearch && matchesCat;
  });

  return (
    <div className="admin-card">
      <div className="card-header special-section-header">
        <h2><Search size={20} /> Seleção de {sectionTitle}</h2>
        <button className="btn-primary" onClick={() => onSave(selectedProducts)}>
          <Save size={18} /> Salvar Alterações
        </button>
      </div>
      <div className="card-body special-section-body">
        <div className="admin-form">
          <div className="special-filters-panel">
            <div className="filter-group">
              <label className="special-filter-label">Buscar Produtos</label>
              <div className="special-search-field">
                <Search size={16} className="special-search-icon" />
                <input
                  type="text"
                  placeholder="Digite o nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="special-search-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="special-filter-label">Filtrar por Categoria</label>
              <div className="custom-multi-select">
                <div
                  className="multi-select-header"
                  onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                >
                  <span>{selectedCats.length === 0 ? 'Todas as categorias' : `${selectedCats.length} selecionada(s)`}</span>
                  <ChevronRight size={16} className={`special-filter-arrow ${isCatDropdownOpen ? 'open' : ''}`} />
                </div>
                {isCatDropdownOpen && (
                  <div className="multi-select-options">
                    {availableMainCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className={`multi-select-option ${selectedCats.includes(cat.id) ? 'selected' : ''}`}
                        onClick={() => setSelectedCats(selectedCats.includes(cat.id) ? selectedCats.filter((id) => id !== cat.id) : [...selectedCats, cat.id])}
                      >
                        {cat.name} <CheckCircle className="check-icon" size={16} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button type="button" onClick={() => { setSearchTerm(''); setSelectedCats([]); }} className="btn-secondary special-reset-button">Resetar</button>
          </div>

          <div className="admin-section-group special-section-card">
            <p className="special-section-hint">
              Selecione quais produtos devem aparecer na página de {sectionTitle} e defina a ordem.
            </p>

            <div className="special-products-list">
              {filteredProducts.map((product) => {
                const selected = selectedProducts.find((sp) => sp.id === product.id);
                const isSelected = !!selected;

                return (
                  <div
                    key={product.id}
                    className={`product-select-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleProduct(product)}
                  >
                    <div className={`product-select-checkbox ${isSelected ? 'selected' : ''}`}>
                      {isSelected && <CheckCircle size={14} color="white" />}
                    </div>
                    <img src={product.main_image || '/img/placeholder.png'} alt={product.name} className="product-select-image" />
                    <div className="product-select-info">
                      <p className="product-select-name">{product.name}</p>
                    </div>
                    {isSelected && (
                      <div onClick={(e) => e.stopPropagation()} className="product-order-group">
                        <label className="product-order-label">ORDEM:</label>
                        <input
                          type="number"
                          value={selected.order}
                          onChange={(e) => updateOrder(product.id, e.target.value)}
                          className="product-order-input"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="special-selection-summary">
              <span>{selectedProducts.length} produto(s) selecionados.</span>
              <button className="btn-primary" onClick={() => onSave(selectedProducts)}>Salvar Lista</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialSectionManager;
