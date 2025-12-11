import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storageService';
import { Transaction, Product, TransactionType } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { TrendingUp, AlertTriangle, Package, DollarSign } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [metrics, setMetrics] = useState({
    dailySales: 0,
    monthlySales: 0,
    totalProfit: 0,
    lowStock: 0
  });

  useEffect(() => {
    const loadedTx = StorageService.getTransactions();
    const loadedProd = StorageService.getProducts();
    setTransactions(loadedTx);
    setProducts(loadedProd);

    // Calculate Metrics
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    let dSales = 0;
    let mSales = 0;
    let profit = 0;

    loadedTx.filter(t => t.type === TransactionType.SALE).forEach(t => {
      const tDate = t.date.split('T')[0];
      if (tDate === today) dSales += t.totalAmount;
      if (tDate.startsWith(thisMonth)) mSales += t.totalAmount;

      // Simple profit calc (Total - Cost of goods sold)
      const costOfGoods = t.items.reduce((acc, item) => acc + (item.costAtTransaction * item.quantity), 0);
      profit += (t.totalAmount - costOfGoods);
    });

    setMetrics({
      dailySales: dSales,
      monthlySales: mSales,
      totalProfit: profit,
      lowStock: loadedProd.filter(p => p.stock < 10).length
    });
  }, []);

  // Prepare chart data (Last 7 days sales)
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    
    const dayTotal = transactions
      .filter(t => t.type === TransactionType.SALE && t.date.startsWith(dateStr))
      .reduce((sum, t) => sum + t.totalAmount, 0);

    return {
      name: d.toLocaleDateString('id-ID', { weekday: 'short' }),
      total: dayTotal
    };
  });

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-2 text-gray-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color} text-white`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dasbor Bisnis</h2>
          <p className="text-gray-500">Ringkasan kinerja toko Anda hari ini.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Penjualan Hari Ini" 
          value={`Rp ${metrics.dailySales.toLocaleString('id-ID')}`} 
          icon={<DollarSign size={20} />} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Penjualan Bulan Ini" 
          value={`Rp ${metrics.monthlySales.toLocaleString('id-ID')}`} 
          icon={<TrendingUp size={20} />} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Estimasi Laba Kotor" 
          value={`Rp ${metrics.totalProfit.toLocaleString('id-ID')}`} 
          icon={<Package size={20} />} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Stok Menipis" 
          value={`${metrics.lowStock} Item`} 
          icon={<AlertTriangle size={20} />} 
          color="bg-amber-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Tren Penjualan (7 Hari Terakhir)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Produk Stok Rendah</h3>
          <div className="space-y-4">
            {products.filter(p => p.stock < 10).slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-3 pb-3 border-b border-gray-50 last:border-0">
                <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">Sisa: <span className="text-red-500 font-bold">{p.stock} {p.unit}</span></p>
                </div>
              </div>
            ))}
            {products.filter(p => p.stock < 10).length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                Semua stok aman
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;