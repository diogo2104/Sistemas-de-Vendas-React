import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Trash2, Users, X, Save, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { listarClientes, criarCliente, excluirCliente } from '../services/clienteService';

interface Customer {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
}

export function CustomersScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    endereco: '',
  });

  async function carregarClientes() {
    try {
      setLoading(true);
      const data = await listarClientes();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  async function handleAddCustomer() {
    if (!newCustomer.nome.trim()) {
      alert('Preencha o nome do cliente');
      return;
    }

    try {
      setSaving(true);

      await criarCliente({
        nome: newCustomer.nome.trim(),
        cpf: newCustomer.cpf.trim(),
        telefone: newCustomer.telefone.trim(),
        email: newCustomer.email.trim(),
        endereco: newCustomer.endereco.trim(),
      });

      setNewCustomer({
        nome: '',
        cpf: '',
        telefone: '',
        email: '',
        endereco: '',
      });

      setShowAddForm(false);
      await carregarClientes();
    } catch (error) {
      console.error(error);
      alert('Erro ao cadastrar cliente');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCustomer(id: number) {
    const confirmacao = window.confirm('Deseja realmente excluir este cliente?');

    if (!confirmacao) return;

    try {
      await excluirCliente(id);
      await carregarClientes();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir cliente');
    }
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const termo = searchTerm.toLowerCase();

      return (
        customer.nome?.toLowerCase().includes(termo) ||
        (customer.cpf || '').toLowerCase().includes(termo) ||
        (customer.telefone || '').toLowerCase().includes(termo) ||
        (customer.email || '').toLowerCase().includes(termo) ||
        (customer.endereco || '').toLowerCase().includes(termo)
      );
    });
  }, [customers, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
                <p className="text-sm text-slate-500">
                  Gerencie os clientes cadastrados no sistema
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Novo Cliente
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, telefone, e-mail ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total de clientes</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">{customers.length}</h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Resultados filtrados</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">{filteredCustomers.length}</h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Busca atual</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">
            {searchTerm ? `"${searchTerm}"` : 'Sem filtro'}
          </h3>
        </div>
      </div>

      {showAddForm && (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Cadastrar cliente</h2>
              <p className="text-sm text-slate-500">
                Preencha os dados para adicionar um novo cliente
              </p>
            </div>

            <button
              onClick={() => setShowAddForm(false)}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Nome *</label>
              <input
                type="text"
                value={newCustomer.nome}
                onChange={(e) =>
                  setNewCustomer((prev) => ({ ...prev, nome: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                placeholder="Digite o nome do cliente"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">CPF</label>
              <input
                type="text"
                value={newCustomer.cpf}
                onChange={(e) =>
                  setNewCustomer((prev) => ({ ...prev, cpf: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                placeholder="Digite o CPF"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Telefone</label>
              <input
                type="text"
                value={newCustomer.telefone}
                onChange={(e) =>
                  setNewCustomer((prev) => ({ ...prev, telefone: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                placeholder="Digite o telefone"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">E-mail</label>
              <input
                type="email"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                placeholder="Digite o e-mail"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Endereço</label>
              <input
                type="text"
                value={newCustomer.endereco}
                onChange={(e) =>
                  setNewCustomer((prev) => ({ ...prev, endereco: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                placeholder="Digite o endereço"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAddCustomer}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar cliente'}
            </button>

            <button
              onClick={() => setShowAddForm(false)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Lista de clientes</h2>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-500">Carregando clientes...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-lg font-semibold text-slate-700">
              Nenhum cliente encontrado
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Cadastre um novo cliente ou ajuste sua busca.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      CPF
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Telefone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      E-mail
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Endereço
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{customer.nome}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {customer.cpf || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {customer.telefone || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {customer.email || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {customer.endereco || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 p-4 md:hidden">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="rounded-2xl border border-slate-200 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{customer.nome}</h3>
                      <p className="mt-1 text-sm text-slate-500">ID #{customer.id}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span>{customer.cpf || 'CPF não informado'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{customer.telefone || 'Telefone não informado'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>{customer.email || 'E-mail não informado'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{customer.endereco || 'Endereço não informado'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}