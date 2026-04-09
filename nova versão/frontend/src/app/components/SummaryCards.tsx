import { useEffect, useState } from 'react';
import { Users, ShoppingCart, Package, AlertTriangle, DollarSign } from 'lucide-react';
import {
  buscarResumoDashboard,
  buscarTotalReceber,
} from '../services/dashboardService';

interface SummaryItem {
  id: number;
  label: string;
  value: string;
  icon: any;
  color: string;
}

export function SummaryCards() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SummaryItem[]>([]);

  async function carregarResumo() {
    try {
      setLoading(true);

      const resumo = await buscarResumoDashboard();
      const contas = await buscarTotalReceber();

      const resumoFormatado: SummaryItem[] = [
        {
          id: 1,
          label: 'Clientes',
          value: String(resumo.total_clientes ?? 0),
          icon: Users,
          color: 'text-blue-400',
        },
        {
          id: 2,
          label: 'Vendas Totais',
          value: `R$ ${(resumo.valor_total_vendido ?? 0).toFixed(2)}`,
          icon: ShoppingCart,
          color: 'text-green-400',
        },
        {
          id: 3,
          label: 'Produtos',
          value: String(resumo.total_produtos ?? 0),
          icon: Package,
          color: 'text-purple-400',
        },
        {
          id: 4,
          label: 'Estoque Baixo',
          value: String(resumo.produtos_estoque_baixo ?? 0),
          icon: AlertTriangle,
          color: 'text-yellow-400',
        },
        {
          id: 5,
          label: 'A Receber',
          value: `R$ ${(contas.valor_pendente ?? 0).toFixed(2)}`,
          icon: DollarSign,
          color: 'text-red-400',
        },
      ];

      setData(resumoFormatado);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarResumo();
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#2d4a6d] to-[#1e3a5f] rounded-lg p-6 shadow-lg">
      <h2 className="text-white text-xl font-bold mb-4">Resumo</h2>

      {loading ? (
        <div className="text-white text-center py-6">Carregando...</div>
      ) : (
        <div className="space-y-4">
          {data.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className="bg-[#1e3a5f]/50 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-8 h-8 ${item.color}`} />
                  <span className="text-white text-sm">{item.label}</span>
                </div>

                <span className="text-white text-2xl font-bold">
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}