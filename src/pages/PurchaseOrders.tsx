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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Eye, Truck, CheckCircle, XCircle, Clock, Filter, Search } from 'lucide-react';
import { mockPurchaseOrders, mockSuppliers, mockProducts, getSupplierByName, PurchaseOrder } from '@/data/mockInventory';
import { toast } from 'sonner';

const statusStyles: Record<string, string> = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  approved: 'bg-primary/20 text-primary border-primary/30',
  shipped: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delivered: 'bg-success/20 text-success border-success/30',
  cancelled: 'bg-destructive/20 text-destructive border-destructive/30',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  approved: <CheckCircle className="h-3 w-3" />,
  shipped: <Truck className="h-3 w-3" />,
  delivered: <CheckCircle className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
};

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    supplierId: '',
    productId: '',
    quantity: 1,
  });

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSupplier = supplierFilter === 'all' || order.supplierId === supplierFilter;
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.supplier.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSupplier && matchesSearch;
  });

  const handleStatusChange = (orderId: string, newStatus: PurchaseOrder['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    toast.success(`Order ${orderId} status updated to ${newStatus}`);
  };

  const handleCreateOrder = () => {
    const supplier = mockSuppliers.find(s => s.id === newOrder.supplierId);
    const product = mockProducts.find(p => p.id === newOrder.productId);
    
    if (!supplier || !product) {
      toast.error('Please select supplier and product');
      return;
    }

    const orderDate = new Date();
    const expectedDelivery = new Date(orderDate);
    expectedDelivery.setDate(expectedDelivery.getDate() + supplier.shippingDays);

    const newPO: PurchaseOrder = {
      id: `PO-${String(orders.length + 1).padStart(3, '0')}`,
      supplier: supplier.name,
      supplierId: supplier.id,
      items: [{
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: newOrder.quantity,
        unitCost: product.unitCost,
      }],
      total: product.unitCost * newOrder.quantity,
      status: 'pending',
      orderDate: orderDate.toISOString().split('T')[0],
      expectedDelivery: expectedDelivery.toISOString().split('T')[0],
    };

    setOrders([newPO, ...orders]);
    setIsCreateOpen(false);
    setNewOrder({ supplierId: '', productId: '', quantity: 1 });
    toast.success(`Order ${newPO.id} created! Expected delivery: ${expectedDelivery.toLocaleDateString()} (${supplier.shippingDays} days)`);
  };

  const selectedSupplier = mockSuppliers.find(s => s.id === newOrder.supplierId);

  return (
    <PageLayout
      title="Purchase Orders"
      description="Manage supplier orders and track deliveries"
      actions={
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
              <DialogDescription>
                Create a new order. Delivery time is based on supplier shipping days.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Supplier</Label>
                <Select value={newOrder.supplierId} onValueChange={(v) => setNewOrder({...newOrder, supplierId: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSuppliers.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} ({s.shippingDays} days shipping)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSupplier && (
                  <p className="text-sm text-muted-foreground">
                    <Truck className="h-3 w-3 inline mr-1" />
                    Shipping: {selectedSupplier.shippingDays} days
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Product</Label>
                <Select value={newOrder.productId} onValueChange={(v) => setNewOrder({...newOrder, productId: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} - ${p.unitCost}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Quantity</Label>
                <Input 
                  type="number" 
                  min={1}
                  value={newOrder.quantity}
                  onChange={(e) => setNewOrder({...newOrder, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateOrder}>Create Order</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-10 bg-secondary border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-secondary border-border">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={supplierFilter} onValueChange={setSupplierFilter}>
          <SelectTrigger className="w-[180px] bg-secondary border-border">
            <SelectValue placeholder="Supplier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suppliers</SelectItem>
            {mockSuppliers.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="glass-card rounded-xl border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-semibold">Order ID</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Supplier</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Items</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Total</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Order Date</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Expected Delivery</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => {
              const supplier = getSupplierByName(order.supplier);
              return (
                <TableRow key={order.id} className="border-border/50">
                  <TableCell className="font-mono font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p>{order.supplier}</p>
                      <p className="text-xs text-muted-foreground">
                        {supplier?.shippingDays} days shipping
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[order.status]}>
                      <span className="mr-1">{statusIcons[order.status]}</span>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.orderDate}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      {order.expectedDelivery}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Order {order.id}</DialogTitle>
                            <DialogDescription>Order details and items</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Supplier</p>
                                <p className="font-medium">{order.supplier}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Status</p>
                                <Badge variant="outline" className={statusStyles[order.status]}>
                                  {order.status}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Order Date</p>
                                <p className="font-medium">{order.orderDate}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Expected Delivery</p>
                                <p className="font-medium">{order.expectedDelivery}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-2">Items</p>
                              <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between p-2 bg-secondary rounded-lg">
                                    <div>
                                      <p className="font-medium">{item.productName}</p>
                                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                                    </div>
                                    <div className="text-right">
                                      <p>{item.quantity} x ${item.unitCost}</p>
                                      <p className="font-medium">${(item.quantity * item.unitCost).toFixed(2)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between pt-4 border-t border-border">
                              <span className="font-semibold">Total</span>
                              <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {order.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(order.id, 'approved')}>
                            Approve
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleStatusChange(order.id, 'cancelled')}>
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      {order.status === 'approved' && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(order.id, 'shipped')}>
                          <Truck className="h-4 w-4 mr-1" /> Ship
                        </Button>
                      )}
                      {order.status === 'shipped' && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(order.id, 'delivered')}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Delivered
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </PageLayout>
  );
}
