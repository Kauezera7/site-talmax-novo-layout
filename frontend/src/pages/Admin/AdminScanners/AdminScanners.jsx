import React from 'react';
import { useAdmin } from '../../../context/AdminContext';
import SpecialSectionManager from '../AdminUpcera/SpecialSectionManager';
import SpecialPageSettingsForm from '../SpecialPageSettingsForm/SpecialPageSettingsForm';
import './AdminScanners.css';

const AdminScanners = () => {
  const { products, mainCategories, subCategories, productsHook, addToast } = useAdmin();

  const handleSave = async (selectedProducts) => {
    const result = await productsHook.updateSpecialSection('scanners', selectedProducts);
    if (result.success) {
      addToast('Produtos Scanners atualizados com sucesso!');
    } else {
      addToast(result.error, 'error');
    }
  };

  return (
    <>
      <SpecialPageSettingsForm
        pageKey="scanners"
        title="Scanners"
        description="Edite logo, texto superior, titulo e descricao da pagina Scanners."
      />

      <SpecialSectionManager
        sectionTitle="Scanners"
        sectionKey="scanners"
        products={products}
        mainCategories={mainCategories}
        subCategories={subCategories}
        categoryMatcher={(category) => category.slug === 'scanner'}
        onSave={handleSave}
      />
    </>
  );
};

export default AdminScanners;
