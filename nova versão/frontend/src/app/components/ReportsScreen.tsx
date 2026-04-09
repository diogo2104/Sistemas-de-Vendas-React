import { useEffect, useState } from 'react';
import {
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Download,
} from 'lucide-react';

import { listarVendas } from '../services/vendaService';

interface Sale {
  id: number;
  data_venda: string;
  cliente_nome: string;
  itens: {
    produto_nome: string;
    quantidade: number;
    preco_unitario: number;
  }[];
  valor_total: number;
  tipo_pagamento: string;
}

export function ReportsScreen() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState('todos');

  async function carregarVendas() {
    try {
      setLoading(true);

      const data = await listarVendas();

      setSales(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarVendas();
  }, []);

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id.toString().includes(searchTerm);

    const matchesPayment =
      filterPayment === 'todos' ||
      sale.tipo_pagamento === filterPayment;

    return matchesSearch && matchesPayment;
  });

  const totalRevenue = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.valor_total),
    0
  );

  const totalSales = filteredSales.length;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  const accountSales = filteredSales.filter(
    (s) => s.tipo_pagamento === 'aprazo'
  ).length;

  const exportToCSV = () => {
    const headers = ['ID', 'Data', 'Cliente', 'Total', 'Pagamento'];

    const rows = filteredSales.map((sale) => [
      sale.id,
      new Date(sale.data_venda).toLocaleDateString('pt-BR'),
      sale.cliente_nome,
      `R$ ${Number(sale.valor_total).toFixed(2)}`,
      sale.tipo_pagamento,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-vendas.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-600 text-white p-4 rounded-lg">
          <p>Total de Vendas</p>
          <h2 className="text-2xl font-bold">{totalSales}</h2>
        </div>

        <div className="bg-green-600 text-white p-4 rounded-lg">
          <p>Receita</p>
          <h2 className="text-2xl font-bold">
            R$ {totalRevenue.toFixed(2)}
          </h2>
        </div>

        <div className="bg-purple-600 text-white p-4 rounded-lg">
          <p>Ticket Médio</p>
          <h2 className="text-2xl font-bold">
            R$ {averageTicket.toFixed(2)}
          </h2>
        </div>

        <div className="bg-orange-600 text-white p-4 rounded-lg">
          <p>Vendas a Prazo</p>
          <h2 className="text-2xl font-bold">{accountSales}</h2>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-lg shadow flex gap-3">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="todos">Todos</option>
          <option value="avista">À Vista</option>
          <option value="aprazo">A Prazo</option>
        </select>

        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 rounded"
        >
          Exportar
        </button>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Carregando...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Data</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Total</th>
                <th className="p-3">Pagamento</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b">
                  <td className="p-3">#{sale.id}</td>
                  <td className="p-3">
                    {new Date(sale.data_venda).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-3">{sale.cliente_nome}</td>
                  <td className="p-3 text-green-600 font-bold">
                    R$ {Number(sale.valor_total).toFixed(2)}
                  </td>
                  <td className="p-3">
                    {sale.tipo_pagamento === 'aprazo'
                      ? 'A Prazo'
                      : 'À Vista'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}