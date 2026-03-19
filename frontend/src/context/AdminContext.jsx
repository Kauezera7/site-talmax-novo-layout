/**
 * Contexto global do painel administrativo.
 *
 * Ideia principal:
 * em vez de cada tela do admin buscar produtos, categorias e banners por conta propria,
 * este contexto centraliza esses dados e entrega tudo pronto para os componentes filhos.
 *
 * Exemplo de uso:
 * - AdminProducts
 * - AdminCategories
 * - AdminBanners
 *
 * Todos eles podem consumir `useAdmin()` para acessar dados, loading, erros e funcoes auxiliares.
 */
import React, { createContext, useContext, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useBanners } from '../hooks/useBanners';

// Cria o contexto que sera compartilhado entre as telas do admin.
const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  // Cada hook encapsula a logica de uma area do painel.
  // Aqui apenas juntamos tudo em um unico lugar.
  const productsHook = useProducts();
  const categoriesHook = useCategories();
  const bannersHook = useBanners();

  // Toasts sao avisos temporarios exibidos na interface, como:
  // "Produto salvo com sucesso" ou "Erro ao excluir banner".
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();

    // Adiciona o novo aviso na lista.
    setToasts(prev => [...prev, { id, message, type }]);

    // Remove automaticamente apos 3 segundos.
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Este objeto e o "pacote" que o contexto entrega para quem usar `useAdmin()`.
  //
  // Ele contem:
  // - listas principais do painel
  // - estado geral de carregamento e erro
  // - hooks completos para operacoes especificas
  // - funcoes utilitarias como refreshAll e addToast
  const value = {
    // Dados prontos para uso nas telas.
    products: productsHook.products,
    categories: categoriesHook.categories,
    mainCategories: categoriesHook.mainCategories,
    subCategories: categoriesHook.subCategories,
    banners: bannersHook.banners,

    // Se qualquer area estiver carregando, o admin inteiro pode considerar loading.
    loading: productsHook.loading || categoriesHook.loading || bannersHook.loading,

    // O mesmo raciocinio vale para erro:
    // se qualquer hook falhar, o contexto expoe esse erro para a interface.
    error: productsHook.error || categoriesHook.error || bannersHook.error,

    // Recarrega manualmente todas as areas do painel.
    refreshAll: () => {
      productsHook.refresh();
      categoriesHook.refresh();
      bannersHook.refresh();
    },

    // Hooks completos expostos para as telas que precisam chamar create/update/delete.
    productsHook,
    categoriesHook,
    bannersHook,

    // Sistema de feedback visual.
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
  // Hook auxiliar para facilitar o consumo do contexto.
  // Em vez de usar useContext(AdminContext) em toda tela,
  // as paginas do admin usam apenas `useAdmin()`.
  const context = useContext(AdminContext);

  // Protecao para evitar uso fora do provider.
  if (!context) {
    throw new Error('useAdmin deve ser usado dentro de um AdminProvider');
  }

  return context;
};
