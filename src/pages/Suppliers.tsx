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
import { Plus, Mail, Phone, MoreHorizontal } from 'lucide-react';

const mockSuppliers = [
  { id: 1, name: 'AudioTech Inc.', contact: 'John Smith', email: 'john@audiotech.com', phone: '+1 555-0101', products: 2, status: 'active' },
  { id: 2, name: 'KeyMaster Ltd.', contact: 'Sarah Johnson', email: 'sarah@keymaster.com', phone: '+1 555-0102', products: 1, status: 'active' },
  { id: 3, name: 'ClickPro Corp.', contact: 'Mike Davis', email: 'mike@clickpro.com', phone: '+1 555-0103', products: 1, status: 'active' },
  { id: 4, name: 'DisplayMax', contact: 'Emily Brown', email: 'emily@displaymax.com', phone: '+1 555-0104', products: 1, status: 'active' },
  { id: 5, name: 'CableWorld', contact: 'Tom Wilson', email: 'tom@cableworld.com', phone: '+1 555-0105', products: 1, status: 'inactive' },
  { id: 6, name: 'ComfortSeating', contact: 'Lisa Anderson', email: 'lisa@comfort.com', phone: '+1 555-0106', products: 1, status: 'active' },
];

export default function Suppliers() {
  return (
    <PageLayout
      title="Suppliers"
      description="Manage supplier relationships and contacts"
      actions={
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      }
    >
      <div className="glass-card rounded-xl border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-semibold">Supplier</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Contact</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Email</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Phone</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Products</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSuppliers.map((supplier) => (
              <TableRow key={supplier.id} className="border-border/50">
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.contact}</TableCell>
                <TableCell className="text-muted-foreground">{supplier.email}</TableCell>
                <TableCell className="text-muted-foreground">{supplier.phone}</TableCell>
                <TableCell>{supplier.products}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={supplier.status === 'active' 
                      ? 'bg-success/20 text-success border-success/30' 
                      : 'bg-muted text-muted-foreground border-muted'
                    }
                  >
                    {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Phone className="h-4 w-4" />
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
