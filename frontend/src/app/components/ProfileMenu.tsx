import { Settings, Users, LogOut, X } from 'lucide-react';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenSellers: () => void;
}

export function ProfileMenu({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenSellers,
}: ProfileMenuProps) {
  if (!isOpen) return null;

  const handleLogout = () => {
    if (confirm('Deseja realmente sair do sistema?')) {
      // Lógica de logout aqui
      alert('Saindo do sistema...');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-16 pr-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-xs overflow-hidden">
        <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
          <h3 className="font-bold">Perfil</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              A
            </div>
            <div>
              <h4 className="font-bold text-gray-800">Admin</h4>
              <p className="text-sm text-gray-600">Administrador</p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                onOpenSettings();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <Settings className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-700">Configurações</span>
            </button>

            <button
              onClick={() => {
                onOpenSellers();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <Users className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-700">Vendedores</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-600">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
