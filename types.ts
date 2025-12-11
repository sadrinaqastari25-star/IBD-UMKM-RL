export enum TransactionType {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE'
}

export enum PaymentMethod {
  CASH = 'CASH',
  QRIS = 'QRIS',
  TRANSFER = 'TRANSFER'
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number; // Selling price
  cost: number;  // Cost price (COGS)
  stock: number;
  unit: string;  // pcs, kg, ltr
  imageUrl?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtTransaction: number;
  costAtTransaction: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO String
  type: TransactionType;
  items: TransactionItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  user?: string; // Who processed it
}

export interface BusinessProfile {
  name: string;
  address: string;
  phone: string;
  owner: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalProfit: number;
  totalTransactions: number;
  lowStockCount: number;
}