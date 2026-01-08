import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Bell,
  Settings,
  Building2,
  Users,
  FileBarChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Package, label: 'Inventory', href: '/inventory' },
  { icon: ShoppingCart, label: 'Purchase Orders', href: '/orders' },
  { icon: TrendingUp, label: 'Analytics', href: '/analytics' },
  { icon: Bell, label: 'Alerts', href: '/alerts', badge: 4 },
];

const secondaryNavItems: NavItem[] = [
  { icon: Building2, label: 'Warehouses', href: '/warehouses' },
  { icon: Users, label: 'Suppliers', href: '/suppliers' },
  { icon: FileBarChart, label: 'Reports', href: '/reports' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar',
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">StockPulse</h1>
            <p className="text-xs text-muted-foreground">Inventory Manager</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Main
          </p>
          {mainNavItems.map((item) => (
            <Button
              key={item.href}
              variant={item.href === '/' ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3 h-10',
                item.href === '/' && 'bg-sidebar-accent text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
                  {item.badge}
                </span>
              )}
            </Button>
          ))}

          <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Management
          </p>
          {secondaryNavItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className="w-full justify-start gap-3 h-10"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent/50 p-4">
            <p className="text-sm font-medium text-sidebar-foreground">Need help?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check our documentation or contact support.
            </p>
            <Button size="sm" className="mt-3 w-full">
              View Docs
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
