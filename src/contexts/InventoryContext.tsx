import React, { createContext, useContext, ReactNode } from 'react';
import { useGoogleSheetsInventory } from '@/hooks/useGoogleSheetsInventory';
import { Product, StockAlert, DashboardStats } from '@/types/inventory';
import { Supplier, Warehouse, PurchaseOrder } from '@/data/mockInventory';

interface InventoryContextType {
  products: Product[];
  stats: DashboardStats;
  alerts: StockAlert[];
  loading: boolean;
  error: string | null;
  sheetUrl: string;
  isConnected: boolean;
  connectSheet: (url: string) => void;
  disconnect: () => void;
  refresh: () => void;
  // Derived data from products
  suppliers: Supplier[];
  warehouses: Warehouse[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const {
    products,
    stats,
    alerts,
    loading,
    error,
    sheetUrl,
    isConnected,
    connectSheet,
    disconnect,
    refresh,
  } = useGoogleSheetsInventory();

  // Derive suppliers from products
  const suppliers: Supplier[] = React.useMemo(() => {
    const supplierMap = new Map<string, Supplier>();
    
    products.forEach(product => {
      if (product.supplier && !supplierMap.has(product.supplier)) {
        supplierMap.set(product.supplier, {
          id: `s-${supplierMap.size + 1}`,
          name: product.supplier,
          email: `contact@${product.supplier.toLowerCase().replace(/\s+/g, '')}.com`,
          phone: '+1 555-0100',
          shippingDays: 5, // Default
          products: 0,
          activeOrders: 0,
        });
      }
      
      const supplier = supplierMap.get(product.supplier);
      if (supplier) {
        supplier.products += 1;
      }
    });

    return Array.from(supplierMap.values());
  }, [products]);

  // Derive warehouses from products
  const warehouses: Warehouse[] = React.useMemo(() => {
    const warehouseMap = new Map<string, Warehouse>();
    
    products.forEach(product => {
      if (product.warehouse && !warehouseMap.has(product.warehouse)) {
        warehouseMap.set(product.warehouse, {
          id: `w-${warehouseMap.size + 1}`,
          name: product.warehouse,
          address: `${product.warehouse} Address`,
          capacity: 10000,
          usedCapacity: 0,
          status: 'active',
        });
      }
      
      const warehouse = warehouseMap.get(product.warehouse);
      if (warehouse) {
        warehouse.usedCapacity += product.currentStock;
      }
    });

    return Array.from(warehouseMap.values());
  }, [products]);

  const value: InventoryContextType = {
    products,
    stats,
    alerts,
    loading,
    error,
    sheetUrl,
    isConnected,
    connectSheet,
    disconnect,
    refresh,
    suppliers,
    warehouses,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};
