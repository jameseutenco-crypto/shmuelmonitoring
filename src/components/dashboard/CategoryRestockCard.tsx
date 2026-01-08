import { useState } from 'react';
import { Product } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShoppingCart, AlertTriangle, PackageX, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStockStatus } from './StockLevelBar';

interface CategoryRestockCardProps {
  products: Product[];
}

export function CategoryRestockCard({ products }: CategoryRestockCardProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Get products that need restocking
  const restockProducts = products.filter(p => {
    const status = getStockStatus(p.currentStock, p.minStock, p.reorderPoint, p.maxStock);
    return status === 'critical' || status === 'warning';
  });

  // Get unique categories from restock products
  const categories = [...new Set(restockProducts.map(p => p.category))];

  // Apply filters
  const filteredProducts = restockProducts.filter(product => {
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const status = getStockStatus(product.currentStock, product.minStock, product.reorderPoint, product.maxStock);
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'critical' && status === 'critical') ||
      (statusFilter === 'warning' && status === 'warning');
    return matchesCategory && matchesStatus;
  });

  // Group by category
  const groupedByCategory = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="glass-card rounded-xl border border-border/50 p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Categories Need Restock</h2>
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} items across {Object.keys(groupedByCategory).length} categories
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px] bg-secondary border-border">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] bg-secondary border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Low Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category groups */}
      <div className="space-y-4">
        {Object.entries(groupedByCategory).map(([category, items]) => (
          <div key={category} className="rounded-lg border border-border/50 bg-secondary/30 overflow-hidden">
            {/* Category header */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-b border-border/50">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-background">
                  {category}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {items.length} item{items.length > 1 ? 's' : ''} need restock
                </span>
              </div>
              <Button size="sm" variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Reorder All
              </Button>
            </div>

            {/* Items list */}
            <div className="divide-y divide-border/30">
              {items.map(product => {
                const status = getStockStatus(product.currentStock, product.minStock, product.reorderPoint, product.maxStock);
                const isCritical = status === 'critical';
                
                return (
                  <div
                    key={product.id}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 transition-colors hover:bg-secondary/50',
                      isCritical && 'bg-destructive/5'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'rounded-lg p-2',
                        isCritical ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
                      )}>
                        {isCritical ? <PackageX className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {product.sku} • {product.warehouse}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={cn(
                          'font-semibold',
                          isCritical ? 'text-destructive' : 'text-warning'
                        )}>
                          {product.currentStock} / {product.maxStock}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Reorder at {product.reorderPoint}
                        </p>
                      </div>
                      <Button size="sm" variant={isCritical ? 'destructive' : 'warning'}>
                        Reorder
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No items need restocking with current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
