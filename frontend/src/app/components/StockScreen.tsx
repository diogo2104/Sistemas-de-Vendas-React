import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  X,
  Upload,
  Save,
} from 'lucide-react';

import {
  listarProdutos,
  criarProduto,
  atualizarProduto,
  excluirProduto,
} from '../services/produtoService';
import { listarCategorias } from '../services/categoriaService';
import { listarFornecedores } from '../services/fornecedorService';

interface StockItem {
  id: number;
  nome: string;
  descricao?: string;
  categoria_id: number | '';
  categoria_nome: string;
  quantidade: number;
  quantidade_minima: number;
  preco_venda: number;
  preco_custo: number;
  fornecedor_id: number | '';
  fornecedor_nome: string;
  imagem?: string;
  ativo: number;
}

interface Categoria {
  id: number;
  nome: string;
}

interface Fornecedor {
  id: number;
  nome: string;
}

interface ProductFormData {
  nome: string;
  descricao: string;
  categoria_id: number | '';
  fornecedor_id: number | '';
  quantidade: number;
  quantidade_minima: number;
  preco_venda: number;
  preco_custo: number;
  imagem: string;
  ativo: number;
}

const initialFormData: ProductFormData = {
  nome: '',
  descricao: '',
  categoria_id: '',
  fornecedor_id: '',
  quantidade: 0,
  quantidade_minima: 0,
  preco_venda: 0,
  preco_custo: 0,
  imagem: '',
  ativo: 1,
};

export function StockScreen() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StockItem | null>(null);
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newProduct, setNewProduct] = useState<ProductFormData>(initialFormData);

  async function carregarProdutos() {
    try {
      setLoading(true);
      const data = await listarProdutos();

      const produtosConvertidos: StockItem[] = (Array.isArray(data) ? data : []).map((p: any) => ({
        id: Number(p.id),
        nome: p.nome ?? '',
        descricao: p.descricao ?? '',
        categoria_id: p.categoria_id ? Number(p.categoria_id) : '',
        categoria_nome: p.categoria_nome ?? '',
        quantidade: Number(p.quantidade ?? 0),
        quantidade_minima: Number(p.quantidade_minima ?? 0),
        preco_venda: Number(p.preco_venda ?? 0),
        preco_custo: Number(p.preco_custo ?? 0),
        fornecedor_id: p.fornecedor_id ? Number(p.fornecedor_id) : '',
        fornecedor_nome: p.fornecedor_nome ?? '',
        imagem: p.imagem ?? '',
        ativo: Number(p.ativo ?? 1),
      }));

      setStock(produtosConvertidos);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }

  async function carregarCategorias() {
    try {
      const data = await listarCategorias();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar categorias');
    }
  }

  async function carregarFornecedores() {
    try {
      const data = await listarFornecedores();
      setFornecedores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar fornecedores');
    }
  }

  useEffect(() => {
    carregarProdutos();
    carregarCategorias();
    carregarFornecedores();
  }, []);

  const filteredStock = useMemo(() => {
    return stock.filter((item) => {
      const termo = searchTerm.toLowerCase();

      const matchesSearch =
        item.nome.toLowerCase().includes(termo) ||
        item.categoria_nome.toLowerCase().includes(termo) ||
        item.fornecedor_nome.toLowerCase().includes(termo) ||
        (item.descricao || '').toLowerCase().includes(termo);

      const matchesFilter = filterLowStock
        ? item.quantidade < item.quantidade_minima
        : true;

      return matchesSearch && matchesFilter;
    });
  }, [stock, searchTerm, filterLowStock]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setImagePosition({ x: 0, y: 0, scale: 1 });
    };
    reader.readAsDataURL(file);
  };

  const handleImageDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - imagePosition.x, y: clientY - imagePosition.y });
  };

  const handleImageDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setImagePosition((prev) => ({
      ...prev,
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    }));
  };

  const handleImageDragEnd = () => {
    setIsDragging(false);
  };

  const resetForm = () => {
    setNewProduct(initialFormData);
    setImagePreview(null);
    setImagePosition({ x: 0, y: 0, scale: 1 });
    setShowAddForm(false);
    setEditingProduct(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddProduct = async () => {
    if (
      !newProduct.nome.trim() ||
      !newProduct.categoria_id ||
      !newProduct.fornecedor_id ||
      newProduct.preco_venda <= 0 ||
      newProduct.preco_custo <= 0
    ) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setSaving(true);

      await criarProduto({
        nome: newProduct.nome.trim(),
        descricao: newProduct.descricao.trim(),
        categoria_id: Number(newProduct.categoria_id),
        fornecedor_id: Number(newProduct.fornecedor_id),
        quantidade: Number(newProduct.quantidade),
        quantidade_minima: Number(newProduct.quantidade_minima),
        preco_custo: Number(newProduct.preco_custo),
        preco_venda: Number(newProduct.preco_venda),
        imagem: newProduct.imagem || '',
        ativo: Number(newProduct.ativo),
      });

      resetForm();
      await carregarProdutos();
    } catch (error) {
      console.error(error);
      alert('Erro ao cadastrar produto');
    } finally {
      setSaving(false);
    }
  };

  const handleEditProduct = (product: StockItem) => {
    setEditingProduct(product);
    setNewProduct({
      nome: product.nome,
      descricao: product.descricao || '',
      categoria_id: product.categoria_id,
      fornecedor_id: product.fornecedor_id,
      quantidade: product.quantidade,
      quantidade_minima: product.quantidade_minima,
      preco_venda: product.preco_venda,
      preco_custo: product.preco_custo,
      imagem: product.imagem || '',
      ativo: product.ativo,
    });

    setImagePreview(product.imagem || null);
    setImagePosition({ x: 0, y: 0, scale: 1 });
    setShowAddForm(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    if (
      !newProduct.nome.trim() ||
      !newProduct.categoria_id ||
      !newProduct.fornecedor_id ||
      newProduct.preco_venda <= 0 ||
      newProduct.preco_custo <= 0
    ) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setSaving(true);

      await atualizarProduto({
        id: editingProduct.id,
        nome: newProduct.nome.trim(),
        descricao: newProduct.descricao.trim(),
        categoria_id: Number(newProduct.categoria_id),
        fornecedor_id: Number(newProduct.fornecedor_id),
        quantidade: Number(newProduct.quantidade),
        quantidade_minima: Number(newProduct.quantidade_minima),
        preco_custo: Number(newProduct.preco_custo),
        preco_venda: Number(newProduct.preco_venda),
        imagem: newProduct.imagem || '',
        ativo: Number(newProduct.ativo),
      });

      resetForm();
      await carregarProdutos();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar produto');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    const confirmacao = window.confirm('Deseja realmente excluir este produto?');
    if (!confirmacao) return;

    try {
      await excluirProduto(id);
      await carregarProdutos();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir produto');
    }
  };

  const handleUpdateQuantity = (id: number, increment: boolean) => {
    const product = stock.find((item) => item.id === id);
    if (!product) return;

    const novaQuantidade = Math.max(0, product.quantidade + (increment ? 1 : -1));

    handleQuickUpdateQuantity(product, novaQuantidade);
  };

  const handleQuickUpdateQuantity = async (product: StockItem, novaQuantidade: number) => {
    try {
      await atualizarProduto({
        id: product.id,
        nome: product.nome,
        descricao: product.descricao || '',
        categoria_id: Number(product.categoria_id),
        fornecedor_id: Number(product.fornecedor_id),
        quantidade: Number(novaQuantidade),
        quantidade_minima: Number(product.quantidade_minima),
        preco_custo: Number(product.preco_custo),
        preco_venda: Number(product.preco_venda),
        imagem: product.imagem || '',
        ativo: Number(product.ativo),
      });

      await carregarProdutos();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar quantidade do produto');
    }
  };

  const totalProducts = stock.length;
  const totalValue = stock.reduce(
    (sum, item) => sum + item.preco_venda * item.quantidade,
    0
  );
  const lowStockItems = stock.filter(
    (item) => item.quantidade < item.quantidade_minima
  ).length;

  const averageMargin =
    stock.length > 0
      ? stock.reduce((sum, item) => {
          if (item.preco_venda <= 0) return sum;
          return sum + ((item.preco_venda - item.preco_custo) / item.preco_venda) * 100;
        }, 0) / stock.length
      : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-3 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm opacity-90">Total de Produtos</p>
              <p className="text-xl md:text-3xl font-bold mt-1">{totalProducts}</p>
            </div>
            <Package className="w-8 h-8 md:w-12 md:h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-3 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm opacity-90">Valor Total</p>
              <p className="text-xl md:text-3xl font-bold mt-1">
                R$ {totalValue.toFixed(2)}
              </p>
            </div>
            <span className="text-2xl md:text-4xl">💰</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-3 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm opacity-90">Estoque Baixo</p>
              <p className="text-xl md:text-3xl font-bold mt-1">{lowStockItems}</p>
            </div>
            <AlertTriangle className="w-8 h-8 md:w-12 md:h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-3 md:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm opacity-90">Margem Média</p>
              <p className="text-xl md:text-3xl font-bold mt-1">
                {averageMargin.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 md:w-12 md:h-12 opacity-80" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-3 md:p-4 flex flex-col md:flex-row gap-2 md:gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Pesquisar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 md:px-4 py-2 md:py-3 pr-10 md:pr-12 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-sm md:text-base"
          />
          <Search className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
        </div>

        <button
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors text-sm md:text-base ${
            filterLowStock
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Estoque Baixo</span>
        </button>

        <button
          onClick={() => {
            if (showAddForm) {
              resetForm();
            } else {
              setEditingProduct(null);
              setShowAddForm(true);
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Novo Produto
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 flex items-center justify-between">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">
                {editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 md:p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Imagem do Produto
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {imagePreview ? (
                    <div>
                      <div
                        className="relative w-full h-48 md:h-64 bg-gray-100 rounded-lg overflow-hidden cursor-move"
                        onMouseDown={handleImageDragStart}
                        onMouseMove={handleImageDrag}
                        onMouseUp={handleImageDragEnd}
                        onMouseLeave={handleImageDragEnd}
                        onTouchStart={handleImageDragStart}
                        onTouchMove={handleImageDrag}
                        onTouchEnd={handleImageDragEnd}
                      >
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="absolute w-full h-full object-contain"
                          style={{
                            transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imagePosition.scale})`,
                          }}
                          draggable={false}
                        />
                      </div>

                      <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() =>
                            setImagePosition((prev) => ({
                              ...prev,
                              scale: Math.min(prev.scale + 0.1, 3),
                            }))
                          }
                          className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-semibold text-sm"
                        >
                          Zoom +
                        </button>

                        <button
                          onClick={() =>
                            setImagePosition((prev) => ({
                              ...prev,
                              scale: Math.max(prev.scale - 0.1, 0.5),
                            }))
                          }
                          className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-semibold text-sm"
                        >
                          Zoom -
                        </button>

                        <button
                          onClick={() => {
                            setImagePreview(null);
                            setImagePosition({ x: 0, y: 0, scale: 1 });
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-semibold text-sm"
                        >
                          Remover
                        </button>
                      </div>

                      <p className="text-xs text-gray-500 mt-2 text-center">
                        A prévia é visual. O backend atual ainda não salva upload real da imagem.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold inline-flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Selecionar Imagem
                      </button>
                      <p className="text-sm text-gray-500 mt-2">
                        PNG, JPG ou JPEG
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={newProduct.nome}
                    onChange={(e) =>
                      setNewProduct((prev) => ({ ...prev, nome: e.target.value }))
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Digite o nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={newProduct.categoria_id}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        categoria_id: e.target.value ? Number(e.target.value) : '',
                      }))
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Selecione...</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    value={newProduct.quantidade}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        quantidade: Number(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Estoque Mínimo *
                  </label>
                  <input
                    type="number"
                    value={newProduct.quantidade_minima}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        quantidade_minima: Number(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Preço de Venda *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.preco_venda}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        preco_venda: Number(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Preço de Custo *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.preco_custo}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        preco_custo: Number(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Fornecedor *
                  </label>
                  <select
                    value={newProduct.fornecedor_id}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        fornecedor_id: e.target.value ? Number(e.target.value) : '',
                      }))
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Selecione...</option>
                    {fornecedores.map((fornecedor) => (
                      <option key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newProduct.ativo}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        ativo: Number(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value={1}>Ativo</option>
                    <option value={0}>Inativo</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={newProduct.descricao}
                    onChange={(e) =>
                      setNewProduct((prev) => ({ ...prev, descricao: e.target.value }))
                    }
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="Descrição do produto"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={editingProduct ? handleSaveEdit : handleAddProduct}
                  disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <Save className="w-5 h-5" />
                  {saving
                    ? 'Salvando...'
                    : editingProduct
                    ? 'Salvar Alterações'
                    : 'Salvar Produto'}
                </button>

                <button
                  onClick={resetForm}
                  className="flex-1 sm:flex-none bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          Carregando produtos...
        </div>
      ) : (
        <>
          <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Produto</th>
                    <th className="px-6 py-4 text-left font-semibold">Categoria</th>
                    <th className="px-6 py-4 text-center font-semibold">Quantidade</th>
                    <th className="px-6 py-4 text-left font-semibold">Preços</th>
                    <th className="px-6 py-4 text-left font-semibold">Margem</th>
                    <th className="px-6 py-4 text-left font-semibold">Fornecedor</th>
                    <th className="px-6 py-4 text-center font-semibold">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredStock.map((item, index) => {
                    const isLowStock = item.quantidade < item.quantidade_minima;
                    const margin =
                      item.preco_venda > 0
                        ? ((item.preco_venda - item.preco_custo) / item.preco_venda) * 100
                        : 0;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl overflow-hidden">
                              {item.imagem ? (
                                <img
                                  src={item.imagem}
                                  alt={item.nome}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                '📦'
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{item.nome}</p>
                              <p className="text-xs text-gray-500">
                                {item.ativo ? 'Ativo' : 'Inativo'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {item.categoria_nome || '-'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, false)}
                              className="w-7 h-7 bg-red-100 hover:bg-red-200 text-red-600 rounded flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <div className="text-center min-w-[60px]">
                              <p
                                className={`text-xl font-bold ${
                                  isLowStock ? 'text-red-600' : 'text-gray-800'
                                }`}
                              >
                                {item.quantidade}
                              </p>
                              <p className="text-xs text-gray-500">
                                Min: {item.quantidade_minima}
                              </p>
                              {isLowStock && (
                                <p className="text-xs text-red-600 font-semibold flex items-center justify-center gap-1 mt-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Baixo
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => handleUpdateQuantity(item.id, true)}
                              className="w-7 h-7 bg-green-100 hover:bg-green-200 text-green-600 rounded flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="text-gray-600">Venda:</span>{' '}
                              <span className="font-bold text-green-600">
                                R$ {item.preco_venda.toFixed(2)}
                              </span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-600">Custo:</span>{' '}
                              <span className="font-bold text-gray-700">
                                R$ {item.preco_custo.toFixed(2)}
                              </span>
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                              margin > 30
                                ? 'bg-green-100 text-green-700'
                                : margin > 15
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {margin > 20 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            <span className="font-bold text-sm">{margin.toFixed(1)}%</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-gray-700 text-sm">
                          {item.fornecedor_nome || '-'}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditProduct(item)}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(item.id)}
                              className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden space-y-3">
            {filteredStock.map((item) => {
              const isLowStock = item.quantidade < item.quantidade_minima;
              const margin =
                item.preco_venda > 0
                  ? ((item.preco_venda - item.preco_custo) / item.preco_venda) * 100
                  : 0;

              return (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex gap-3 mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl flex-shrink-0 overflow-hidden">
                      {item.imagem ? (
                        <img
                          src={item.imagem}
                          alt={item.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        '📦'
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-1">{item.nome}</h3>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {item.categoria_nome || '-'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Fornecedor: {item.fornecedor_nome || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Quantidade</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, false)}
                          className="w-7 h-7 bg-red-100 hover:bg-red-200 text-red-600 rounded flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <p
                          className={`text-lg font-bold ${
                            isLowStock ? 'text-red-600' : 'text-gray-800'
                          }`}
                        >
                          {item.quantidade}
                        </p>

                        <button
                          onClick={() => handleUpdateQuantity(item.id, true)}
                          className="w-7 h-7 bg-green-100 hover:bg-green-200 text-green-600 rounded flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {isLowStock && (
                        <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          Estoque baixo (Min: {item.quantidade_minima})
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 mb-1">Preços</p>
                      <p className="text-sm">
                        <span className="text-gray-600">Venda:</span>{' '}
                        <span className="font-bold text-green-600">
                          R$ {item.preco_venda.toFixed(2)}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Custo:</span>{' '}
                        <span className="font-bold text-gray-700">
                          R$ {item.preco_custo.toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                        margin > 30
                          ? 'bg-green-100 text-green-700'
                          : margin > 15
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {margin > 20 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span className="font-bold text-xs">
                        Margem: {margin.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProduct(item)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(item.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && filteredStock.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-10 text-center">
              <Package className="mx-auto w-10 h-10 text-gray-300 mb-3" />
              <h3 className="text-lg font-semibold text-gray-700">
                Nenhum produto encontrado
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Cadastre um produto novo ou ajuste os filtros da busca.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}