import React from 'react';
import { useAdmin } from '../../../context/AdminContext';
import SpecialSectionManager from '../AdminUpcera/SpecialSectionManager';
import './AdminScanners.css';

const AdminScanners = () => {
  const { products, mainCategories, productsHook, addToast } = useAdmin();

  const handleSave = async (selectedProducts) => {
    const result = await productsHook.updateSpecialSection('scanners', selectedProducts);
    if (result.success) {
      addToast('Produtos Scanners atualizados com sucesso!');
    } else {
      addToast(result.error, 'error');
    }
  };

  return (
    <SpecialSectionManager 
      sectionTitle="Scanners"
      sectionKey="scanners"
      products={products}
      mainCategories={mainCategories}
      onSave={handleSave}
    />
  );
};

export default AdminScanners;
