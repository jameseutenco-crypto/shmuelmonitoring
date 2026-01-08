import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Mail, Phone, Truck, Edit, Search } from 'lucide-react';
import { mockSuppliers, Supplier } from '@/data/mockInventory';
import { toast } from 'sonner';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [search, setSearch] = useState('');
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', email: '', phone: '', shippingDays: 5 });

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    const supplier: Supplier = {
      id: `s${suppliers.length + 1}`,
      ...newSupplier,
      products: 0,
      activeOrders: 0,
    };
    setSuppliers([...suppliers, supplier]);
    setIsCreateOpen(false);
    setNewSupplier({ name: '', email: '', phone: '', shippingDays: 5 });
    toast.success(`Supplier "${supplier.name}" added`);
  };

  const handleEdit = () => {
    if (editSupplier) {
      setSuppliers(suppliers.map(s => s.id === editSupplier.id ? editSupplier : s));
      setEditSupplier(null);
      toast.success('Supplier updated');
    }
  };

  return (
    <PageLayout
      title="Suppliers"
      description="Manage supplier relationships and shipping times"
      actions={
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Supplier</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Supplier</DialogTitle>
              <DialogDescription>Add a new supplier with shipping days.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input value={newSupplier.name} onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" value={newSupplier.email} onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input value={newSupplier.phone} onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Shipping Days</Label>
                <Input type="number" min={1} value={newSupplier.shippingDays} onChange={(e) => setNewSupplier({...newSupplier, shippingDays: parseInt(e.target.value) || 5})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Add Supplier</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search suppliers..." className="pl-10 bg-secondary" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="glass-card rounded-xl border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-semibold">Supplier</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Email</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Phone</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Shipping Days</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Products</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Active Orders</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.map((supplier) => (
              <TableRow key={supplier.id} className="border-border/50">
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell className="text-muted-foreground">{supplier.email}</TableCell>
                <TableCell className="text-muted-foreground">{supplier.phone}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    <Truck className="h-3 w-3 mr-1" />{supplier.shippingDays} days
                  </Badge>
                </TableCell>
                <TableCell>{supplier.products}</TableCell>
                <TableCell>{supplier.activeOrders}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => window.location.href = `mailto:${supplier.email}`}>
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => window.location.href = `tel:${supplier.phone}`}>
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Dialog open={editSupplier?.id === supplier.id} onOpenChange={(open) => !open && setEditSupplier(null)}>
                      <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditSupplier(supplier)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Supplier</DialogTitle>
                        </DialogHeader>
                        {editSupplier && (
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label>Name</Label>
                              <Input value={editSupplier.name} onChange={(e) => setEditSupplier({...editSupplier, name: e.target.value})} />
                            </div>
                            <div className="grid gap-2">
                              <Label>Shipping Days</Label>
                              <Input type="number" min={1} value={editSupplier.shippingDays} onChange={(e) => setEditSupplier({...editSupplier, shippingDays: parseInt(e.target.value) || 5})} />
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditSupplier(null)}>Cancel</Button>
                          <Button onClick={handleEdit}>Save</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
