import React from 'react';
import { useAdmin } from '../../../context/AdminContext';
import SpecialSectionManager from './SpecialSectionManager';
import './SpecialSectionManager.css';

const AdminUpcera = () => {
  const { products, mainCategories, subCategories, productsHook, addToast } = useAdmin();

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
      subCategories={subCategories}
      categoryMatcher={(category) => category.slug === 'upcera'}
      onSave={handleSave}
    />
  );
};

export default AdminUpcera;
