import { X, Plus, Edit, Trash2, User, Save } from 'lucide-react';
import { useState } from 'react';

interface Seller {
  id: number;
  name: string;
  code: string;
  phone: string;
  email: string;
  commission: number;
  active: boolean;
}

interface SellersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockSellers: Seller[] = [
  {
    id: 1,
    name: 'João Silva',
    code: 'V001',
    phone: '(11) 98765-4321',
    email: 'joao@depaulasystems.com',
    commission: 5,
    active: true,
  },
  {
    id: 2,
    name: 'Maria Santos',
    code: 'V002',
    phone: '(11) 98765-1234',
    email: 'maria@depaulasystems.com',
    commission: 7,
    active: true,
  },
  {
    id: 3,
    name: 'Carlos Oliveira',
    code: 'V003',
    phone: '(11) 98765-5678',
    email: 'carlos@depaulasystems.com',
    commission: 6,
    active: false,
  },
];

export function SellersModal({ isOpen, onClose }: SellersModalProps) {
  const [sellers, setSellers] = useState<Seller[]>(mockSellers);
  const [showForm, setShowForm] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    phone: '',
    email: '',
    commission: 5,
    active: true,
  });

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      phone: '',
      email: '',
      commission: 5,
      active: true,
    });
    setShowForm(false);
    setEditingSeller(null);
  };

  const handleAddSeller = () => {
    if (!formData.name || !formData.code) {
      alert('Preencha os campos obrigatórios!');
      return;
    }

    const newSeller: Seller = {
      id: sellers.length + 1,
      ...formData,
    };

    setSellers([...sellers, newSeller]);
    resetForm();
  };

  const handleEditSeller = (seller: Seller) => {
    setEditingSeller(seller);
    setFormData({
      name: seller.name,
      code: seller.code,
      phone: seller.phone,
      email: seller.email,
      commission: seller.commission,
      active: seller.active,
    });
    setShowForm(true);
  };

  const handleSaveEdit = () => {
    if (!editingSeller) return;
    if (!formData.name || !formData.code) {
      alert('Preencha os campos obrigatórios!');
      return;
    }

    setSellers(
      sellers.map((seller) =>
        seller.id === editingSeller.id
          ? { ...seller, ...formData }
          : seller
      )
    );
    resetForm();
  };

  const handleDeleteSeller = (id: number) => {
    if (confirm('Deseja realmente excluir este vendedor?')) {
      setSellers(sellers.filter((seller) => seller.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-purple-600 text-white px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6" />
            <h3 className="text-xl font-bold">Vendedores</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 md:p-6">
          {!showForm ? (
            <>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Novo Vendedor
                </button>
              </div>

              {/* Sellers List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sellers.map((seller) => (
                  <div
                    key={seller.id}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {seller.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">{seller.name}</h4>
                          <p className="text-sm text-gray-600">Código: {seller.code}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          seller.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {seller.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <p>📞 {seller.phone}</p>
                      <p>📧 {seller.email}</p>
                      <p className="font-semibold text-green-600">
                        Comissão: {seller.commission}%
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSeller(seller)}
                        className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-600 px-3 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteSeller(seller.id)}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">
                {editingSeller ? 'Editar Vendedor' : 'Novo Vendedor'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Comissão (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.commission}
                    onChange={(e) =>
                      setFormData({ ...formData, commission: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.active ? 'true' : 'false'}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.value === 'true' })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={editingSeller ? handleSaveEdit : handleAddSeller}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingSeller ? 'Salvar Alterações' : 'Adicionar Vendedor'}
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 sm:flex-none bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
