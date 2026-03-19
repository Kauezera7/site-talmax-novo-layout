import React, { useState, useEffect } from 'react';
import { Search, Save, CheckCircle, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SpecialSectionManager = ({ sectionTitle, sectionKey, products, mainCategories, onSave }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCats, setSelectedCats] = useState([]);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  useEffect(() => {
    // Inicializa os produtos selecionados baseado no banco
    const initial = products
      .filter(p => {
        if (sectionKey === 'upcera') return p.is_upcera;
        if (sectionKey === 'scanners') return p.is_scanner;
        if (sectionKey === 'printers') return p.is_3d_printer;
        return false;
      })
      .map(p => ({
        id: p.id,
        order: (sectionKey === 'upcera' ? p.upcera_order : (sectionKey === 'scanners' ? p.scanner_order : p.printer_order)) || 0
      }));
    setSelectedProducts(initial);
  }, [products, sectionKey]);

  const toggleProduct = (product) => {
    const isSelected = selectedProducts.find(sp => sp.id === product.id);
    if (isSelected) {
      setSelectedProducts(selectedProducts.filter(sp => sp.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, { id: product.id, order: 0 }]);
    }
  };

  const updateOrder = (id, order) => {
    setSelectedProducts(selectedProducts.map(sp => 
      sp.id === id ? { ...sp, order: parseInt(order) || 0 } : sp
    ));
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCats.length === 0 || (p.category_ids && p.category_ids.some(id => selectedCats.includes(id)));
    
    // Filtro especial por nome da seção se necessário (ex: scanners só mostram quem tem 'scanner' no nome/cat)
    // No original tinha um filtro assim, vamos manter:
    const isFromSection = (p.category_names || '').toLowerCase().includes(sectionKey.replace('printers', '3d').replace('upcera', 'upcera'));

    return matchesSearch && matchesCat;
  });

  return (
    <div className="admin-card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2><Search size={20} /> Seleção de {sectionTitle}</h2>
        <button className="btn-primary" onClick={() => onSave(selectedProducts)}>
          <Save size={18} /> Salvar Alterações
        </button>
      </div>
      <div className="card-body" style={{ padding: '20px' }}>
        <div className="admin-form">
          
          {/* Filtros */}
          <div style={{
            background: '#f8fafc',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--admin-border)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr auto',
            gap: '20px',
            alignItems: 'flex-end',
            marginBottom: '20px'
          }}>
            <div className="filter-group">
              <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--admin-text-light)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Buscar Produtos</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Digite o nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div className="filter-group">
              <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--admin-text-light)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Filtrar por Categoria</label>
              <div className="custom-multi-select" style={{ position: 'relative' }}>
                <div 
                  className="multi-select-header" 
                  onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                  style={{ padding: '10px 15px', background: 'white', border: '1px solid var(--admin-border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  <span>{selectedCats.length === 0 ? 'Todas as categorias' : `${selectedCats.length} selecionada(s)`}</span>
                  <ChevronRight size={16} style={{ transform: isCatDropdownOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>
                {isCatDropdownOpen && (
                  <div className="multi-select-options">
                    {mainCategories.map(cat => (
                      <div 
                        key={cat.id} 
                        className={`multi-select-option ${selectedCats.includes(cat.id) ? 'selected' : ''}`}
                        onClick={() => setSelectedCats(selectedCats.includes(cat.id) ? selectedCats.filter(id => id !== cat.id) : [...selectedCats, cat.id])}
                      >
                        {cat.name} <CheckCircle className="check-icon" size={16} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button type="button" onClick={() => { setSearchTerm(''); setSelectedCats([]); }} className="btn-secondary" style={{ height: '42px' }}>Resetar</button>
          </div>

          <div className="admin-section-group" style={{ marginTop: 0 }}>
            <p style={{fontSize: '0.85rem', color: 'var(--admin-text-light)', marginBottom: '15px'}}>
              Selecione quais produtos devem aparecer na página de {sectionTitle} e defina a ordem.
            </p>

            <div style={{ maxHeight: '500px', overflowY: 'auto', background: 'white', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
              {filteredProducts.map(product => {
                const selected = selectedProducts.find(sp => sp.id === product.id);
                const isSelected = !!selected;
                
                return (
                  <div 
                    key={product.id} 
                    className={`product-select-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleProduct(product)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      padding: '14px 20px',
                      borderBottom: '1px solid var(--admin-border)',
                      cursor: 'pointer',
                      background: isSelected ? '#eff6ff' : 'transparent'
                    }}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '6px',
                      border: '2px solid var(--admin-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isSelected ? 'var(--admin-primary)' : 'transparent'
                    }}>
                      {isSelected && <CheckCircle size={14} color="white" />}
                    </div>
                    <img src={product.main_image || '/img/placeholder.png'} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{product.name}</p>
                    </div>
                    {isSelected && (
                      <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 700 }}>ORDEM:</label>
                        <input 
                          type="number" 
                          value={selected.order} 
                          onChange={(e) => updateOrder(product.id, e.target.value)}
                          style={{ width: '60px', padding: '5px', borderRadius: '6px', border: '1px solid var(--admin-border)', textAlign: 'center' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div style={{ marginTop: '15px', padding: '12px 20px', background: '#f8fafc', borderRadius: '10px', borderLeft: '4px solid var(--admin-primary)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📌 {selectedProducts.length} produto(s) selecionados.</span>
              <button className="btn-primary" onClick={() => onSave(selectedProducts)}>Salvar Lista</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialSectionManager;
