/**
 * Pagina: AdminDashboard
 * Rota: /admin
 * Responsabilidade: servir como estrutura principal do painel administrativo
 * e alternar entre as secoes internas como dashboard, produtos, categorias e banners
 * container principal do painel administrativo.
 */
import React, { useState } from 'react';
import {
  Package,
  Image as ImageIcon,
  LayoutDashboard,
  Layers,
  LogOut,
  CheckCircle,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin, AdminProvider } from '../../context/AdminContext';
import { logoutAdmin } from '../../services/adminAuth';
import './AdminBase.css';

import AdminProducts from './AdminProducts/AdminProducts';
import AdminCategories from './AdminCategories/AdminCategories';
import AdminBanners from './AdminBanners/AdminBanners';
import AdminUpcera from './AdminUpcera/AdminUpcera';
import AdminScanners from './AdminScanners/AdminScanners';
import AdminPrinters from './AdminPrinters/AdminPrinters';

const DashboardHome = ({ onOpenTab }) => {
  const { products, categories, banners } = useAdmin();

  const stats = [
    { title: 'Produtos', value: products.length, icon: <Package />, color: 'blue', tabId: 'products' },
    { title: 'Categorias', value: categories.length, icon: <Layers />, color: 'green', tabId: 'categories' },
    { title: 'Banners', value: banners.length, icon: <ImageIcon />, color: 'orange', tabId: 'banners' }
  ];

  return (
    <div className="admin-dashboard-home">
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <button
            key={idx}
            type="button"
            className="stat-card"
            onClick={() => onOpenTab(stat.tabId)}
            style={{ cursor: 'pointer', textAlign: 'left', border: '1px solid var(--admin-border)' }}
          >
            <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.title}</h3>
              <p>{stat.value}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="admin-card">
        <div className="card-header">
          <h2><LayoutDashboard size={20} /> Bem-vindo ao Painel Administrativo</h2>
        </div>
        <div className="card-body">
          <p>Utilize o menu lateral para gerenciar os produtos, categorias e banners do site Talmax.</p>
        </div>
      </div>
    </div>
  );
};

const AdminDashboardContent = () => {
  const {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isPagesOpen,
    setIsPagesOpen,
    toasts
  } = useAdminState();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'products', label: 'Produtos', icon: <Package size={20} /> },
    { id: 'categories', label: 'Categorias', icon: <Layers size={20} /> },
    { id: 'banners', label: 'Banners', icon: <ImageIcon size={20} /> }
  ];
  const pageItems = [
    { id: 'upcera', label: 'Upcera', icon: <CheckCircle size={18} /> },
    { id: 'scanners', label: 'Scanners', icon: <Search size={18} /> },
    { id: 'printers', label: 'Impressoras 3D', icon: <ImageIcon size={18} /> }
  ];
  const activeItem = [...menuItems, ...pageItems].find((item) => item.id === activeTab);
  const isPagesSectionActive = pageItems.some((item) => item.id === activeTab);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardHome onOpenTab={setActiveTab} />;
      case 'products': return <AdminProducts />;
      case 'categories': return <AdminCategories />;
      case 'banners': return <AdminBanners />;
      case 'upcera': return <AdminUpcera />;
      case 'scanners': return <AdminScanners />;
      case 'printers': return <AdminPrinters />;
      default: return <DashboardHome />;
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    window.location.href = '/admin/login';
  };

  return (
    <div className={`admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-text">
            {!isSidebarCollapsed && <span className="brand">TALMAX ADMIN</span>}
          </div>
          <button className="btn-toggle-sidebar" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
            >
              {item.icon}
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </div>
          ))}

          <div className={`nav-dropdown ${isPagesOpen ? 'open' : ''}`}>
            <div
              className={`nav-link ${isPagesSectionActive ? 'active' : ''}`}
              onClick={() => {
                if (isSidebarCollapsed) {
                  setIsSidebarCollapsed(false);
                  setIsPagesOpen(true);
                } else {
                  setIsPagesOpen(!isPagesOpen);
                }
              }}
            >
              <Layers size={20} />
              {!isSidebarCollapsed && <span>Paginas</span>}
              {!isSidebarCollapsed && <ChevronRight size={16} className="dropdown-arrow" />}
            </div>

            {!isSidebarCollapsed && (
              <div className="dropdown-content">
                {pageItems.map((item) => (
                  <div
                    key={item.id}
                    className={`nav-link sub-link ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsPagesOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <div className="dot" />
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={20} />
            {!isSidebarCollapsed && <span>Sair do Painel</span>}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button className="menu-toggle btn-mobile-menu" onClick={() => setIsMobileMenuOpen(true)} style={{ display: 'none' }}>
            <Menu size={24} />
          </button>
          <h1>{activeItem?.label}</h1>
          <div className="user-profile">
            <span className="user-name">Administrador</span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderActiveTab()}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="toast-container">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className={`toast ${toast.type}`}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
            >
              {toast.type === 'success'
                ? <CheckCircle size={20} color="var(--admin-success)" />
                : <AlertCircle size={20} color="var(--admin-danger)" />}
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const useAdminState = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPagesOpen, setIsPagesOpen] = useState(true);
  const { toasts } = useAdmin();

  return {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isPagesOpen,
    setIsPagesOpen,
    toasts
  };
};

const AdminDashboard = () => (
  <AdminProvider>
    <AdminDashboardContent />
  </AdminProvider>
);

export default AdminDashboard;
