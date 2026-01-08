import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { FileBarChart, Download, Calendar, TrendingUp, Package, DollarSign } from 'lucide-react';

const reportTypes = [
  { id: 1, name: 'Inventory Valuation', description: 'Complete stock value report by category and warehouse', icon: DollarSign, lastRun: '2 hours ago' },
  { id: 2, name: 'Stock Movement', description: 'Track inbound and outbound inventory changes', icon: TrendingUp, lastRun: '1 day ago' },
  { id: 3, name: 'Low Stock Report', description: 'Items below reorder point or out of stock', icon: Package, lastRun: '3 hours ago' },
  { id: 4, name: 'Purchase Order Summary', description: 'Monthly PO analysis by supplier and status', icon: FileBarChart, lastRun: '1 week ago' },
];

export default function Reports() {
  return (
    <PageLayout
      title="Reports"
      description="Generate and download inventory reports"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="glass-card rounded-xl border border-border/50 p-6 hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{report.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Last generated: {report.lastRun}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                <Button className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </PageLayout>
  );
}
