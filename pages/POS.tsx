import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Product, CartItem, Transaction, TransactionType, PaymentMethod } from '../types';
import { Search, Plus, Minus, Trash, CheckCircle } from 'lucide-react';

const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastTransactionId, setLastTransactionId] = useState('');

  useEffect(() => {
    setProducts(StorageService.getProducts());
  }, []);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        // Don't add if exceeds stock
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        // Check stock limit
        const product = products.find(p => p.id === id);
        if (product && newQty > product.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const transaction: Transaction = {
      id: `TRX-${Date.now()}`,
      date: new Date().toISOString(),
      type: TransactionType.SALE,
      paymentMethod,
      totalAmount: cartTotal,
      items: cart.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        priceAtTransaction: item.price,
        costAtTransaction: item.cost
      }))
    };

    StorageService.addTransaction(transaction);
    setLastTransactionId(transaction.id);
    setIsSuccessModalOpen(true);
    
    // Reset
    setCart([]);
    setProducts(StorageService.getProducts()); // Refresh stock
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-6">
      {/* Left: Product Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="mb-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari produk..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => addToCart(product)}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 p-3 cursor-pointer transition-all hover:shadow-md ${product.stock === 0 ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="aspect-square rounded-lg bg-gray-100 mb-3 overflow-hidden">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-medium text-gray-800 line-clamp-2 leading-tight h-10">{product.name}</h4>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-indigo-600 font-bold">Rp {product.price.toLocaleString('id-ID')}</span>
                  <span className={`text-xs px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.stock} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-full lg:w-96 bg-white rounded-xl shadow-lg flex flex-col border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-800">Keranjang Belanja</h3>
          <p className="text-xs text-gray-500">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Plus size={48} className="mb-2 opacity-20" />
              <p>Keranjang kosong</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3">
                <img src={item.imageUrl} className="w-12 h-12 rounded object-cover bg-gray-100" alt="" />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800 text-sm">{item.name}</h5>
                  <p className="text-indigo-600 text-sm font-semibold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                    <Trash size={14} />
                  </button>
                  <div className="flex items-center gap-2 bg-gray-100 rounded px-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-indigo-600"><Minus size={12} /></button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-indigo-600"><Plus size={12} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Total</span>
            <span className="font-bold text-xl text-indigo-700">Rp {cartTotal.toLocaleString('id-ID')}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[PaymentMethod.CASH, PaymentMethod.QRIS, PaymentMethod.TRANSFER].map(method => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`text-xs py-2 rounded border font-medium transition-colors ${
                  paymentMethod === method 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl shadow transition-colors"
          >
            Bayar Sekarang
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Transaksi Berhasil!</h3>
            <p className="text-gray-500 mb-6">ID: {lastTransactionId}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsSuccessModalOpen(false)}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium"
              >
                Tutup
              </button>
              <button 
                onClick={() => {
                   alert("Fitur cetak struk akan menggunakan printer thermal browser.");
                   setIsSuccessModalOpen(false);
                }}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
              >
                Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;