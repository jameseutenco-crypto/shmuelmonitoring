import { cn } from '@/lib/utils';
import { StockAlert } from '@/types/inventory';
import { AlertTriangle, PackageX, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlertCardProps {
  alert: StockAlert;
  className?: string;
}

const alertTypeConfig = {
  out_of_stock: {
    icon: PackageX,
    label: 'Out of Stock',
    bgClass: 'bg-destructive/10 border-destructive/30',
    iconClass: 'text-destructive',
  },
  low_stock: {
    icon: AlertTriangle,
    label: 'Low Stock',
    bgClass: 'bg-warning/10 border-warning/30',
    iconClass: 'text-warning',
  },
  reorder_needed: {
    icon: ShoppingCart,
    label: 'Reorder Needed',
    bgClass: 'bg-primary/10 border-primary/30',
    iconClass: 'text-primary',
  },
};

export function AlertCard({ alert, className }: AlertCardProps) {
  const config = alertTypeConfig[alert.type];
  const Icon = config.icon;

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
    <div
      className={cn(
        'rounded-lg border p-4 transition-all duration-200 hover:scale-[1.01]',
        config.bgClass,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('rounded-lg p-2 bg-background/50', config.iconClass)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('text-xs font-semibold uppercase', config.iconClass)}>
              {config.label}
            </span>
            <span className="text-xs text-muted-foreground">{timeAgo(alert.timestamp)}</span>
          </div>
          <p className="mt-1 font-medium text-foreground truncate">{alert.productName}</p>
          <p className="text-sm text-muted-foreground">
            SKU: {alert.sku} • Stock: {alert.currentStock} (Reorder at {alert.reorderPoint})
          </p>
        </div>
        <Button size="sm" variant="outline" className="shrink-0">
          Reorder
        </Button>
      </div>
    </div>
  );
}
