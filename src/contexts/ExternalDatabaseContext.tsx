import React, { createContext, useContext, ReactNode } from 'react';
import { useExternalDatabase } from '@/hooks/useExternalDatabase';
import { InventoryItem, Order, Customer } from '@/integrations/external-supabase/client';

interface DatabaseContextType {
  inventory: InventoryItem[];
  orders: Order[];
  customers: Customer[];
  stats: {
    totalProducts: number;
    lowStockItems: number;
    outOfStock: number;
    pendingOrders: number;
    totalOrders: number;
    deliveredOrders: number;
    totalCustomers: number;
    totalInventoryValue: number;
  };
  alerts: Array<{
    id: string;
    productId: string;
    productName: string;
    currentStock: number;
    reorderPoint: number;
    minStock: number;
    severity: 'critical' | 'high' | 'medium';
    category: string;
    supplier: string;
  }>;
  suppliers: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    productsSupplied: number;
    activeOrders: number;
    rating: number;
    status: 'active' | 'inactive';
  }>;
  categories: Array<{
    name: string;
    totalProducts: number;
    totalStock: number;
    lowStockCount: number;
  }>;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  refetch: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const databaseData = useExternalDatabase();
  
  return (
    <DatabaseContext.Provider value={databaseData}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
