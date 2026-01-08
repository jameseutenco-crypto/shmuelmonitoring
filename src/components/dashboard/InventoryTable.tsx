import { useState } from 'react';
import { Product } from '@/types/inventory';
import { StockLevelBar, getStockStatus } from './StockLevelBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, MoreHorizontal, ShoppingCart, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryTableProps {
  products: Product[];
}

export function InventoryTable({ products }: InventoryTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    const status = getStockStatus(product.currentStock, product.minStock, product.reorderPoint, product.maxStock);
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'critical' && status === 'critical') ||
      (statusFilter === 'warning' && status === 'warning') ||
      (statusFilter === 'healthy' && (status === 'healthy' || status === 'overstock'));

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="glass-card rounded-xl border border-border/50 animate-fade-in" style={{ animationDelay: '0.3s' }}>
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Inventory</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredProducts.length} of {products.length} products
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
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
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="warning">Low Stock</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-semibold">Product</TableHead>
              <TableHead className="text-muted-foreground font-semibold">SKU</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Category</TableHead>
              <TableHead className="text-muted-foreground font-semibold w-[200px]">Stock Level</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-right">Unit Cost</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-right">Stock Value</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Warehouse</TableHead>
              <TableHead className="text-muted-foreground font-semibold w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product, index) => {
              const status = getStockStatus(product.currentStock, product.minStock, product.reorderPoint, product.maxStock);
              return (
                <TableRow
                  key={product.id}
                  className={cn(
                    'border-border/50 transition-colors',
                    status === 'critical' && 'bg-destructive/5',
                    status === 'warning' && 'bg-warning/5'
                  )}
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StockLevelBar
                      current={product.currentStock}
                      min={product.minStock}
                      max={product.maxStock}
                      reorderPoint={product.reorderPoint}
                      showLabels
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(product.unitCost)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(product.currentStock * product.unitCost)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.warehouse}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-muted-foreground">No products found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
