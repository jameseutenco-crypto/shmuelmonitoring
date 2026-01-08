import { useState, useMemo } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Eye, Truck, CheckCircle, XCircle, Clock, Search, Package, MapPin } from 'lucide-react';
import { mockPurchaseOrders, mockSuppliers, mockProducts, getSupplierByName, PurchaseOrder } from '@/data/mockInventory';
import { StatusFilterTabs } from '@/components/orders/StatusFilterTabs';
import { OrderTrackingTimeline, generateTrackingEvents, generateTrackingNumber } from '@/components/orders/OrderTrackingTimeline';
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
  delivered: <Package className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
};

// Product stock state (simulating real inventory)
const initialProductStock: Record<string, number> = {
  '1': 145,  // Wireless Headphones Pro
  '2': 23,   // Mechanical Keyboard RGB
  '3': 0,    // Ergonomic Mouse Wireless
  '4': 67,   // 27" 4K Monitor
  '5': 892,  // USB-C Cable 3m
  '6': 12,   // Ergonomic Office Chair
  '7': 8,    // Standing Desk Large
  '8': 156,  // HD Webcam 1080p
  '9': 45,   // Headphone Stand Premium
  '10': 78,  // Laptop Stand Aluminum
};

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [productStock, setProductStock] = useState<Record<string, number>>(initialProductStock);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<PurchaseOrder | null>(null);
  const [newOrder, setNewOrder] = useState({
    supplierId: '',
    productId: '',
    quantity: 1,
  });

  // Calculate order counts for filter tabs
  const orderCounts = useMemo(() => {
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [orders]);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSupplier = supplierFilter === 'all' || order.supplierId === supplierFilter;
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.supplier.toLowerCase().includes(search.toLowerCase()) ||
      (order.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ?? false);
    return matchesStatus && matchesSupplier && matchesSearch;
  });

  const handleStatusChange = (orderId: string, newStatus: PurchaseOrder['status']) => {
    setOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order => {
        if (order.id !== orderId) return order;
        
        const updatedOrder = { ...order, status: newStatus };
        
        // When status changes to shipped, generate tracking number if not exists
        if (newStatus === 'shipped' && !order.trackingNumber) {
          updatedOrder.trackingNumber = generateTrackingNumber(orderId);
        }
        
        // When delivered, set actual delivery date and update stock
        if (newStatus === 'delivered') {
          updatedOrder.actualDelivery = new Date().toISOString().split('T')[0];
          
          // Update product stock
          order.items.forEach(item => {
            setProductStock(prev => ({
              ...prev,
              [item.productId]: (prev[item.productId] || 0) + item.quantity
            }));
          });
          
          const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);
          toast.success(
            `Order ${orderId} delivered! Stock updated: +${totalUnits} units added to inventory.`
          );
        }
        
        return updatedOrder;
      });
      
      return updatedOrders;
    });
    
    if (newStatus !== 'delivered') {
      toast.success(`Order ${orderId} status updated to ${newStatus}`);
    }
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
      trackingNumber: generateTrackingNumber(`PO-${String(orders.length + 1).padStart(3, '0')}`),
    };

    setOrders([newPO, ...orders]);
    setIsCreateOpen(false);
    setNewOrder({ supplierId: '', productId: '', quantity: 1 });
    toast.success(`Order ${newPO.id} created! Expected delivery: ${expectedDelivery.toLocaleDateString()} (${supplier.shippingDays} days)`);
  };

  const handleViewTracking = (order: PurchaseOrder) => {
    setTrackingOrder(order);
    setIsTrackingOpen(true);
  };

  const selectedSupplier = mockSuppliers.find(s => s.id === newOrder.supplierId);
  const selectedProduct = mockProducts.find(p => p.id === newOrder.productId);

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
                        {p.name} - ${p.unitCost} (Stock: {productStock[p.id] || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProduct && (
                  <p className="text-sm text-muted-foreground">
                    Current Stock: {productStock[selectedProduct.id] || 0} units
                  </p>
                )}
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
      {/* Status Filter Tabs */}
      <StatusFilterTabs
        activeStatus={statusFilter}
        onStatusChange={setStatusFilter}
        orderCounts={orderCounts}
      />

      {/* Additional Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, supplier, or tracking number..."
            className="pl-10 bg-secondary border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
              <TableHead className="text-muted-foreground font-semibold">Tracking</TableHead>
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
                  <TableCell>
                    <div>
                      <span>{order.items.length} item(s)</span>
                      <p className="text-xs text-muted-foreground">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[order.status]}>
                      <span className="mr-1">{statusIcons[order.status]}</span>
                      {order.status === 'pending' ? 'Ordered' : 
                       order.status === 'shipped' ? 'In Transit' :
                       order.status === 'delivered' ? 'Received' :
                       order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.orderDate}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      {order.expectedDelivery}
                    </div>
                    {order.actualDelivery && (
                      <p className="text-xs text-success">
                        <CheckCircle className="h-3 w-3 inline mr-1" />
                        Received: {order.actualDelivery}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.trackingNumber ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="font-mono text-xs text-primary hover:text-primary/80"
                        onClick={() => handleViewTracking(order)}
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        {order.trackingNumber}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Order {order.id}</DialogTitle>
                            <DialogDescription>Order details, items, and stock impact</DialogDescription>
                          </DialogHeader>
                          <Tabs defaultValue="details">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="details">Details</TabsTrigger>
                              <TabsTrigger value="tracking">Tracking</TabsTrigger>
                            </TabsList>
                            <TabsContent value="details" className="space-y-4 mt-4">
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
                                {order.actualDelivery && (
                                  <div>
                                    <p className="text-muted-foreground">Actual Delivery</p>
                                    <p className="font-medium text-success">{order.actualDelivery}</p>
                                  </div>
                                )}
                                {order.trackingNumber && (
                                  <div>
                                    <p className="text-muted-foreground">Tracking Number</p>
                                    <p className="font-mono font-medium text-primary">{order.trackingNumber}</p>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-muted-foreground mb-2">Items & Stock Impact</p>
                                <div className="space-y-2">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between p-3 bg-secondary rounded-lg">
                                      <div>
                                        <p className="font-medium">{item.productName}</p>
                                        <p className="text-xs text-muted-foreground">{item.sku}</p>
                                        <p className="text-xs mt-1">
                                          <span className="text-muted-foreground">Current Stock: </span>
                                          <span className="font-medium">{productStock[item.productId] || 0}</span>
                                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                            <span className="text-success ml-2">
                                              (+{item.quantity} pending)
                                            </span>
                                          )}
                                        </p>
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
                            </TabsContent>
                            <TabsContent value="tracking" className="mt-4">
                              {order.trackingNumber ? (
                                <OrderTrackingTimeline
                                  trackingNumber={order.trackingNumber}
                                  events={generateTrackingEvents(
                                    order.orderDate,
                                    order.status,
                                    order.supplier,
                                    order.expectedDelivery,
                                    order.actualDelivery
                                  )}
                                />
                              ) : (
                                <p className="text-center text-muted-foreground py-8">
                                  Tracking will be available once the order is shipped.
                                </p>
                              )}
                            </TabsContent>
                          </Tabs>
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
                        <Button size="sm" variant="success" onClick={() => handleStatusChange(order.id, 'delivered')}>
                          <Package className="h-4 w-4 mr-1" /> Receive
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No orders found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Tracking Dialog */}
      <Dialog open={isTrackingOpen} onOpenChange={setIsTrackingOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Tracking - {trackingOrder?.id}</DialogTitle>
            <DialogDescription>Track your order shipment status</DialogDescription>
          </DialogHeader>
          {trackingOrder && trackingOrder.trackingNumber && (
            <OrderTrackingTimeline
              trackingNumber={trackingOrder.trackingNumber}
              events={generateTrackingEvents(
                trackingOrder.orderDate,
                trackingOrder.status,
                trackingOrder.supplier,
                trackingOrder.expectedDelivery,
                trackingOrder.actualDelivery
              )}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
