import React from 'react';
import { LayoutDashboard, BookOpen, Package, User, LogOut, Store, Truck, ShoppingCart, Trash2, PieChart } from 'lucide-react';
import { PageView } from '../types';

interface LayoutProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentPage, onNavigate, children }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cmv', label: 'Relatório CMV', icon: PieChart },
    { id: 'recipes', label: 'Fichas Técnicas', icon: BookOpen },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'shopping', label: 'Compras', icon: ShoppingCart },
    { id: 'waste', label: 'Desperdícios', icon: Trash2 },
    { id: 'suppliers', label: 'Fornecedores', icon: Truck },
  ];

  const getPageTitle = (page: PageView) => {
      switch(page) {
          case 'shopping': return 'Compras';
          case 'cmv': return 'Relatório CMV';
          case 'waste': return 'Desperdícios';
          case 'recipes': return 'Fichas Técnicas';
          case 'inventory': return 'Estoque';
          case 'suppliers': return 'Fornecedores';
          default: return 'Dashboard';
      }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-chef-500 rounded-lg flex items-center justify-center mr-3 text-white font-bold">L</div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">LucroChef</span>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="bg-gray-50 rounded-lg p-3 mb-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-chef-100 text-chef-700 flex items-center justify-center">
                <Store size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Matriz - SP</p>
                <p className="text-xs text-gray-500">Plano Pro</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as PageView)}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
                    isActive 
                      ? 'bg-chef-50 text-chef-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} className={`mr-3 ${isActive ? 'text-chef-500' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <User size={18} className="mr-3 text-gray-400" />
            Minha Conta
          </button>
          <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-1">
            <LogOut size={18} className="mr-3 text-red-400" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
             <div className="text-sm text-gray-500">
                Home / <span className="font-medium text-gray-800 capitalize">{getPageTitle(currentPage)}</span>
             </div>
             <div className="flex items-center gap-4">
                <button className="text-sm font-medium text-chef-600 bg-chef-50 px-3 py-1.5 rounded-full hover:bg-chef-100 transition-colors">
                   + Novo Pedido
                </button>
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
                    <img src="https://picsum.photos/100/100" alt="User" />
                </div>
             </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
           <div className="max-w-7xl mx-auto h-full">
              {children}
           </div>
        </div>
      </main>
    </div>
  );
};