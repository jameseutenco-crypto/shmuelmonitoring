import { cn } from '@/lib/utils';
import { StockStatus } from '@/types/inventory';

interface StockLevelBarProps {
  current: number;
  min: number;
  max: number;
  reorderPoint: number;
  showLabels?: boolean;
  className?: string;
}

export function getStockStatus(current: number, min: number, reorderPoint: number, max: number): StockStatus {
  if (current === 0) return 'critical';
  if (current <= min) return 'critical';
  if (current <= reorderPoint) return 'warning';
  if (current > max * 0.9) return 'overstock';
  return 'healthy';
}

const statusColors: Record<StockStatus, string> = {
  healthy: 'stock-gradient-healthy',
  warning: 'stock-gradient-warning',
  critical: 'stock-gradient-critical animate-pulse-subtle',
  overstock: 'bg-primary',
};

const statusLabels: Record<StockStatus, string> = {
  healthy: 'Healthy',
  warning: 'Low Stock',
  critical: 'Critical',
  overstock: 'Overstock',
};

export function StockLevelBar({ current, min, max, reorderPoint, showLabels = false, className }: StockLevelBarProps) {
  const status = getStockStatus(current, min, reorderPoint, max);
  const percentage = Math.min((current / max) * 100, 100);
  const reorderPercentage = (reorderPoint / max) * 100;

  return (
    <div className={cn('space-y-1', className)}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs">
          <span className={cn(
            'font-medium px-2 py-0.5 rounded-full',
            status === 'critical' && 'bg-destructive/20 text-destructive',
            status === 'warning' && 'bg-warning/20 text-warning',
            status === 'healthy' && 'bg-success/20 text-success',
            status === 'overstock' && 'bg-primary/20 text-primary'
          )}>
            {statusLabels[status]}
          </span>
          <span className="text-muted-foreground">{current} / {max}</span>
        </div>
      )}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn('h-full rounded-full transition-all duration-500', statusColors[status])}
          style={{ width: `${percentage}%` }}
        />
        {/* Reorder point indicator */}
        <div
          className="absolute top-0 h-full w-0.5 bg-muted-foreground/50"
          style={{ left: `${reorderPercentage}%` }}
        />
      </div>
      {!showLabels && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{current}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}
