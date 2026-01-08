import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockProducts, mockWarehouses, Warehouse } from '@/data/mockInventory';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Building2, Package, DollarSign, MapPin, Settings, Boxes } from 'lucide-react';
import { toast } from 'sonner';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [newWarehouse, setNewWarehouse] = useState({
    name: '',
    address: '',
    capacity: 5000,
  });

  const getWarehouseStats = (warehouseName: string) => {
    const products = mockProducts.filter(p => p.warehouse === warehouseName);
    const totalItems = products.reduce((acc, p) => acc + p.currentStock, 0);
    const totalValue = products.reduce((acc, p) => acc + p.currentStock * p.unitCost, 0);
    return { products: products.length, totalItems, totalValue };
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

  const handleCreateWarehouse = () => {
    if (!newWarehouse.name || !newWarehouse.address) {
      toast.error('Please fill in all fields');
      return;
    }

    const warehouse: Warehouse = {
      id: `w${warehouses.length + 1}`,
      name: newWarehouse.name,
      address: newWarehouse.address,
      capacity: newWarehouse.capacity,
      usedCapacity: 0,
      status: 'active',
    };

    setWarehouses([...warehouses, warehouse]);
    setIsCreateOpen(false);
    setNewWarehouse({ name: '', address: '', capacity: 5000 });
    toast.success(`Warehouse "${warehouse.name}" created successfully`);
  };

  const handleStatusChange = (warehouseId: string, status: Warehouse['status']) => {
    setWarehouses(warehouses.map(w => 
      w.id === warehouseId ? { ...w, status } : w
    ));
    toast.success('Warehouse status updated');
  };

  const getStatusBadge = (status: Warehouse['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/20 text-success border-success/30">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-muted text-muted-foreground">Inactive</Badge>;
      case 'maintenance':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Maintenance</Badge>;
    }
  };

  return (
    <PageLayout
      title="Warehouses"
      description="Manage warehouse locations and inventory"
      actions={
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Warehouse
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Warehouse</DialogTitle>
              <DialogDescription>
                Create a new warehouse location for inventory storage.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Warehouse Name</Label>
                <Input
                  placeholder="e.g., Warehouse D"
                  value={newWarehouse.name}
                  onChange={(e) => setNewWarehouse({...newWarehouse, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Address</Label>
                <Input
                  placeholder="Enter full address"
                  value={newWarehouse.address}
                  onChange={(e) => setNewWarehouse({...newWarehouse, address: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Capacity (units)</Label>
                <Input
                  type="number"
                  min={1000}
                  value={newWarehouse.capacity}
                  onChange={(e) => setNewWarehouse({...newWarehouse, capacity: parseInt(e.target.value) || 5000})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateWarehouse}>Create Warehouse</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => {
          const stats = getWarehouseStats(warehouse.name);
          const capacityPercent = (warehouse.usedCapacity / warehouse.capacity) * 100;
          
          return (
            <div key={warehouse.id} className="glass-card rounded-xl border border-border/50 p-6 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{warehouse.name}</h3>
                    {getStatusBadge(warehouse.status)}
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => setSelectedWarehouse(warehouse)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{warehouse.name} Settings</DialogTitle>
                      <DialogDescription>Manage warehouse settings and status</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {warehouse.address}
                      </div>
                      <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select 
                          value={warehouse.status} 
                          onValueChange={(v) => handleStatusChange(warehouse.id, v as Warehouse['status'])}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                {warehouse.address}
              </div>

              {/* Capacity Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-medium">{capacityPercent.toFixed(0)}%</span>
                </div>
                <Progress value={capacityPercent} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{warehouse.usedCapacity.toLocaleString()} used</span>
                  <span>{warehouse.capacity.toLocaleString()} total</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-secondary/50 text-center">
                  <Package className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-lg font-bold text-foreground">{stats.products}</p>
                  <p className="text-xs text-muted-foreground">Products</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50 text-center">
                  <Boxes className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-lg font-bold text-foreground">{stats.totalItems}</p>
                  <p className="text-xs text-muted-foreground">Items</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50 text-center">
                  <DollarSign className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-lg font-bold text-foreground">{formatCurrency(stats.totalValue).replace('$', '')}</p>
                  <p className="text-xs text-muted-foreground">Value</p>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4">
                View Inventory
              </Button>
            </div>
          );
        })}
      </div>
    </PageLayout>
  );
}
