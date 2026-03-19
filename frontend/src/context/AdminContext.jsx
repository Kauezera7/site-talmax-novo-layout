import React, { createContext, useContext, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useBanners } from '../hooks/useBanners';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const productsHook = useProducts();
  const categoriesHook = useCategories();
  const bannersHook = useBanners();

  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const value = {
    products: productsHook.products,
    categories: categoriesHook.categories,
    mainCategories: categoriesHook.mainCategories,
    subCategories: categoriesHook.subCategories,
    banners: bannersHook.banners,
    loading: productsHook.loading || categoriesHook.loading || bannersHook.loading,
    error: productsHook.error || categoriesHook.error || bannersHook.error,
    refreshAll: () => {
      productsHook.refresh();
      categoriesHook.refresh();
      bannersHook.refresh();
    },
    productsHook,
    categoriesHook,
    bannersHook,
    toasts,
    addToast
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin deve ser usado dentro de um AdminProvider');
  }
  return context;
};
