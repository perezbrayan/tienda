import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-hot-toast';
import { RobloxProduct } from '../services/robloxService';
import { ShoppingCart, Gamepad, Package, X } from 'lucide-react';
import axios from 'axios';

const RobloxShop = () => {
  const [products, setProducts] = useState<RobloxProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [robloxId, setRobloxId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<RobloxProduct | null>(null);
  const [proofImage, setProofImage] = useState<File | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await robloxService.getProducts();
      console.log('Productos cargados:', data);
      setProducts(data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: RobloxProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!robloxId.trim()) {
      toast.error('Por favor ingresa tu ID de Roblox');
      return;
    }

    if (!proofImage) {
      toast.error('Por favor sube un comprobante de pago');
      return;
    }

    if (!selectedProduct) return;

    try {
      const formData = new FormData();
      formData.append('user_id', robloxId);
      formData.append('store_type', 'roblox');
      formData.append('product_id', selectedProduct.id.toString());
      formData.append('product_name', selectedProduct.title);
      formData.append('amount', selectedProduct.price.toString());
      formData.append('proof_image', proofImage);

      const response = await axios.post('/api/payment-proofs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Comprobante enviado correctamente');
        setIsModalOpen(false);
        setRobloxId('');
        setProofImage(null);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Error al enviar el comprobante:', error);
      toast.error('Error al enviar el comprobante');
    }
  };

  const filteredProducts = selectedType 
    ? products.filter(product => product.type === selectedType)
    : products;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#051923] to-[#003554] py-12">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Completar Compra</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">ID de Roblox</label>
                <input
                  type="text"
                  value={robloxId}
                  onChange={(e) => setRobloxId(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingresa tu ID de Roblox"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Comprobante de Pago</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofImage(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors duration-300"
              >
                Enviar Comprobante
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-blue-500/20 rounded-2xl mb-6">
            <Gamepad className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Tienda Roblox
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Encuentra los mejores productos de Roblox y Bloxy Fruits
          </p>
        </div>

        {/* Filter Section */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setSelectedType(null)}
            className={\`px-6 py-3 rounded-xl transition-all \${
              !selectedType 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
            }\`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedType('robux')}
            className={\`px-6 py-3 rounded-xl transition-all \${
              selectedType === 'robux'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
            }\`}
          >
            Robux
          </button>
          <button
            onClick={() => setSelectedType('bloxyfruit')}
            className={\`px-6 py-3 rounded-xl transition-all \${
              selectedType === 'bloxyfruit'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
            }\`}
          >
            Bloxy Fruits
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-400">Cargando productos...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="p-4 bg-red-500/20 rounded-full">
              <Package className="w-12 h-12 text-red-400" />
            </div>
            <p className="text-red-400">{error}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="relative aspect-square">
                  <img
                    src={product.image_url || '/placeholder-roblox.png'}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-roblox.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-blue-600/90 backdrop-blur-sm text-white text-sm font-medium rounded-lg">
                      {product.type?.toUpperCase() || 'ROBLOX'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{product.title}</h3>
                  <p className="text-gray-400 mb-4 text-sm line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Precio</p>
                      <p className="text-2xl font-bold text-blue-400">
                        ${product.price.toFixed(2)}
                      </p>
                      {product.amount && (
                        <p className="text-sm text-gray-500 mt-1">
                          Cantidad: {product.amount}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-300 shadow-lg shadow-blue-500/20"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="p-4 bg-gray-800/50 rounded-full">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-400">No hay productos disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RobloxShop; 