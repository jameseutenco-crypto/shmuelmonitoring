import { PageLayout } from '@/components/layout/PageLayout';
import { InventoryTable } from '@/components/dashboard/InventoryTable';
import { useInventory } from '@/contexts/InventoryContext';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, RefreshCw, Loader2 } from 'lucide-react';

export default function Inventory() {
  const { products, loading, isConnected, refresh } = useInventory();

  return (
    <PageLayout
      title="Inventory Management"
      description={isConnected ? `${products.length} products from Google Sheets` : "Manage all products and stock levels"}
      actions={
        <>
          {isConnected && (
            <Button variant="outline" onClick={refresh} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          )}
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
