import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'warning' | 'critical' | 'success';
  className?: string;
}

const variantStyles = {
  default: 'border-border/50',
  warning: 'border-warning/30 bg-warning/5',
  critical: 'border-destructive/30 bg-destructive/5',
  success: 'border-success/30 bg-success/5',
};

const iconVariantStyles = {
  default: 'bg-primary/10 text-primary',
  warning: 'bg-warning/20 text-warning',
  critical: 'bg-destructive/20 text-destructive',
  success: 'bg-success/20 text-success',
};

export function StatCard({ title, value, icon: Icon, trend, variant = 'default', className }: StatCardProps) {
  return (
    <div
      className={cn(
        'glass-card rounded-xl p-6 stat-card-hover animate-fade-in',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {trend && (
            <p className={cn(
              'text-sm font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last week
            </p>
          )}
        </div>
        <div className={cn(
          'rounded-lg p-3',
          iconVariantStyles[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
