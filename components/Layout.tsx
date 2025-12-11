import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  FileText, 
  Settings, 
  Menu, 
  X,
  Store
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Dasbor', path: '/', icon: <LayoutDashboard size={20} /> },
    { label: 'Kasir (POS)', path: '/pos', icon: <ShoppingCart size={20} /> },
    { label: 'Inventaris', path: '/inventory', icon: <Package size={20} /> },
    { label: 'Laporan', path: '/reports', icon: <FileText size={20} /> },
    { label: 'Pengaturan', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shadow-xl z-20">
        <div className="flex items-center gap-3 p-6 border-b border-slate-800">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <Store size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">IBD-UMKM</h1>
            <p className="text-xs text-slate-400 mt-1">Integrator Bisnis</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-slate-400">Masuk sebagai</p>
            <p className="text-sm font-semibold mt-1">Pemilik Bisnis</p>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-slate-900 text-white z-40 transform transition-transform duration-300 ease-in-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Store size={20} className="text-indigo-400" />
            <span className="font-bold">IBD-UMKM</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400">
            <X size={24} />
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                     location.pathname === item.path ? 'bg-indigo-600' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - Mobile Only for Toggle */}
        <header className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
            <Menu size={24} />
          </button>
          <span className="font-semibold text-gray-800">
            {navItems.find(i => i.path === location.pathname)?.label || 'Aplikasi'}
          </span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;