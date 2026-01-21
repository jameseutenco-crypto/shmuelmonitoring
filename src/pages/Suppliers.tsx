import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDatabase } from '@/contexts/ExternalDatabaseContext';
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
import { Plus, Mail, Phone, Truck, Edit, Search, RefreshCw, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';

interface LocalSupplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  productsSupplied: number;
  activeOrders: number;
  rating: number;
  status: 'active' | 'inactive';
}

export default function Suppliers() {
  const { suppliers: dbSuppliers, isLoading, isConnected, refetch } = useDatabase();
  const [localSuppliers, setLocalSuppliers] = useState<LocalSupplier[]>([]);
  const [search, setSearch] = useState('');
  const [editSupplier, setEditSupplier] = useState<LocalSupplier | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', email: '', phone: '' });

  // Combine database suppliers with local ones
  const suppliers = [...dbSuppliers, ...localSuppliers];

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    const supplier: LocalSupplier = {
      id: `local-${Date.now()}`,
      ...newSupplier,
      productsSupplied: 0,
      activeOrders: 0,
      rating: 4.0,
      status: 'active',
    };
    setLocalSuppliers([...localSuppliers, supplier]);
    setIsCreateOpen(false);
    setNewSupplier({ name: '', email: '', phone: '' });
    toast.success(`Supplier "${supplier.name}" added`);
  };

  const handleEdit = () => {
    if (editSupplier) {
      setLocalSuppliers(localSuppliers.map(s => s.id === editSupplier.id ? editSupplier : s));
      setEditSupplier(null);
      toast.success('Supplier updated');
    }
  };

  return (
    <PageLayout
      title="Suppliers"
      description={isConnected ? `${suppliers.length} suppliers from Supabase` : "Manage supplier relationships"}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Supplier</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Supplier</DialogTitle>
                <DialogDescription>Add a new supplier to your network.</DialogDescription>
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
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Add Supplier</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
              <TableHead className="text-muted-foreground font-semibold">Products</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Active Orders</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Rating</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No suppliers found
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} className="border-border/50">
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell className="text-muted-foreground">{supplier.email}</TableCell>
                  <TableCell className="text-muted-foreground">{supplier.phone}</TableCell>
                  <TableCell>{supplier.productsSupplied}</TableCell>
                  <TableCell>{supplier.activeOrders}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span>{supplier.rating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                      {supplier.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => window.location.href = `mailto:${supplier.email}`}>
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => window.location.href = `tel:${supplier.phone}`}>
                        <Phone className="h-4 w-4" />
                      </Button>
                      {supplier.id.startsWith('local-') && (
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
                                  <Label>Email</Label>
                                  <Input value={editSupplier.email} onChange={(e) => setEditSupplier({...editSupplier, email: e.target.value})} />
                                </div>
                                <div className="grid gap-2">
                                  <Label>Phone</Label>
                                  <Input value={editSupplier.phone} onChange={(e) => setEditSupplier({...editSupplier, phone: e.target.value})} />
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditSupplier(null)}>Cancel</Button>
                              <Button onClick={handleEdit}>Save</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </PageLayout>
  );
}
