import { useState, useEffect } from 'react';
import { externalSupabase, InventoryItem, Order, Customer } from '@/integrations/external-supabase/client';

export function useExternalDatabase() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch inventory
      const { data: inventoryData, error: inventoryError } = await externalSupabase
        .from('inventory')
        .select('*');
      
      if (inventoryError) throw new Error(`Inventory: ${inventoryError.message}`);
      
      // Fetch orders
      const { data: ordersData, error: ordersError } = await externalSupabase
        .from('orders')
        .select('*');
      
      if (ordersError) throw new Error(`Orders: ${ordersError.message}`);
      
      // Fetch customers
      const { data: customersData, error: customersError } = await externalSupabase
        .from('customer')
        .select('*');
      
      if (customersError) throw new Error(`Customers: ${customersError.message}`);
      
      setInventory(inventoryData || []);
      setOrders(ordersData || []);
      setCustomers(customersData || []);
      setIsConnected(true);
    } catch (err: any) {
      console.error('Database fetch error:', err);
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate dashboard stats from real data
  const stats = {
    totalProducts: inventory.length,
    lowStockItems: inventory.filter(item => item.currentStock <= item.reorderPoint).length,
    outOfStock: inventory.filter(item => item.currentStock === 0).length,
    pendingOrders: orders.filter(order => order.status === 'pending').length,
    totalOrders: orders.length,
    deliveredOrders: orders.filter(order => order.status === 'delivered').length,
    totalCustomers: customers.length,
    totalInventoryValue: inventory.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0),
  };

  // Generate alerts from real data
  const alerts = inventory
    .filter(item => item.currentStock <= item.reorderPoint)
    .map(item => ({
      id: item.id,
      productId: item.id,
      productName: item.name,
      currentStock: item.currentStock,
      reorderPoint: item.reorderPoint,
      minStock: item.minStock,
      severity: item.currentStock === 0 ? 'critical' as const : 
                item.currentStock <= item.minStock ? 'high' as const : 'medium' as const,
      category: item.category,
      supplier: item.supplier,
    }));

  // Get unique suppliers from inventory
  const suppliers = [...new Set(inventory.map(item => item.supplier))].map((name, index) => ({
    id: `supplier-${index}`,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '')}@supplier.com`,
    phone: '+1 (555) 000-0000',
    productsSupplied: inventory.filter(item => item.supplier === name).length,
    activeOrders: orders.filter(order => order.supplier === name && order.status !== 'delivered').length,
    rating: 4.5,
    status: 'active' as const,
  }));

  // Get categories summary
  const categories = [...new Set(inventory.map(item => item.category))].map(category => {
    const categoryItems = inventory.filter(item => item.category === category);
    return {
      name: category,
      totalProducts: categoryItems.length,
      totalStock: categoryItems.reduce((sum, item) => sum + item.currentStock, 0),
      lowStockCount: categoryItems.filter(item => item.currentStock <= item.reorderPoint).length,
    };
  });

  return {
    inventory,
    orders,
    customers,
    stats,
    alerts,
    suppliers,
    categories,
    isLoading,
    error,
    isConnected,
    refetch: fetchData,
  };
}
