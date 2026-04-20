import { useContext } from 'react';
import AdminContext from './AdminContextValue';

export const useAdmin = () => {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error('useAdmin deve ser usado dentro de um AdminProvider');
  }

  return context;
};
