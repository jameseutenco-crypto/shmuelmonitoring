import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { mockAlerts, mockProducts } from '@/data/mockInventory';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, PackageX, ShoppingCart, CheckCircle, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function Alerts() {
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredAlerts = mockAlerts.filter(alert =>
    typeFilter === 'all' || alert.type === typeFilter
  );

  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <PageLayout
      title="Alerts"
      description="Stock alerts and notifications"
      actions={
        <Button variant="outline">
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark All Read
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex gap-3">
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

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const config = alertTypeConfig[alert.type];
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={cn(
                'glass-card rounded-xl border p-5 transition-all hover:scale-[1.005]',
                config.bgClass
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn('rounded-lg p-3 bg-background/50', config.iconClass)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className={config.badgeClass}>
                      {config.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{timeAgo(alert.timestamp)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{alert.productName}</h3>
                  <p className="text-muted-foreground mt-1">
                    SKU: {alert.sku} • Current Stock: {alert.currentStock} • Reorder Point: {alert.reorderPoint}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Dismiss</Button>
                  <Button>Reorder Now</Button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="glass-card rounded-xl border border-border/50 p-12 text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">All caught up!</h3>
            <p className="text-muted-foreground mt-1">No alerts matching your filter.</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
