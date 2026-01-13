import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useInventory } from '@/contexts/InventoryContext';
import { StockAlert } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  PackageX, 
  ShoppingCart, 
  CheckCircle, 
  Filter, 
  Search, 
  Trash2, 
  Bell, 
  Truck,
  Headphones,
  Keyboard,
  Mouse,
  Monitor,
  Cable,
  Armchair,
  Camera,
  Laptop,
  Package,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const alertTypeConfig = {
  out_of_stock: {
    icon: PackageX,
    label: 'Out of Stock',
    bgClass: 'bg-destructive/10 border-destructive/30',
    iconClass: 'text-destructive',
    badgeClass: 'bg-destructive/20 text-destructive border-destructive/30',
  },
  low_stock: {
    icon: AlertTriangle,
    label: 'Low Stock',
    bgClass: 'bg-warning/10 border-warning/30',
    iconClass: 'text-warning',
    badgeClass: 'bg-warning/20 text-warning border-warning/30',
  },
  reorder_needed: {
    icon: ShoppingCart,
    label: 'Reorder Needed',
    bgClass: 'bg-primary/10 border-primary/30',
    iconClass: 'text-primary',
    badgeClass: 'bg-primary/20 text-primary border-primary/30',
  },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Headphones,
  HeadphonesIcon: Headphones,
  Keyboard,
  Mouse,
  Monitor,
  Cable,
  Armchair,
  Table: Package,
  Camera,
  Laptop,
};

export default function Alerts() {
  const { alerts: sheetAlerts, products, suppliers, loading, isConnected, refresh } = useInventory();
  const [localAlerts, setLocalAlerts] = useState<StockAlert[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [reorderDialog, setReorderDialog] = useState<StockAlert | null>(null);

  // Combine sheet alerts with local state, filtering out dismissed ones
  const alerts = sheetAlerts.filter(a => !dismissedIds.has(a.id));

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    const matchesSearch = alert.productName.toLowerCase().includes(search.toLowerCase()) ||
      alert.sku.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const handleDismiss = (alertId: string, productName: string) => {
    setDismissedIds(prev => new Set([...prev, alertId]));
    toast.success(`Alert dismissed for ${productName}`);
  };

  const handleMarkAllRead = () => {
    const allIds = new Set(alerts.map(a => a.id));
    setDismissedIds(allIds);
    toast.success('All alerts cleared');
  };

  const handleReorder = (alert: StockAlert) => {
    setReorderDialog(alert);
  };

  const confirmReorder = () => {
    if (reorderDialog) {
      const product = products.find(p => p.id === reorderDialog.productId);
      const supplier = suppliers.find(s => s.name === product?.supplier);
      
      setDismissedIds(prev => new Set([...prev, reorderDialog.id]));
      toast.success(
        `Reorder placed for ${reorderDialog.productName}`,
        { 
          description: `Expected delivery in ${supplier?.shippingDays || 7} days from ${supplier?.name || 'supplier'}`,
          duration: 5000 
        }
      );
      setReorderDialog(null);
    }
  };

  const getSupplierInfo = (productId: string) => {
    const product = products.find(p => p.id === productId);
    const supplier = suppliers.find(s => s.name === product?.supplier);
    return { product, supplier };
  };

  const getProductIcon = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return Package;
    return iconMap[product.icon] || Package;
  };

  return (
    <PageLayout
      title="Alerts"
      description={isConnected ? `${alerts.length} active alerts from Google Sheets` : "Stock alerts and notifications"}
      actions={
        <div className="flex gap-2">
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
          <Button variant="outline" onClick={handleMarkAllRead} disabled={alerts.length === 0}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            className="pl-10 bg-secondary border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px] bg-secondary border-border">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Alerts</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="reorder_needed">Reorder Needed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-xl border border-destructive/30 p-4">
          <div className="flex items-center gap-3">
            <PackageX className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {alerts.filter(a => a.type === 'out_of_stock').length}
              </p>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl border border-warning/30 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {alerts.filter(a => a.type === 'low_stock').length}
              </p>
              <p className="text-sm text-muted-foreground">Low Stock</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl border border-primary/30 p-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {alerts.filter(a => a.type === 'reorder_needed').length}
              </p>
              <p className="text-sm text-muted-foreground">Reorder Needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const config = alertTypeConfig[alert.type];
          const Icon = config.icon;
          const { product, supplier } = getSupplierInfo(alert.productId);
          const ProductIcon = getProductIcon(alert.productId);

          return (
            <div
              key={alert.id}
              className={cn(
                'glass-card rounded-xl border p-5 transition-all hover:scale-[1.002]',
                config.bgClass
              )}
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-background/80 flex items-center justify-center border">
                  <ProductIcon className="h-6 w-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className={config.badgeClass}>
                      <Icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{timeAgo(alert.timestamp)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{alert.productName}</h3>
                  <p className="text-muted-foreground mt-1">
                    SKU: {alert.sku} • Current Stock: <span className="font-semibold text-foreground">{alert.currentStock}</span> • Reorder Point: {alert.reorderPoint}
                  </p>
                  {supplier && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Truck className="h-3 w-3" />
                      Supplier: {supplier.name} ({supplier.shippingDays} days shipping)
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDismiss(alert.id, alert.productName)}
                    title="Dismiss alert"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleReorder(alert)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Reorder
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="glass-card rounded-xl border border-border/50 p-12 text-center">
            <Bell className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">All caught up!</h3>
            <p className="text-muted-foreground mt-1">No alerts matching your filter.</p>
          </div>
        )}
      </div>

      {/* Reorder Dialog */}
      <Dialog open={!!reorderDialog} onOpenChange={() => setReorderDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Reorder</DialogTitle>
            <DialogDescription>
              Place a reorder for this product?
            </DialogDescription>
          </DialogHeader>
          {reorderDialog && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  {(() => {
                    const ProductIcon = getProductIcon(reorderDialog.productId);
                    return (
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ProductIcon className="h-5 w-5 text-primary" />
                      </div>
                    );
                  })()}
                  <div>
                    <h4 className="font-semibold">{reorderDialog.productName}</h4>
                    <p className="text-sm text-muted-foreground">SKU: {reorderDialog.sku}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span>Current Stock: <strong className="text-destructive">{reorderDialog.currentStock}</strong></span>
                  <span>Reorder Point: <strong>{reorderDialog.reorderPoint}</strong></span>
                </div>
              </div>
              {(() => {
                const { supplier } = getSupplierInfo(reorderDialog.productId);
                return supplier && (
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Supplier: {supplier.name}</span>
                    <Badge variant="outline">
                      {supplier.shippingDays} days delivery
                    </Badge>
                  </div>
                );
              })()}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReorderDialog(null)}>Cancel</Button>
            <Button onClick={confirmReorder}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Place Reorder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
