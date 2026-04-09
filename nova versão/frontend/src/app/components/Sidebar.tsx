import { Home, Users, ShoppingCart, Package, Menu, X, FileText } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'vendas', label: 'Vendas', icon: ShoppingCart },
    { id: 'estoque', label: 'Controle de Estoque', icon: Package },
    { id: 'relatorios', label: 'Relatórios', icon: FileText },
  ];

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-3 rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-gradient-to-b from-[#1a3a5c] to-[#0d1f33] text-white flex flex-col h-screen transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-center border-b border-blue-800 mt-16 lg:mt-0">
          <div className="relative">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center border-4 border-blue-400">
              <div className="text-center">
                <div className="text-3xl lg:text-4xl mb-1">👤</div>
                <div className="text-xs font-bold">DP</div>
              </div>
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-300 opacity-30 animate-pulse"></div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="px-6 py-4 text-center border-b border-blue-800">
          <h1 className="text-lg lg:text-xl font-bold">De Paula Systems</h1>
          <p className="text-xs text-blue-300">Software e Tecnologia</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-blue-200 hover:bg-blue-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-blue-800 text-center">
          <div className="text-3xl lg:text-4xl mb-2">⚡</div>
          <h2 className="text-base lg:text-lg font-bold">De Paula Systems</h2>
          <p className="text-xs text-blue-300">Software e Tecnologia</p>
        </div>
      </div>
    </>
  );
}