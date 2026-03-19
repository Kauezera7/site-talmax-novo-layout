import React from 'react';
import { useAdmin } from '../../../context/AdminContext';
import SpecialSectionManager from './SpecialSectionManager';

const AdminUpcera = () => {
  const { products, mainCategories, productsHook, addToast } = useAdmin();

  const handleSave = async (selectedProducts) => {
    const result = await productsHook.updateSpecialSection('upcera', selectedProducts);
    if (result.success) {
      addToast('Produtos Upcera atualizados com sucesso!');
    } else {
      addToast(result.error, 'error');
    }
  };

  return (
    <SpecialSectionManager 
      sectionTitle="Upcera"
      sectionKey="upcera"
      products={products}
      mainCategories={mainCategories}
      onSave={handleSave}
    />
  );
};

export default AdminUpcera;
