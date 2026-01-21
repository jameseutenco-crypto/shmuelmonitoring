import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useDatabase } from '@/contexts/ExternalDatabaseContext';
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
  Package,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Alert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  minStock: number;
  severity: 'critical' | 'high' | 'medium';
  category: string;
  supplier: string;
}

const severityConfig = {
  critical: {
    icon: PackageX,
    label: 'Critical',
    bgClass: 'bg-destructive/10 border-destructive/30',
    iconClass: 'text-destructive',
    badgeClass: 'bg-destructive/20 text-destructive border-destructive/30',
  },
  high: {
    icon: AlertTriangle,
    label: 'High',
    bgClass: 'bg-warning/10 border-warning/30',
    iconClass: 'text-warning',
    badgeClass: 'bg-warning/20 text-warning border-warning/30',
  },
  medium: {
    icon: ShoppingCart,
    label: 'Medium',
    bgClass: 'bg-primary/10 border-primary/30',
    iconClass: 'text-primary',
    badgeClass: 'bg-primary/20 text-primary border-primary/30',
  },
};

export default function Alerts() {
  const { alerts: dbAlerts, inventory, suppliers, isLoading, isConnected, refetch } = useDatabase();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [reorderDialog, setReorderDialog] = useState<Alert | null>(null);

  // Filter out dismissed alerts
  const alerts = dbAlerts.filter(a => !dismissedIds.has(a.id));

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesSearch = alert.productName.toLowerCase().includes(search.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const handleDismiss = (alertId: string, productName: string) => {
    setDismissedIds(prev => new Set([...prev, alertId]));
    toast.success(`Alert dismissed for ${productName}`);
  };

  const handleMarkAllRead = () => {
    const allIds = new Set(alerts.map(a => a.id));
    setDismissedIds(allIds);
    toast.success('All alerts cleared');
  };

  const handleReorder = (alert: Alert) => {
    setReorderDialog(alert);
  };

  const confirmReorder = () => {
    if (reorderDialog) {
      const supplier = suppliers.find(s => s.name === reorderDialog.supplier);
      
      setDismissedIds(prev => new Set([...prev, reorderDialog.id]));
      toast.success(
        `Reorder placed for ${reorderDialog.productName}`,
        { 
          description: `Supplier: ${supplier?.name || reorderDialog.supplier}`,
          duration: 5000 
        }
      );
      setReorderDialog(null);
    }
  };

  return (
    <PageLayout
      title="Alerts"
      description={isConnected ? `${alerts.length} active alerts from Supabase` : "Stock alerts and notifications"}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
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
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[180px] bg-secondary border-border">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Alerts</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
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
                {alerts.filter(a => a.severity === 'critical').length}
              </p>
              <p className="text-sm text-muted-foreground">Critical (Out of Stock)</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl border border-warning/30 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {alerts.filter(a => a.severity === 'high').length}
              </p>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl border border-primary/30 p-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {alerts.filter(a => a.severity === 'medium').length}
              </p>
              <p className="text-sm text-muted-foreground">Medium Priority</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;

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
                  <Package className="h-6 w-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className={config.badgeClass}>
                      <Icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{alert.productName}</h3>
                  <p className="text-muted-foreground mt-1">
                    {alert.category} • Current Stock: <span className="font-semibold text-foreground">{alert.currentStock}</span> • Reorder Point: {alert.reorderPoint}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Truck className="h-3 w-3" />
                    Supplier: {alert.supplier}
                  </div>
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
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{reorderDialog.productName}</h4>
                    <p className="text-sm text-muted-foreground">{reorderDialog.category}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span>Current Stock: <strong className="text-destructive">{reorderDialog.currentStock}</strong></span>
                  <span>Reorder Point: <strong>{reorderDialog.reorderPoint}</strong></span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-primary" />
                <span>Supplier: {reorderDialog.supplier}</span>
              </div>
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
