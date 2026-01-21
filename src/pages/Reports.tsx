import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDatabase } from '@/contexts/ExternalDatabaseContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileBarChart, Download, Calendar, TrendingUp, Package, DollarSign, Clock, CheckCircle, Loader2, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Report {
  id: number;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  lastRun: string;
  status: 'ready' | 'generating' | 'scheduled';
  scheduledFor?: string;
}

const initialReportTypes: Report[] = [
  { id: 1, name: 'Inventory Valuation', description: 'Complete stock value report by category', icon: DollarSign, lastRun: '2 hours ago', status: 'ready' },
  { id: 2, name: 'Stock Movement', description: 'Track inbound and outbound inventory changes', icon: TrendingUp, lastRun: '1 day ago', status: 'ready' },
  { id: 3, name: 'Low Stock Report', description: 'Items below reorder point or out of stock', icon: Package, lastRun: '3 hours ago', status: 'ready' },
  { id: 4, name: 'Order Summary', description: 'Order analysis by supplier and status', icon: FileBarChart, lastRun: '1 week ago', status: 'ready' },
  { id: 5, name: 'Customer Report', description: 'Customer list and contact information', icon: Users, lastRun: 'Never', status: 'ready' },
];

export default function Reports() {
  const { inventory, orders, customers, stats, alerts, isConnected, isLoading, refetch } = useDatabase();
  const [reports, setReports] = useState<Report[]>(initialReportTypes);
  const [scheduleDialog, setScheduleDialog] = useState<Report | null>(null);
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');
  const [scheduleTime, setScheduleTime] = useState('09:00');

  const handleGenerate = (reportId: number) => {
    setReports(reports.map(r => 
      r.id === reportId ? { ...r, status: 'generating' as const } : r
    ));

    // Generate actual report data based on connected database
    setTimeout(() => {
      const report = reports.find(r => r.id === reportId);
      let csvContent = '';
      
      if (report?.name === 'Inventory Valuation') {
        csvContent = 'SKU,Name,Category,Stock,Unit Cost,Total Value,Supplier\n';
        inventory.forEach(p => {
          csvContent += `${p.sku},${p.name},${p.category},${p.currentStock},${p.unitCost},${(p.currentStock * p.unitCost).toFixed(2)},${p.supplier}\n`;
        });
      } else if (report?.name === 'Low Stock Report') {
        csvContent = 'SKU,Name,Current Stock,Reorder Point,Status,Supplier\n';
        inventory.filter(p => p.currentStock <= p.reorderPoint).forEach(p => {
          const status = p.currentStock === 0 ? 'Out of Stock' : 'Low Stock';
          csvContent += `${p.sku},${p.name},${p.currentStock},${p.reorderPoint},${status},${p.supplier}\n`;
        });
      } else if (report?.name === 'Order Summary') {
        csvContent = 'Order ID,Date,Status,Supplier,Total,Expected Delivery\n';
        orders.forEach(o => {
          csvContent += `${o.id},${o.orderDate},${o.status},${o.supplier},${o.total},${o.expectedDelivery}\n`;
        });
      } else if (report?.name === 'Customer Report') {
        csvContent = 'ID,Name,Email,Phone,Address\n';
        customers.forEach(c => {
          csvContent += `${c.id},${c.name},${c.email},${c.phone},${c.address}\n`;
        });
      } else {
        csvContent = 'Product,SKU,Category,Stock,Value\n';
        inventory.forEach(p => {
          csvContent += `${p.name},${p.sku},${p.category},${p.currentStock},${(p.currentStock * p.unitCost).toFixed(2)}\n`;
        });
      }

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report?.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setReports(reports.map(r => 
        r.id === reportId ? { ...r, status: 'ready' as const, lastRun: 'Just now' } : r
      ));
      toast.success(`Report generated with data from ${isConnected ? 'Supabase' : 'local'} database!`);
    }, 2000);
  };

  const handleSchedule = () => {
    if (scheduleDialog) {
      setReports(reports.map(r => 
        r.id === scheduleDialog.id 
          ? { ...r, status: 'scheduled' as const, scheduledFor: `${scheduleFrequency} at ${scheduleTime}` } 
          : r
      ));
      toast.success(`Report "${scheduleDialog.name}" scheduled ${scheduleFrequency} at ${scheduleTime}`);
      setScheduleDialog(null);
    }
  };

  const handleCancelSchedule = (reportId: number) => {
    setReports(reports.map(r => 
      r.id === reportId 
        ? { ...r, status: 'ready' as const, scheduledFor: undefined } 
        : r
    ));
    toast.info('Schedule cancelled');
  };

  const getStatusBadge = (report: Report) => {
    switch (report.status) {
      case 'generating':
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Generating...
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge className="bg-success/20 text-success border-success/30">
            <Clock className="h-3 w-3 mr-1" />
            {report.scheduledFor}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        );
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

  return (
    <PageLayout
      title="Reports"
      description={isConnected ? `Generate reports from Supabase (${inventory.length} products, ${orders.length} orders, ${customers.length} customers)` : "Generate and download inventory reports"}
      actions={
        <Button variant="outline" onClick={refetch} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh Data
        </Button>
      }
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card rounded-xl border border-border/50 p-4">
          <p className="text-sm text-muted-foreground">Total Products</p>
          <p className="text-2xl font-bold text-foreground">{stats.totalProducts}</p>
        </div>
        <div className="glass-card rounded-xl border border-border/50 p-4">
          <p className="text-sm text-muted-foreground">Low Stock Items</p>
          <p className="text-2xl font-bold text-warning">{stats.lowStockItems}</p>
        </div>
        <div className="glass-card rounded-xl border border-border/50 p-4">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold text-primary">{stats.totalOrders}</p>
        </div>
        <div className="glass-card rounded-xl border border-border/50 p-4">
          <p className="text-sm text-muted-foreground">Inventory Value</p>
          <p className="text-2xl font-bold text-success">
            {formatCurrency(stats.totalInventoryValue)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="glass-card rounded-xl border border-border/50 p-6 hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-foreground">{report.name}</h3>
                    {getStatusBadge(report)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Last generated: {report.lastRun}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {report.status === 'scheduled' ? (
                  <Button variant="outline" className="flex-1" onClick={() => handleCancelSchedule(report.id)}>
                    Cancel Schedule
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setScheduleDialog(report)}
                    disabled={report.status === 'generating'}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                )}
                <Button 
                  className="flex-1"
                  onClick={() => handleGenerate(report.id)}
                  disabled={report.status === 'generating'}
                >
                  {report.status === 'generating' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Generate
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Dialog */}
      <Dialog open={!!scheduleDialog} onOpenChange={() => setScheduleDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Report</DialogTitle>
            <DialogDescription>
              Set up automatic generation for "{scheduleDialog?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Frequency</Label>
              <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialog(null)}>Cancel</Button>
            <Button onClick={handleSchedule}>
              <Clock className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
