import { cn } from '@/lib/utils';
import { Clock, CheckCircle, Truck, Package, XCircle, ListFilter } from 'lucide-react';

interface StatusFilterTabsProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
  orderCounts: Record<string, number>;
}

const statusConfig = [
  { value: 'all', label: 'All Orders', icon: ListFilter, color: 'text-foreground' },
  { value: 'pending', label: 'Ordered', icon: Clock, color: 'text-warning' },
  { value: 'approved', label: 'Approved', icon: CheckCircle, color: 'text-primary' },
  { value: 'shipped', label: 'To Ship / In Transit', icon: Truck, color: 'text-blue-400' },
  { value: 'delivered', label: 'Received', icon: Package, color: 'text-success' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-destructive' },
];

export function StatusFilterTabs({ activeStatus, onStatusChange, orderCounts }: StatusFilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {statusConfig.map((status) => {
        const Icon = status.icon;
        const count = status.value === 'all' 
          ? Object.values(orderCounts).reduce((a, b) => a + b, 0)
          : orderCounts[status.value] || 0;
        
        return (
          <button
            key={status.value}
            onClick={() => onStatusChange(status.value)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200",
              "hover:bg-secondary/80",
              activeStatus === status.value
                ? "bg-primary/20 border-primary text-primary"
                : "bg-secondary border-border text-muted-foreground"
            )}
          >
            <Icon className={cn("h-4 w-4", activeStatus === status.value ? "text-primary" : status.color)} />
            <span className="font-medium">{status.label}</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-bold",
              activeStatus === status.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
