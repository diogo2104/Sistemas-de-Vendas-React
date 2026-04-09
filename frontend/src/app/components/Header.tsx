import { Search, Bell, ShoppingCart, User } from 'lucide-react';
import { useState } from 'react';
import { NotificationModal } from './NotificationModal';
import { CartModal } from './CartModal';
import { ProfileMenu } from './ProfileMenu';
import { SettingsModal } from './SettingsModal';
import { SellersModal } from './SellersModal';

interface HeaderProps {
  onNavigateToSales?: () => void;
}

export function Header({ onNavigateToSales }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSellers, setShowSellers] = useState(false);

  const handleProceedToSale = () => {
    if (onNavigateToSales) {
      onNavigateToSales();
    }
  };

  return (
    <>
      <div className="bg-[#1e3a5f] text-white px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-4">
        {/* Spacer for mobile menu button */}
        <div className="w-12 lg:hidden"></div>

        {/* Search Bar */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Selecionar"
            className="w-full px-3 md:px-4 py-2 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-gray-800">
            <Search className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setShowNotifications(true)}
            className="text-blue-300 hover:text-white relative transition-colors"
          >
            <Bell className="w-5 h-5 md:w-6 md:h-6" />
            <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[10px] md:text-xs">
              4
            </span>
          </button>
          <button
            onClick={() => setShowCart(true)}
            className="text-blue-300 hover:text-white relative transition-colors"
          >
            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
            <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[10px] md:text-xs">
              3
            </span>
          </button>
          <button
            onClick={() => setShowProfile(true)}
            className="text-blue-300 hover:text-white transition-colors"
          >
            <User className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      <CartModal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onProceedToSale={handleProceedToSale}
      />
      <ProfileMenu
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenSellers={() => setShowSellers(true)}
      />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <SellersModal isOpen={showSellers} onClose={() => setShowSellers(false)} />
    </>
  );
}