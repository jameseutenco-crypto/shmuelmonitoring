import { PageLayout } from '@/components/layout/PageLayout';
import { InventoryTable } from '@/components/dashboard/InventoryTable';
import { mockProducts } from '@/data/mockInventory';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload } from 'lucide-react';

export default function Inventory() {
  return (
    <PageLayout
      title="Inventory Management"
      description="Manage all products and stock levels"
      actions={
        <>
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
      <InventoryTable products={mockProducts} />
    </PageLayout>
  );
}
