import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { GeminiService } from '../services/geminiService';
import { Transaction, Product } from '../types';
import { Sparkles, Download, FileText, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Note: In a real environment, install this. We will simulate simple text rendering.

const Reports: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  useEffect(() => {
    setTransactions(StorageService.getTransactions());
  }, []);

  const handleGenerateInsight = async () => {
    setIsLoadingAi(true);
    const products = StorageService.getProducts();
    const result = await GeminiService.analyzeBusiness(transactions, products);
    setAiAnalysis(result);
    setIsLoadingAi(false);
  };

  const handleDownloadCSV = () => {
    const headers = ["ID", "Tanggal", "Tipe", "Total", "Metode", "Item"];
    const rows = transactions.map(t => [
      t.id,
      t.date,
      t.type,
      t.totalAmount,
      t.paymentMethod,
      t.items.map(i => `${i.productName} (${i.quantity})`).join('; ')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_ibd_umkm_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Laporan & Analisis</h2>
        <button 
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors border border-indigo-200"
        >
          <Download size={18} /> Ekspor Data (CSV)
        </button>
      </div>

      {/* AI Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-1 shadow-lg">
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Analisis Cerdas AI</h3>
              <p className="text-sm text-gray-500">Dapatkan wawasan strategis dari data penjualan Anda.</p>
            </div>
            {/* API Key Warning placeholder if needed, handled in service */}
          </div>

          <div className="bg-slate-50 rounded-lg p-6 min-h-[150px] border border-slate-100">
             {isLoadingAi ? (
               <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                 <Loader2 size={32} className="animate-spin mb-3 text-indigo-500" />
                 <p>Sedang menganalisis data bisnis Anda...</p>
               </div>
             ) : aiAnalysis ? (
               <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-line">
                 {aiAnalysis}
               </div>
             ) : (
               <div className="text-center py-8">
                 <p className="text-gray-500 mb-4">Belum ada analisis.</p>
                 <button 
                  onClick={handleGenerateInsight}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 shadow-md transition-all"
                 >
                   Mulai Analisis Sekarang
                 </button>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <FileText size={20} className="text-gray-400" />
          <h3 className="font-bold text-gray-800">Riwayat Transaksi Terakhir</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">ID Transaksi</th>
                <th className="px-6 py-3 font-medium">Tanggal</th>
                <th className="px-6 py-3 font-medium">Metode</th>
                <th className="px-6 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.slice().reverse().slice(0, 10).map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-800">{t.id}</td>
                  <td className="px-6 py-3 text-gray-600">
                    {new Date(t.date).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 border border-gray-200">
                      {t.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-bold text-indigo-600">
                    Rp {t.totalAmount.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    Belum ada data transaksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;