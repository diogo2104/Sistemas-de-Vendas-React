import { X, Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Notification {
  id: number;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'success',
    title: 'Venda Realizada',
    message: 'Venda #1234 finalizada com sucesso',
    time: 'Há 5 minutos',
  },
  {
    id: 2,
    type: 'warning',
    title: 'Estoque Baixo',
    message: 'Teclado Mecânico está com estoque abaixo do mínimo',
    time: 'Há 1 hora',
  },
  {
    id: 3,
    type: 'info',
    title: 'Novo Cliente',
    message: 'Cliente Maria Silva foi cadastrado',
    time: 'Há 2 horas',
  },
  {
    id: 4,
    type: 'warning',
    title: 'Estoque Baixo',
    message: 'Webcam HD precisa de reposição',
    time: 'Há 3 horas',
  },
];

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-16 pr-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h3 className="font-bold">Notificações</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
          {mockNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      {notification.type === 'success' && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                      {notification.type === 'warning' && (
                        <AlertCircle className="w-6 h-6 text-yellow-500" />
                      )}
                      {notification.type === 'info' && (
                        <Info className="w-6 h-6 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
