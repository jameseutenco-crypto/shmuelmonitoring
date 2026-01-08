import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Eye, MoreHorizontal } from 'lucide-react';

const mockOrders = [
  { id: 'PO-001', supplier: 'AudioTech Inc.', items: 5, total: 2450.00, status: 'pending', date: '2024-01-19' },
  { id: 'PO-002', supplier: 'KeyMaster Ltd.', items: 3, total: 1890.00, status: 'approved', date: '2024-01-18' },
  { id: 'PO-003', supplier: 'ClickPro Corp.', items: 8, total: 560.00, status: 'shipped', date: '2024-01-17' },
  { id: 'PO-004', supplier: 'DisplayMax', items: 2, total: 4500.00, status: 'delivered', date: '2024-01-15' },
  { id: 'PO-005', supplier: 'CableWorld', items: 15, total: 320.00, status: 'pending', date: '2024-01-19' },
];

const statusStyles: Record<string, string> = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  approved: 'bg-primary/20 text-primary border-primary/30',
  shipped: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delivered: 'bg-success/20 text-success border-success/30',
};

export default function PurchaseOrders() {
  return (
    <PageLayout
      title="Purchase Orders"
      description="Manage supplier orders and track deliveries"
      actions={
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      }
    >
      <div className="glass-card rounded-xl border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-semibold">Order ID</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Supplier</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Items</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Total</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Date</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOrders.map((order) => (
              <TableRow key={order.id} className="border-border/50">
                <TableCell className="font-mono font-medium">{order.id}</TableCell>
                <TableCell>{order.supplier}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusStyles[order.status]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{order.date}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageLayout>
  );
}
