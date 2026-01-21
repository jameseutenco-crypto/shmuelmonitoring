import { PageLayout } from '@/components/layout/PageLayout';
import { InventoryTable } from '@/components/dashboard/InventoryTable';
import { useDatabase } from '@/contexts/ExternalDatabaseContext';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, RefreshCw, Loader2 } from 'lucide-react';

export default function Inventory() {
  const { inventory, isLoading, isConnected, refetch } = useDatabase();

  // Convert external inventory format to InventoryTable format
  const products = inventory.map(item => ({
    id: item.id,
    sku: item.sku,
    name: item.name,
    category: item.category,
    currentStock: item.currentStock,
    minStock: item.minStock,
    maxStock: item.reorderPoint * 3, // Estimate maxStock
    reorderPoint: item.reorderPoint,
    unitCost: item.unitCost,
    supplier: item.supplier,
    lastRestocked: new Date().toISOString(), // Default value
    warehouse: 'Main Warehouse',
    icon: 'Package',
  }));

  return (
    <PageLayout
      title="Inventory Management"
      description={isConnected ? `${inventory.length} products from Supabase` : "Manage all products and stock levels"}
      actions={
        <>
          <Button variant="outline" onClick={refetch} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </>
      }
    >
      <InventoryTable products={products} />
    </PageLayout>
  );
}
