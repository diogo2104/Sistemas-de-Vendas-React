import { ShoppingCart } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
}

const products: Product[] = [
  {
    id: 1,
    name: 'Laptop HP',
    price: 'R$ 3,500.00',
    image: 'figma:asset/aa6cae8a345dd41f8729a1288b64f3144558cfa8.png',
  },
  {
    id: 2,
    name: 'Mouse Gamer',
    price: 'R$ 150.00',
    image: 'figma:asset/aa6cae8a345dd41f8729a1288b64f3144558cfa8.png',
  },
  {
    id: 3,
    name: 'Smartphone',
    price: 'R$ 2,200.00',
    image: 'figma:asset/aa6cae8a345dd41f8729a1288b64f3144558cfa8.png',
  },
];

export function ProductGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-md p-3 md:p-4 flex flex-col items-center"
        >
          <div className="w-full h-24 md:h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-3 flex items-center justify-center">
            <div className="text-4xl md:text-5xl">
              {product.id === 1 && '💻'}
              {product.id === 2 && '🖱️'}
              {product.id === 3 && '📱'}
            </div>
          </div>
          <h3 className="font-bold text-gray-800 mb-1 text-sm md:text-base">{product.name}</h3>
          <p className="text-gray-600 mb-3 text-sm md:text-base">{product.price}</p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base">
            <ShoppingCart className="w-4 h-4" />
            Adicionar
          </button>
        </div>
      ))}
    </div>
  );
}