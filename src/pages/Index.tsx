import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { InventoryTable } from '@/components/dashboard/InventoryTable';
import { mockProducts, mockAlerts, mockStats } from '@/data/mockInventory';
import { Package, AlertTriangle, PackageX, DollarSign, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="pl-64">
        <Header />
        
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Stock Monitoring</h1>
              <p className="text-muted-foreground mt-1">
                Real-time inventory tracking and alerts
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                Export Report
              </Button>
              <Button>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Products"
              value={mockStats.totalProducts}
              icon={Package}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Low Stock Items"
              value={mockStats.lowStockItems}
              icon={AlertTriangle}
              variant="warning"
            />
            <StatCard
              title="Out of Stock"
              value={mockStats.outOfStockItems}
              icon={PackageX}
              variant="critical"
            />
            <StatCard
              title="Total Stock Value"
              value={formatCurrency(mockStats.totalStockValue)}
              icon={DollarSign}
              variant="success"
              trend={{ value: 8.3, isPositive: true }}
            />
          </div>

          {/* Alerts Section */}
          <div className="glass-card rounded-xl border border-border/50 p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Stock Alerts</h2>
                <p className="text-sm text-muted-foreground">
                  {mockAlerts.length} items need attention
                </p>
              </div>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {mockAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </div>

          {/* Inventory Table */}
          <InventoryTable products={mockProducts} />
        </div>
      </main>
    </div>
  );
};

export default Index;
