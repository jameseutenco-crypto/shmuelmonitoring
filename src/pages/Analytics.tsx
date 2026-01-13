import { PageLayout } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { useInventory } from '@/contexts/InventoryContext';
import { TrendingUp, TrendingDown, DollarSign, Package, RotateCw, ShoppingCart, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useMemo } from 'react';

export default function Analytics() {
  const { products, stats, loading, isConnected, refresh } = useInventory();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

  // Generate stock trend data from products
  const stockTrendData = useMemo(() => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const baseValue = stats.totalStockValue;
    return months.map((month, index) => ({
      month,
      value: Math.round(baseValue * (0.85 + (index * 0.03) + Math.random() * 0.1)),
    }));
  }, [stats.totalStockValue]);

  // Generate category data from products
  const categoryData = useMemo(() => {
    const categories = products.reduce((acc, p) => {
      const existing = acc.find(c => c.category === p.category);
      if (existing) {
        existing.value += p.currentStock * p.unitCost;
        existing.items += 1;
      } else {
        acc.push({ category: p.category, value: p.currentStock * p.unitCost, items: 1 });
      }
      return acc;
    }, [] as { category: string; value: number; items: number }[]);
    return categories.sort((a, b) => b.value - a.value);
  }, [products]);

  return (
    <PageLayout
      title="Analytics"
      description={isConnected ? "Stock trends from Google Sheets data" : "Stock trends and inventory insights"}
      actions={
        isConnected && (
          <Button variant="outline" onClick={refresh} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Data
          </Button>
        )
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Stock Turnover"
          value="4.2x"
          icon={RotateCw}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Avg Order Value"
          value="$1,840"
          icon={ShoppingCart}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Stock Value"
          value={formatCurrency(stats.totalStockValue)}
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="Total SKUs"
          value={stats.totalProducts}
          icon={Package}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Value Trend */}
        <div className="glass-card rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Stock Value Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockTrendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: number) => [formatCurrency(value), 'Value']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="glass-card rounded-xl border border-border/50 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Value by Category</h3>
          <div className="h-[300px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v / 1000}k`} />
                  <YAxis type="category" dataKey="category" stroke="hsl(var(--muted-foreground))" width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    formatter={(value: number) => [formatCurrency(value), 'Value']}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No category data available
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
