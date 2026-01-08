import { PageLayout } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { mockStats, mockProducts } from '@/data/mockInventory';
import { TrendingUp, TrendingDown, DollarSign, Package, RotateCw, ShoppingCart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const stockTrendData = [
  { month: 'Jul', value: 85000 },
  { month: 'Aug', value: 92000 },
  { month: 'Sep', value: 78000 },
  { month: 'Oct', value: 95000 },
  { month: 'Nov', value: 88000 },
  { month: 'Dec', value: 84907 },
];

const categoryData = mockProducts.reduce((acc, p) => {
  const existing = acc.find(c => c.category === p.category);
  if (existing) {
    existing.value += p.currentStock * p.unitCost;
    existing.items += 1;
  } else {
    acc.push({ category: p.category, value: p.currentStock * p.unitCost, items: 1 });
  }
  return acc;
}, [] as { category: string; value: number; items: number }[]);

export default function Analytics() {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

  return (
    <PageLayout
      title="Analytics"
      description="Stock trends and inventory insights"
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
          value={formatCurrency(mockStats.totalStockValue)}
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="Total SKUs"
          value={mockStats.totalProducts}
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
                    <stop offset="5%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(174, 72%, 46%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" />
                <YAxis stroke="hsl(215, 20%, 55%)" tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(222, 47%, 8%)', border: '1px solid hsl(222, 30%, 18%)' }}
                  formatter={(value: number) => [formatCurrency(value), 'Value']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(174, 72%, 46%)"
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                <XAxis type="number" stroke="hsl(215, 20%, 55%)" tickFormatter={(v) => `$${v / 1000}k`} />
                <YAxis type="category" dataKey="category" stroke="hsl(215, 20%, 55%)" width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(222, 47%, 8%)', border: '1px solid hsl(222, 30%, 18%)' }}
                  formatter={(value: number) => [formatCurrency(value), 'Value']}
                />
                <Bar dataKey="value" fill="hsl(174, 72%, 46%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
