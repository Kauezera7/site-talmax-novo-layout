import React from 'react';
import { useAdmin } from '../../../context/AdminContext';
import SpecialSectionManager from '../AdminUpcera/SpecialSectionManager';

const AdminPrinters = () => {
  const { products, mainCategories, productsHook, addToast } = useAdmin();

  const handleSave = async (selectedProducts) => {
    const result = await productsHook.updateSpecialSection('printers', selectedProducts);
    if (result.success) {
      addToast('Produtos Impressoras 3D atualizados com sucesso!');
    } else {
      addToast(result.error, 'error');
    }
  };

  return (
    <SpecialSectionManager 
      sectionTitle="Impressoras 3D"
      sectionKey="printers"
      products={products}
      mainCategories={mainCategories}
      onSave={handleSave}
    />
  );
};

export default AdminPrinters;
