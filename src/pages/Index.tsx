import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { useDatabase } from '@/contexts/ExternalDatabaseContext';
import { Package, AlertTriangle, PackageX, DollarSign, TrendingUp, Truck, ShoppingCart, BarChart3, Users, RefreshCw, Database, CheckCircle, XCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const {
    inventory,
    orders,
    customers,
    stats,
    alerts,
    categories,
    isLoading,
    error,
    isConnected,
    refetch,
  } = useDatabase();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Generate stock distribution by category
  const categoryData = useMemo(() => {
    return categories.map((cat, index) => ({
      name: cat.name,
      value: cat.totalStock,
      products: cat.totalProducts,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`,
    }));
  }, [categories]);

  // Generate order status distribution
  const orderStatusData = useMemo(() => {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count], index) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      fill: status === 'delivered' ? 'hsl(var(--success))' : 
            status === 'pending' ? 'hsl(var(--warning))' :
            status === 'cancelled' ? 'hsl(var(--destructive))' :
            `hsl(var(--chart-${(index % 5) + 1}))`,
    }));
  }, [orders]);

  // Stock level distribution
  const stockLevelData = useMemo(() => {
    const healthy = inventory.filter(i => i.currentStock > i.reorderPoint).length;
    const low = inventory.filter(i => i.currentStock <= i.reorderPoint && i.currentStock > 0).length;
    const outOfStock = inventory.filter(i => i.currentStock === 0).length;

    return [
      { name: 'Healthy', value: healthy, fill: 'hsl(var(--success))' },
      { name: 'Low Stock', value: low, fill: 'hsl(var(--warning))' },
      { name: 'Out of Stock', value: outOfStock, fill: 'hsl(var(--destructive))' },
    ].filter(d => d.value > 0);
  }, [inventory]);

  // Top products by stock value
  const topProductsByValue = useMemo(() => {
    return [...inventory]
      .map(item => ({
        name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
        value: item.currentStock * item.unitCost,
        stock: item.currentStock,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [inventory]);

  const chartConfig = {
    stock: { label: 'Stock', color: 'hsl(var(--primary))' },
    value: { label: 'Value', color: 'hsl(var(--success))' },
    orders: { label: 'Orders', color: 'hsl(var(--warning))' },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="pl-64">
          <Header />
          <div className="p-6 space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="pl-64">
        <Header />
        
        <div className="p-6 space-y-6">
          {/* Page Header with Connection Status */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Real-time inventory and order analytics from your Supabase database
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1.5">
                {isConnected ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                {isConnected ? 'Connected to Database' : 'Connection Error'}
              </Badge>
              <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
              <p className="font-medium">Connection Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Primary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon={Package}
              trend={{ value: 0, isPositive: true }}
            />
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={ShoppingCart}
              variant="success"
            />
            <StatCard
              title="Total Customers"
              value={stats.totalCustomers}
              icon={Users}
            />
            <StatCard
              title="Inventory Value"
              value={formatCurrency(stats.totalInventoryValue)}
              icon={DollarSign}
              variant="success"
            />
          </div>

          {/* Inventory Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Low Stock Items"
              value={stats.lowStockItems}
              icon={AlertTriangle}
              variant="warning"
            />
            <StatCard
              title="Out of Stock"
              value={stats.outOfStock}
              icon={PackageX}
              variant="critical"
            />
            <StatCard
              title="Pending Orders"
              value={stats.pendingOrders}
              icon={TrendingUp}
              variant="warning"
            />
            <StatCard
              title="Delivered Orders"
              value={stats.deliveredOrders}
              icon={Truck}
              variant="success"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Level Distribution */}
            <div className="glass-card rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Stock Level Distribution</h3>
              {stockLevelData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stockLevelData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {stockLevelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No inventory data available
                </div>
              )}
            </div>

            {/* Order Status Distribution */}
            <div className="glass-card rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Order Status</h3>
              {orderStatusData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No order data available
                </div>
              )}
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock by Category */}
            <div className="glass-card rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Stock by Category</h3>
              {categoryData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total Stock" />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No category data available
                </div>
              )}
            </div>

            {/* Top Products by Value */}
            <div className="glass-card rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Top Products by Stock Value</h3>
              {topProductsByValue.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <BarChart data={topProductsByValue} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                    <Bar dataKey="value" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} name="Stock Value" />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No product data available
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alerts Preview */}
          {alerts.length > 0 && (
            <div className="glass-card rounded-xl border border-border/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Low Stock Alerts</h3>
                <Badge variant="destructive">{alerts.length} items need attention</Badge>
              </div>
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{alert.productName}</p>
                      <p className="text-sm text-muted-foreground">{alert.category} • {alert.supplier}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'high' ? 'secondary' : 'outline'}>
                        {alert.currentStock} / {alert.reorderPoint}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
