import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { mockProducts } from '@/data/mockInventory';
import { Plus, Building2, Package, DollarSign } from 'lucide-react';

const warehouses = ['Warehouse A', 'Warehouse B', 'Warehouse C'];

export default function Warehouses() {
  const getWarehouseStats = (warehouse: string) => {
    const products = mockProducts.filter(p => p.warehouse === warehouse);
    const totalItems = products.reduce((acc, p) => acc + p.currentStock, 0);
    const totalValue = products.reduce((acc, p) => acc + p.currentStock * p.unitCost, 0);
    return { products: products.length, totalItems, totalValue };
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

  return (
    <PageLayout
      title="Warehouses"
      description="Manage warehouse locations and inventory"
      actions={
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Warehouse
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => {
          const stats = getWarehouseStats(warehouse);
          return (
            <div key={warehouse} className="glass-card rounded-xl border border-border/50 p-6 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{warehouse}</h3>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Package className="h-4 w-4" />
                    <span className="text-xs">Products</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{stats.products}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-xs">Value</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(stats.totalValue)}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Details
              </Button>
            </div>
          );
        })}
      </div>
    </PageLayout>
  );
}
