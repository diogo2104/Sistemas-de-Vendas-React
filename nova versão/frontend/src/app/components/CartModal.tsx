import { X, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToSale: () => void;
}

const mockCartItems: CartItem[] = [
  {
    id: 1,
    name: 'Laptop HP Pavilion',
    price: 3500,
    quantity: 1,
  },
  {
    id: 2,
    name: 'Mouse Gamer RGB',
    price: 150,
    quantity: 2,
  },
  {
    id: 3,
    name: 'Teclado Mecânico',
    price: 350,
    quantity: 1,
  },
];

export function CartModal({ isOpen, onClose, onProceedToSale }: CartModalProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const toggleItemSelection = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const removeSelectedItems = () => {
    if (selectedItems.size === 0) {
      alert('Selecione pelo menos um item para remover');
      return;
    }
    setCartItems(cartItems.filter((item) => !selectedItems.has(item.id)));
    setSelectedItems(new Set());
  };

  const clearCart = () => {
    if (confirm('Deseja realmente esvaziar o carrinho?')) {
      setCartItems([]);
      setSelectedItems(new Set());
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-16 pr-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <h3 className="font-bold">Carrinho de Compras</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Carrinho vazio</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl flex-shrink-0">
                      💻
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">{item.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">
                        Quantidade: {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-green-600">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-semibold">Total:</span>
              <span className="text-2xl font-bold text-green-600">
                R$ {total.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  onProceedToSale();
                  onClose();
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Prosseguir com a Venda
              </button>

              {selectedItems.size > 0 && (
                <button
                  onClick={removeSelectedItems}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Remover Selecionados ({selectedItems.size})
                </button>
              )}

              <button
                onClick={clearCart}
                className="w-full bg-gray-400 hover:bg-gray-500 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
              >
                Esvaziar Carrinho
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
