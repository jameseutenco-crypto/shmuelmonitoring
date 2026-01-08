export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitCost: number;
  supplier: string;
  lastRestocked: string;
  warehouse: string;
  icon: string;
}

export type StockStatus = 'healthy' | 'warning' | 'critical' | 'overstock';

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'low_stock' | 'out_of_stock' | 'reorder_needed';
  currentStock: number;
  reorderPoint: number;
  timestamp: string;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalStockValue: number;
  reorderNeeded: number;
}
