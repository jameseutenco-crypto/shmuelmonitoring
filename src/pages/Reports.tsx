import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { FileBarChart, Download, Calendar, TrendingUp, Package, DollarSign, Clock, CheckCircle, Loader2 } from 'lucide-react';
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
  { id: 1, name: 'Inventory Valuation', description: 'Complete stock value report by category and warehouse', icon: DollarSign, lastRun: '2 hours ago', status: 'ready' },
  { id: 2, name: 'Stock Movement', description: 'Track inbound and outbound inventory changes', icon: TrendingUp, lastRun: '1 day ago', status: 'ready' },
  { id: 3, name: 'Low Stock Report', description: 'Items below reorder point or out of stock', icon: Package, lastRun: '3 hours ago', status: 'ready' },
  { id: 4, name: 'Purchase Order Summary', description: 'Monthly PO analysis by supplier and status', icon: FileBarChart, lastRun: '1 week ago', status: 'ready' },
];

export default function Reports() {
  const [reports, setReports] = useState<Report[]>(initialReportTypes);
  const [scheduleDialog, setScheduleDialog] = useState<Report | null>(null);
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');
  const [scheduleTime, setScheduleTime] = useState('09:00');

  const handleGenerate = (reportId: number) => {
    setReports(reports.map(r => 
      r.id === reportId ? { ...r, status: 'generating' as const } : r
    ));

    // Simulate generation
    setTimeout(() => {
      setReports(reports.map(r => 
        r.id === reportId ? { ...r, status: 'ready' as const, lastRun: 'Just now' } : r
      ));
      toast.success('Report generated successfully! Download will start shortly.');
      
      // Simulate download
      const link = document.createElement('a');
      link.href = '#';
      link.download = `report-${reportId}.csv`;
      // In a real app, this would download an actual file
      toast.info('Report downloaded as CSV');
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

  return (
    <PageLayout
      title="Reports"
      description="Generate and download inventory reports"
    >
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
