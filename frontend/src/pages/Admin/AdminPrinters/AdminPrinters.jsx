import React from 'react';
import { useAdmin } from '../../../context/AdminContext';
import SpecialSectionManager from '../AdminUpcera/SpecialSectionManager';
import SpecialPageSettingsForm from '../SpecialPageSettingsForm/SpecialPageSettingsForm';
import './AdminPrinters.css';

const AdminPrinters = () => {
  const { products, mainCategories, subCategories, productsHook, addToast } = useAdmin();

  const handleSave = async (selectedProducts) => {
    const result = await productsHook.updateSpecialSection('printers', selectedProducts);
    if (result.success) {
      addToast('Produtos Impressoras 3D atualizados com sucesso!');
    } else {
      addToast(result.error, 'error');
    }
  };

  return (
    <>
      <SpecialPageSettingsForm
        pageKey="printers"
        title="Impressoras 3D"
        description="Edite logo, texto superior, titulo e descrição da página Impressoras 3D."
      />

      <SpecialSectionManager
        sectionTitle="Impressoras 3D"
        sectionKey="printers"
        products={products}
        mainCategories={mainCategories}
        subCategories={subCategories}
        categoryMatcher={(category) => category.slug === 'impressora'}
        onSave={handleSave}
      />
    </>
  );
};

export default AdminPrinters;
