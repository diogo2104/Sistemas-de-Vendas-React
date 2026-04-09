import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Download,
  Printer,
  X,
  CheckCircle,
} from 'lucide-react';

import { listarClientes } from '../services/clienteService';
import { listarProdutos } from '../services/produtoService';
import { criarVenda } from '../services/vendaService';

interface Product {
  id: number;
  nome: string;
  preco_venda: number;
  quantidade: number;
  categoria_nome: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Customer {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
}

interface Sale {
  id: number;
  date: string;
  customerName: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  isAccountSale: boolean;
}

interface SalesScreenProps {
  onSaleCompleted?: (sale: Sale) => void;
}

const paymentOptions = [
  { id: 1, value: 'dinheiro', label: 'Dinheiro' },
  { id: 2, value: 'pix', label: 'PIX' },
  { id: 3, value: 'cartao_credito', label: 'Cartão de Crédito' },
  { id: 4, value: 'cartao_debito', label: 'Cartão de Débito' },
  { id: 5, value: 'conta_corrente', label: 'Conta Corrente (A Prazo)' },
];

export function SalesScreen({ onSaleCompleted }: SalesScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');
  const [isAccountSale, setIsAccountSale] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [vencimento, setVencimento] = useState('');
  const invoiceRef = useRef<HTMLDivElement>(null);

  async function carregarClientes() {
    try {
      const data = await listarClientes();

      const clientesConvertidos: Customer[] = (Array.isArray(data) ? data : []).map((c: any) => ({
        id: Number(c.id),
        nome: c.nome ?? '',
        cpf: c.cpf ?? '',
        telefone: c.telefone ?? '',
        email: c.email ?? '',
      }));

      setCustomers(clientesConvertidos);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar clientes');
    }
  }

  async function carregarProdutos() {
    try {
      const data = await listarProdutos();

      const produtosConvertidos: Product[] = (Array.isArray(data) ? data : []).map((p: any) => ({
        id: Number(p.id),
        nome: p.nome ?? '',
        preco_venda: Number(p.preco_venda ?? 0),
        quantidade: Number(p.quantidade ?? 0),
        categoria_nome: p.categoria_nome ?? '',
      }));

      setProducts(produtosConvertidos);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar produtos');
    }
  }

  async function carregarDados() {
    try {
      setLoading(true);
      await Promise.all([carregarClientes(), carregarProdutos()]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoria_nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (customer) =>
        customer.nome.toLowerCase().includes(customerSearch.toLowerCase()) ||
        (customer.cpf || '').includes(customerSearch)
    );
  }, [customers, customerSearch]);

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity < product.quantidade) {
        setCart(
          cart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
      } else {
        alert('Quantidade máxima disponível em estoque atingida.');
      }
    } else {
      if (product.quantidade <= 0) {
        alert('Produto sem estoque disponível.');
        return;
      }

      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    if (newQuantity <= product.quantidade) {
      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    } else {
      alert('Quantidade maior do que o estoque disponível.');
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.nome);
    setCustomerSearch(customer.nome);
    setShowCustomerDropdown(false);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.preco_venda * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const finalizeSale = async () => {
    if (cart.length === 0) {
      alert('Adicione produtos ao carrinho.');
      return;
    }

    if (!selectedCustomer) {
      alert('Selecione um cliente para a venda.');
      return;
    }

    if (isAccountSale && !vencimento) {
      alert('Informe a data de vencimento para venda a prazo.');
      return;
    }

    const formaSelecionada = paymentOptions.find((option) => option.value === paymentMethod);

    if (!formaSelecionada) {
      alert('Forma de pagamento inválida.');
      return;
    }

    try {
      setFinalizing(true);

      const payload = {
        cliente_id: selectedCustomer.id,
        forma_pagamento_id: formaSelecionada.id,
        tipo_pagamento: isAccountSale ? 'aprazo' : 'avista',
        desconto: 0,
        acrescimo: 0,
        observacao: isAccountSale ? 'Venda a prazo' : 'Venda à vista',
        vencimento: isAccountSale ? vencimento : null,
        itens: cart.map((item) => ({
          produto_id: item.id,
          quantidade: item.quantity,
        })),
      };

      const response = await criarVenda(payload);

      const sale: Sale = {
        id: Number(response?.venda_id ?? Date.now()),
        date: new Date().toLocaleDateString('pt-BR'),
        customerName: selectedCustomer.nome,
        items: [...cart],
        total: Number(response?.valor_total ?? subtotal),
        paymentMethod,
        isAccountSale,
      };

      setCompletedSale(sale);
      setShowInvoiceModal(true);

      if (onSaleCompleted) {
        onSaleCompleted(sale);
      }

      await carregarProdutos();
    } catch (error) {
      console.error(error);
      alert('Erro ao finalizar venda');
    } finally {
      setFinalizing(false);
    }
  };

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setCart([]);
    setCustomerName('');
    setCustomerSearch('');
    setSelectedCustomer(null);
    setPaymentMethod('dinheiro');
    setIsAccountSale(false);
    setVencimento('');
    setCompletedSale(null);
  };

  const handlePrint = () => {
    if (invoiceRef.current) {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Nota Fiscal</title>');
        printWindow.document.write('<style>');
        printWindow.document.write('body { font-family: Arial, sans-serif; padding: 20px; }');
        printWindow.document.write('table { width: 100%; border-collapse: collapse; margin: 20px 0; }');
        printWindow.document.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }');
        printWindow.document.write('th { background-color: #2563eb; color: white; }');
        printWindow.document.write('.header { text-align: center; margin-bottom: 30px; }');
        printWindow.document.write('.total { font-size: 18px; font-weight: bold; margin-top: 20px; }');
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(invoiceRef.current.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownload = () => {
    if (invoiceRef.current && completedSale) {
      const invoiceContent = invoiceRef.current.innerHTML;
      const blob = new Blob(
        [
          `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Nota Fiscal - ${completedSale.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #2563eb; color: white; }
            .header { text-align: center; margin-bottom: 30px; }
            .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          ${invoiceContent}
        </body>
        </html>
      `,
        ],
        { type: 'text/html' }
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nota-fiscal-${completedSale.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 h-full">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-md p-3 md:p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar produto ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 md:px-4 py-2 md:py-3 pr-10 md:pr-12 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-sm md:text-base"
              />
              <Search className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3 md:p-4">
            <h3 className="font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              Produtos Disponíveis
            </h3>

            {loading ? (
              <div className="text-center py-10 text-gray-500">Carregando produtos...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 max-h-[calc(100vh-280px)] overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 rounded-lg p-3 md:p-4 transition-all hover:shadow-lg group"
                  >
                    <div className="text-3xl md:text-4xl mb-2">📦</div>
                    <h4 className="font-bold text-xs md:text-sm text-gray-800 mb-1 line-clamp-2 h-8 md:h-10">
                      {product.nome}
                    </h4>
                    <p className="text-[10px] md:text-xs text-gray-600 mb-2">
                      {product.categoria_nome}
                    </p>
                    <div className="flex items-center justify-between flex-col sm:flex-row gap-1">
                      <span className="text-sm md:text-lg font-bold text-blue-600">
                        R$ {product.preco_venda.toFixed(2)}
                      </span>
                      <span className="text-[10px] md:text-xs text-gray-500">
                        Est: {product.quantidade}
                      </span>
                    </div>
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] md:text-xs text-blue-600 font-semibold">
                        Clique para adicionar
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 bg-gradient-to-br from-[#2d4a6d] to-[#1e3a5f] rounded-lg shadow-lg p-4 md:p-5 flex flex-col min-h-[500px] lg:min-h-0">
          <h3 className="text-white text-lg md:text-xl font-bold mb-3 md:mb-4">
            Carrinho de Compras
          </h3>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3 md:mb-4">
            <label className="text-white text-xs md:text-sm mb-1 block">
              Cliente
            </label>

            <div className="relative">
              <input
                type="text"
                placeholder="Buscar cliente cadastrado..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                className="w-full px-3 py-2 rounded bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
              />

              {showCustomerDropdown && filteredCustomers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => selectCustomer(customer)}
                      className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors text-sm"
                    >
                      <p className="font-semibold text-gray-800">{customer.nome}</p>
                      <p className="text-xs text-gray-500">
                        {customer.cpf || 'Sem CPF'} • {customer.telefone || 'Sem telefone'}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {selectedCustomer && (
                <div className="mt-2 p-2 bg-green-500/20 border border-green-400/50 rounded text-green-100 text-xs">
                  ✓ Cliente selecionado: {selectedCustomer.nome}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mb-3 md:mb-4 space-y-2">
            {cart.length === 0 ? (
              <div className="text-center text-white/60 py-8">
                <ShoppingCart className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm md:text-base">Carrinho vazio</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white text-xs md:text-sm font-semibold flex-1 pr-2">
                      {item.nome}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 bg-white/20 hover:bg-white/30 rounded flex items-center justify-center text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="text-white font-bold w-6 md:w-8 text-center text-sm md:text-base">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 bg-white/20 hover:bg-white/30 rounded flex items-center justify-center text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-white font-bold text-sm md:text-base">
                      R$ {(item.preco_venda * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <div className="text-[10px] md:text-xs text-white/60 mt-1">
                    Unitário: R$ {item.preco_venda.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3 md:mb-4">
            <label className="text-white text-xs md:text-sm mb-2 block">
              Forma de Pagamento
            </label>

            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                const contaCorrente = e.target.value === 'conta_corrente';
                setIsAccountSale(contaCorrente);
                if (!contaCorrente) {
                  setVencimento('');
                }
              }}
              className="w-full px-3 py-2 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
            >
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {isAccountSale && (
              <>
                <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-400/50 rounded text-yellow-100 text-xs">
                  ⚠️ Esta venda será registrada como venda a prazo.
                </div>

                <div className="mt-3">
                  <label className="text-white text-xs md:text-sm mb-1 block">
                    Vencimento
                  </label>
                  <input
                    type="date"
                    value={vencimento}
                    onChange={(e) => setVencimento(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  />
                </div>
              </>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 mb-3 md:mb-4">
            <div className="flex justify-between text-white mb-2">
              <span className="text-sm md:text-base">Itens:</span>
              <span className="font-bold text-sm md:text-base">{totalItems}</span>
            </div>
            <div className="flex justify-between text-white text-lg md:text-xl font-bold">
              <span>Total:</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={finalizeSale}
            disabled={finalizing}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 md:py-3 rounded-lg transition-colors shadow-lg text-sm md:text-base disabled:opacity-70"
          >
            {finalizing ? 'Finalizando...' : 'Finalizar Venda'}
          </button>
        </div>
      </div>

      {showInvoiceModal && completedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-green-600 text-white p-4 md:p-6 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8" />
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Venda Finalizada!</h2>
                  <p className="text-sm text-green-100">Pedido #{completedSale.id}</p>
                </div>
              </div>
              <button
                onClick={closeInvoiceModal}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6" ref={invoiceRef}>
              <div className="header border-b-2 border-gray-300 pb-4 mb-6">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    DP
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-center text-gray-800">
                  De Paula Systems
                </h1>
                <p className="text-center text-gray-600 text-sm">
                  Software e Tecnologia
                </p>
                <p className="text-center text-gray-600 text-sm mt-2">
                  CNPJ: 00.000.000/0001-00
                </p>
                <p className="text-center text-gray-600 text-sm">
                  contato@depaulasystems.com.br
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  Nota Fiscal Simplificada
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Número do Pedido:</p>
                    <p className="font-bold text-gray-800">#{completedSale.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Data:</p>
                    <p className="font-bold text-gray-800">{completedSale.date}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cliente:</p>
                    <p className="font-bold text-gray-800">{completedSale.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Pagamento:</p>
                    <p className="font-bold text-gray-800">
                      {paymentOptions.find((p) => p.value === completedSale.paymentMethod)?.label}
                    </p>
                  </div>
                </div>
              </div>

              <table className="w-full mb-6">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-4 py-3 text-left">Produto</th>
                    <th className="px-4 py-3 text-center">Qtd</th>
                    <th className="px-4 py-3 text-right">Preço Unit.</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {completedSale.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-3">{item.nome}</td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">
                        R$ {item.preco_venda.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        R$ {(item.preco_venda * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="total text-right border-t-2 border-gray-300 pt-4">
                <p className="text-gray-600 mb-2">
                  Total de Itens:{' '}
                  {completedSale.items.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  TOTAL: R$ {completedSale.total.toFixed(2)}
                </p>
              </div>

              {completedSale.isAccountSale && (
                <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                  <p className="text-yellow-800 font-bold text-center">
                    ⚠️ VENDA A PRAZO - REGISTRADO NA CONTA CORRENTE
                  </p>
                </div>
              )}

              <div className="mt-6 text-center text-xs text-gray-500">
                <p>Obrigado pela preferência!</p>
                <p>De Paula Systems - Seu parceiro em tecnologia</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-100 p-4 flex flex-col sm:flex-row gap-3 rounded-b-lg">
              <button
                onClick={handleDownload}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-5 h-5" />
                Baixar Nota Fiscal
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Printer className="w-5 h-5" />
                Imprimir
              </button>
              <button
                onClick={closeInvoiceModal}
                className="sm:flex-none bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}