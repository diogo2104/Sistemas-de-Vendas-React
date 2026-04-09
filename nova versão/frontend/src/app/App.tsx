import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { SalesChart } from './components/SalesChart';
import { StockPieChart } from './components/StockPieChart';
import { SalesScreen } from './components/SalesScreen';
import { CustomersScreen } from './components/CustomersScreen';
import { StockScreen } from './components/StockScreen';
import { ReportsScreen } from './components/ReportsScreen';

interface Sale {
  id: number;
  date: string;
  customerName: string;
  items: { id: number; name: string; quantity: number; price: number }[];
  total: number;
  paymentMethod: string;
  isAccountSale: boolean;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sales, setSales] = useState<Sale[]>([]);

  const handleSaleCompleted = (sale: Sale) => {
    setSales((prevSales) => [sale, ...prevSales]);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onNavigateToSales={() => setActiveTab('vendas')} />

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'dashboard' && (
            <>
              {/* Dashboard Title */}
              <div className="bg-white rounded-lg shadow-sm px-4 md:px-6 py-3 md:py-4 mb-4 md:mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">
                  A
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Left Column - Charts */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                  {/* Charts Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <SalesChart />
                    <StockPieChart />
                  </div>
                </div>

                {/* Right Column - Summary */}
                <div className="lg:col-span-1">
                  <SummaryCards />

                  {/* Additional Monitor Image */}
                  <div className="mt-4 md:mt-6 bg-white rounded-lg shadow-md p-4">
                    <div className="w-full h-32 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 rounded-lg flex items-center justify-center">
                      <div className="text-4xl md:text-6xl">🖥️</div>
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <span className="text-gray-600">Eletrônicos</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span className="text-gray-600">Acessórios</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                        <span className="text-gray-600">20%</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'vendas' && (
            <>
              {/* Sales Title */}
              <div className="bg-white rounded-lg shadow-sm px-6 py-4 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  V
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Área de Vendas</h1>
              </div>
              <SalesScreen onSaleCompleted={handleSaleCompleted} />
            </>
          )}

          {activeTab === 'clientes' && (
            <>
              {/* Customers Title */}
              <div className="bg-white rounded-lg shadow-sm px-6 py-4 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  C
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
              </div>
              <CustomersScreen />
            </>
          )}

          {activeTab === 'estoque' && (
            <>
              {/* Stock Title */}
              <div className="bg-white rounded-lg shadow-sm px-6 py-4 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                  E
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Controle de Estoque</h1>
              </div>
              <StockScreen />
            </>
          )}

          {activeTab === 'relatorios' && (
            <>
              {/* Reports Title */}
              <div className="bg-white rounded-lg shadow-sm px-6 py-4 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                  R
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
              </div>
              <ReportsScreen sales={sales} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;