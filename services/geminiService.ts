import { GoogleGenAI } from "@google/genai";
import { Transaction, Product, TransactionType } from "../types";

const getAIClient = () => {
  // In a real app, this should be handled securely. 
  // For this demo, we assume the key is in process.env
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const GeminiService = {
  analyzeBusiness: async (
    transactions: Transaction[],
    products: Product[]
  ): Promise<string> => {
    if (!process.env.API_KEY) {
      return "Kunci API (API Key) tidak ditemukan. Silakan konfigurasi environment variable.";
    }

    try {
      const ai = getAIClient();
      
      // Prepare data summary for the AI
      const sales = transactions.filter(t => t.type === TransactionType.SALE);
      const recentSales = sales.slice(-20); // Last 20 sales for context
      const lowStockProducts = products.filter(p => p.stock < 10).map(p => p.name);
      
      const totalRevenue = sales.reduce((sum, t) => sum + t.totalAmount, 0);
      
      const prompt = `
        Bertindaklah sebagai Konsultan Bisnis Digital untuk UMKM di Indonesia.
        Saya memiliki data berikut:
        
        1. Total Pendapatan Tercatat: Rp ${totalRevenue.toLocaleString('id-ID')}
        2. Jumlah Produk Stok Rendah (<10): ${lowStockProducts.length} (${lowStockProducts.join(', ')})
        3. Sampel 20 Transaksi Terakhir (JSON): ${JSON.stringify(recentSales.map(s => ({ d: s.date, t: s.totalAmount, i: s.items.map(i => i.productName) })))}

        Berikan analisis singkat dan saran strategis dalam format Markdown.
        Fokus pada:
        - Tren penjualan (jika terlihat).
        - Saran restocking untuk barang yang menipis.
        - Ide promosi berdasarkan item yang sering dibeli.
        - Gunakan bahasa Indonesia yang profesional namun menyemangati.
        - Buat maksimal 3 paragraf.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "Maaf, tidak dapat menghasilkan analisis saat ini.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Terjadi kesalahan saat menghubungi asisten AI. Pastikan koneksi internet lancar.";
    }
  }
};