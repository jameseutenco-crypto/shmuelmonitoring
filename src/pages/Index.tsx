import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { GoogleSheetsConnect } from '@/components/dashboard/GoogleSheetsConnect';
import { useGoogleSheetsInventory } from '@/hooks/useGoogleSheetsInventory';
import { mockSalesData, mockPurchaseOrders } from '@/data/mockInventory';
import { Package, AlertTriangle, PackageX, DollarSign, TrendingUp, Truck, ShoppingCart, BarChart3 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const Index = () => {
  const {
    products,
    stats,
    loading,
    error,
    sheetUrl,
    isConnected,
    connectSheet,
    disconnect,
    refresh,
  } = useGoogleSheetsInventory();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalSales = mockSalesData.reduce((acc, d) => acc + d.sales, 0);
  const totalDeliveries = mockSalesData.reduce((acc, d) => acc + d.deliveries, 0);
  const totalRevenue = mockSalesData.reduce((acc, d) => acc + d.revenue, 0);
  const pendingOrders = mockPurchaseOrders.filter(o => o.status === 'pending' || o.status === 'approved').length;

  const chartConfig = {
    sales: { label: 'Sales', color: 'hsl(var(--primary))' },
    deliveries: { label: 'Deliveries', color: 'hsl(var(--success))' },
    orders: { label: 'Orders', color: 'hsl(var(--warning))' },
    revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
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
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Overview of sales, deliveries, and inventory performance
              </p>
            </div>
          </div>

          {/* Google Sheets Connection */}
          <div className="max-w-md">
            <GoogleSheetsConnect
              isConnected={isConnected}
              sheetUrl={sheetUrl}
              loading={loading}
              error={error}
              onConnect={connectSheet}
              onDisconnect={disconnect}
              onRefresh={refresh}
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Sales (7 days)"
              value={totalSales}
              icon={TrendingUp}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Total Deliveries"
              value={totalDeliveries}
              icon={Truck}
              variant="success"
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Total Revenue"
              value={formatCurrency(totalRevenue)}
              icon={DollarSign}
              variant="success"
              trend={{ value: 15.2, isPositive: true }}
            />
            <StatCard
              title="Pending Orders"
              value={pendingOrders}
              icon={ShoppingCart}
              variant="warning"
            />
          </div>

          {/* Inventory Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon={Package}
            />
            <StatCard
              title="Low Stock Items"
              value={stats.lowStockItems}
              icon={AlertTriangle}
              variant="warning"
            />
            <StatCard
              title="Out of Stock"
              value={stats.outOfStockItems}
              icon={PackageX}
              variant="critical"
            />
            <StatCard
              title="Stock Value"
              value={formatCurrency(stats.totalStockValue)}
              icon={BarChart3}
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend Chart */}
            <div className="glass-card rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Sales Trend</h3>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <AreaChart data={mockSalesData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => v.split('-')[2]} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" fill="url(#salesGradient)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </div>

            {/* Deliveries Chart */}
            <div className="glass-card rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Deliveries</h3>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={mockSalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => v.split('-')[2]} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="deliveries" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="glass-card rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Trend</h3>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={mockSalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => v.split('-')[2]} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-1))' }} />
                </LineChart>
              </ChartContainer>
            </div>

            {/* Orders vs Deliveries Comparison */}
            <div className="glass-card rounded-xl border border-border/50 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Orders vs Deliveries</h3>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={mockSalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => v.split('-')[2]} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="orders" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} name="Orders" />
                  <Bar dataKey="deliveries" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Deliveries" />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
