import { useEffect, useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { buscarVendasRecentes } from '../services/dashboardService';

interface VendaRecente {
  id: number;
  data_venda: string;
  valor_total: number | string;
  cliente_nome: string;
  forma_pagamento_nome?: string;
  tipo_pagamento?: string;
  status?: string;
}

interface ChartItem {
  label: string;
  valor: number;
}

export function SalesChart() {
  const [loading, setLoading] = useState(true);
  const [vendas, setVendas] = useState<VendaRecente[]>([]);

  async function carregarVendas() {
    try {
      setLoading(true);
      const data = await buscarVendasRecentes();
      setVendas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar gráfico de vendas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarVendas();
  }, []);

  const chartData = useMemo(() => {
    const agrupado: Record<string, number> = {};

    vendas.forEach((venda) => {
      const dataBruta = venda.data_venda;
      const valor = Number(venda.valor_total ?? 0);

      const data = new Date(dataBruta);

      const label = Number.isNaN(data.getTime())
        ? 'Sem data'
        : data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          });

      agrupado[label] = (agrupado[label] || 0) + valor;
    });

    return Object.entries(agrupado).map(([label, valor]) => ({
      label,
      valor,
    }));
  }, [vendas]);

  const maxValue = Math.max(...chartData.map((item) => item.valor), 1);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg md:text-xl font-bold text-gray-800">
          Vendas Recentes
        </h2>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          Carregando gráfico...
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          Nenhuma venda encontrada
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-64 flex items-end gap-3">
            {chartData.map((item, index) => {
              const height = `${(item.valor / maxValue) * 100}%`;

              return (
                <div
                  key={`${item.label}-${index}`}
                  className="flex-1 flex flex-col items-center justify-end h-full"
                >
                  <span className="text-xs text-gray-600 mb-2 font-semibold">
                    R$ {item.valor.toFixed(2)}
                  </span>

                  <div
                    className="w-full max-w-[48px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all duration-300 hover:opacity-80"
                    style={{ height }}
                    title={`${item.label}: R$ ${item.valor.toFixed(2)}`}
                  />

                  <span className="text-xs text-gray-500 mt-2">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-gray-600">Total das vendas exibidas</p>
                <p className="font-bold text-blue-700">
                  R$ {chartData.reduce((sum, item) => sum + item.valor, 0).toFixed(2)}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-gray-600">Quantidade de registros</p>
                <p className="font-bold text-green-700">{vendas.length}</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-gray-600">Média por período</p>
                <p className="font-bold text-purple-700">
                  R$ {(
                    chartData.reduce((sum, item) => sum + item.valor, 0) /
                    chartData.length
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}