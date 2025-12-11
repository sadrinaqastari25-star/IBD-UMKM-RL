import { Product, Transaction, BusinessProfile, TransactionType, PaymentMethod } from '../types';

// Keys for local storage
const KEYS = {
  PRODUCTS: 'ibd_umkm_products',
  TRANSACTIONS: 'ibd_umkm_transactions',
  PROFILE: 'ibd_umkm_profile',
};

// Seed Data to ensure the app looks good on first load
const SEED_PRODUCTS: Product[] = [
  { id: '1', name: 'Kopi Arabika Gayo', sku: 'KOP-001', category: 'Minuman', price: 25000, cost: 15000, stock: 50, unit: 'cup', imageUrl: 'https://picsum.photos/200' },
  { id: '2', name: 'Roti Bakar Coklat', sku: 'ROT-001', category: 'Makanan', price: 18000, cost: 8000, stock: 20, unit: 'porsi', imageUrl: 'https://picsum.photos/201' },
  { id: '3', name: 'Es Teh Manis', sku: 'MIN-001', category: 'Minuman', price: 5000, cost: 1000, stock: 100, unit: 'gelas', imageUrl: 'https://picsum.photos/202' },
  { id: '4', name: 'Mie Goreng Spesial', sku: 'MIE-001', category: 'Makanan', price: 22000, cost: 12000, stock: 5, unit: 'porsi', imageUrl: 'https://picsum.photos/203' }, // Low stock
];

const SEED_PROFILE: BusinessProfile = {
  name: 'Kedai Kopi Nusantara',
  address: 'Jl. Merdeka No. 45, Jakarta',
  phone: '0812-3456-7890',
  owner: 'Budi Santoso'
};

export const StorageService = {
  // --- Products ---
  getProducts: (): Product[] => {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    if (!data) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
      return SEED_PRODUCTS;
    }
    return JSON.parse(data);
  },

  saveProduct: (product: Product): void => {
    const products = StorageService.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    
    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  deleteProduct: (id: string): void => {
    const products = StorageService.getProducts().filter(p => p.id !== id);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  updateStock: (productId: string, quantityChange: number): void => {
    const products = StorageService.getProducts();
    const product = products.find(p => p.id === productId);
    if (product) {
      product.stock += quantityChange;
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    }
  },

  // --- Transactions ---
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },

  addTransaction: (transaction: Transaction): void => {
    const transactions = StorageService.getTransactions();
    transactions.push(transaction);
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));

    // Update stock levels automatically
    transaction.items.forEach(item => {
      // If SALE, decrease stock. If PURCHASE, increase stock.
      const multiplier = transaction.type === TransactionType.SALE ? -1 : 1;
      StorageService.updateStock(item.productId, item.quantity * multiplier);
    });
  },

  // --- Profile ---
  getProfile: (): BusinessProfile => {
    const data = localStorage.getItem(KEYS.PROFILE);
    if (!data) {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(SEED_PROFILE));
      return SEED_PROFILE;
    }
    return JSON.parse(data);
  },

  saveProfile: (profile: BusinessProfile): void => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },
  
  // --- Helpers ---
  resetData: () => {
    localStorage.clear();
    window.location.reload();
  }
};