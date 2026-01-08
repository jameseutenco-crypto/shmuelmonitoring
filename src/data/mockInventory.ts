import { Product, StockAlert, DashboardStats } from '@/types/inventory';

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  shippingDays: number; // Days to deliver after order
  products: number;
  activeOrders: number;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  supplierId: string;
  items: PurchaseOrderItem[];
  total: number;
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  trackingNumber?: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
}

export interface SalesData {
  date: string;
  sales: number;
  deliveries: number;
  orders: number;
  revenue: number;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  capacity: number;
  usedCapacity: number;
  status: 'active' | 'inactive' | 'maintenance';
}

export const mockSuppliers: Supplier[] = [
  { id: 's1', name: 'AudioTech Inc.', email: 'orders@audiotech.com', phone: '+1 555-0101', shippingDays: 3, products: 2, activeOrders: 1 },
  { id: 's2', name: 'KeyMaster Ltd.', email: 'sales@keymaster.com', phone: '+1 555-0102', shippingDays: 5, products: 1, activeOrders: 2 },
  { id: 's3', name: 'ClickPro Corp.', email: 'info@clickpro.com', phone: '+1 555-0103', shippingDays: 2, products: 1, activeOrders: 0 },
  { id: 's4', name: 'DisplayMax', email: 'orders@displaymax.com', phone: '+1 555-0104', shippingDays: 7, products: 1, activeOrders: 1 },
  { id: 's5', name: 'CableWorld', email: 'sales@cableworld.com', phone: '+1 555-0105', shippingDays: 1, products: 1, activeOrders: 3 },
  { id: 's6', name: 'ComfortSeating', email: 'orders@comfortseating.com', phone: '+1 555-0106', shippingDays: 10, products: 1, activeOrders: 0 },
  { id: 's7', name: 'DeskPro Solutions', email: 'sales@deskpro.com', phone: '+1 555-0107', shippingDays: 14, products: 1, activeOrders: 1 },
  { id: 's8', name: 'VisionTech', email: 'orders@visiontech.com', phone: '+1 555-0108', shippingDays: 4, products: 1, activeOrders: 2 },
  { id: 's9', name: 'TechStands Co.', email: 'info@techstands.com', phone: '+1 555-0109', shippingDays: 6, products: 1, activeOrders: 0 },
];

export const mockWarehouses: Warehouse[] = [
  { id: 'w1', name: 'Warehouse A', address: '123 Industrial Blvd, City A', capacity: 10000, usedCapacity: 6500, status: 'active' },
  { id: 'w2', name: 'Warehouse B', address: '456 Storage Ave, City B', capacity: 8000, usedCapacity: 4200, status: 'active' },
  { id: 'w3', name: 'Warehouse C', address: '789 Logistics Dr, City C', capacity: 12000, usedCapacity: 9800, status: 'active' },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'WH-001-BLK',
    name: 'Wireless Headphones Pro',
    category: 'Electronics',
    currentStock: 145,
    minStock: 50,
    maxStock: 500,
    reorderPoint: 100,
    unitCost: 89.99,
    supplier: 'AudioTech Inc.',
    lastRestocked: '2024-01-15',
    warehouse: 'Warehouse A',
    icon: 'Headphones',
  },
  {
    id: '2',
    sku: 'KB-205-RGB',
    name: 'Mechanical Keyboard RGB',
    category: 'Electronics',
    currentStock: 23,
    minStock: 30,
    maxStock: 200,
    reorderPoint: 50,
    unitCost: 129.99,
    supplier: 'KeyMaster Ltd.',
    lastRestocked: '2024-01-10',
    warehouse: 'Warehouse A',
    icon: 'Keyboard',
  },
  {
    id: '3',
    sku: 'MS-100-WL',
    name: 'Ergonomic Mouse Wireless',
    category: 'Electronics',
    currentStock: 0,
    minStock: 25,
    maxStock: 150,
    reorderPoint: 40,
    unitCost: 45.99,
    supplier: 'ClickPro Corp.',
    lastRestocked: '2024-01-05',
    warehouse: 'Warehouse B',
    icon: 'Mouse',
  },
  {
    id: '4',
    sku: 'MN-450-27',
    name: '27" 4K Monitor',
    category: 'Electronics',
    currentStock: 67,
    minStock: 20,
    maxStock: 100,
    reorderPoint: 30,
    unitCost: 449.99,
    supplier: 'DisplayMax',
    lastRestocked: '2024-01-12',
    warehouse: 'Warehouse A',
    icon: 'Monitor',
  },
  {
    id: '5',
    sku: 'CB-USB-C3',
    name: 'USB-C Cable 3m',
    category: 'Accessories',
    currentStock: 892,
    minStock: 200,
    maxStock: 1000,
    reorderPoint: 400,
    unitCost: 12.99,
    supplier: 'CableWorld',
    lastRestocked: '2024-01-18',
    warehouse: 'Warehouse C',
    icon: 'Cable',
  },
  {
    id: '6',
    sku: 'CH-ERG-01',
    name: 'Ergonomic Office Chair',
    category: 'Furniture',
    currentStock: 12,
    minStock: 10,
    maxStock: 50,
    reorderPoint: 15,
    unitCost: 299.99,
    supplier: 'ComfortSeating',
    lastRestocked: '2024-01-08',
    warehouse: 'Warehouse B',
    icon: 'Armchair',
  },
  {
    id: '7',
    sku: 'DSK-STD-L',
    name: 'Standing Desk Large',
    category: 'Furniture',
    currentStock: 8,
    minStock: 5,
    maxStock: 30,
    reorderPoint: 10,
    unitCost: 599.99,
    supplier: 'DeskPro Solutions',
    lastRestocked: '2024-01-14',
    warehouse: 'Warehouse B',
    icon: 'Table',
  },
  {
    id: '8',
    sku: 'WC-HD-1080',
    name: 'HD Webcam 1080p',
    category: 'Electronics',
    currentStock: 156,
    minStock: 40,
    maxStock: 250,
    reorderPoint: 80,
    unitCost: 79.99,
    supplier: 'VisionTech',
    lastRestocked: '2024-01-16',
    warehouse: 'Warehouse A',
    icon: 'Camera',
  },
  {
    id: '9',
    sku: 'HP-STAND-01',
    name: 'Headphone Stand Premium',
    category: 'Accessories',
    currentStock: 45,
    minStock: 30,
    maxStock: 150,
    reorderPoint: 50,
    unitCost: 34.99,
    supplier: 'AudioTech Inc.',
    lastRestocked: '2024-01-11',
    warehouse: 'Warehouse C',
    icon: 'HeadphonesIcon',
  },
  {
    id: '10',
    sku: 'LP-STAND-AL',
    name: 'Laptop Stand Aluminum',
    category: 'Accessories',
    currentStock: 78,
    minStock: 25,
    maxStock: 200,
    reorderPoint: 50,
    unitCost: 59.99,
    supplier: 'TechStands Co.',
    lastRestocked: '2024-01-17',
    warehouse: 'Warehouse A',
    icon: 'Laptop',
  },
];

export const mockAlerts: StockAlert[] = [
  {
    id: 'a1',
    productId: '3',
    productName: 'Ergonomic Mouse Wireless',
    sku: 'MS-100-WL',
    type: 'out_of_stock',
    currentStock: 0,
    reorderPoint: 40,
    timestamp: '2024-01-19T10:30:00Z',
  },
  {
    id: 'a2',
    productId: '2',
    productName: 'Mechanical Keyboard RGB',
    sku: 'KB-205-RGB',
    type: 'low_stock',
    currentStock: 23,
    reorderPoint: 50,
    timestamp: '2024-01-19T09:15:00Z',
  },
  {
    id: 'a3',
    productId: '6',
    productName: 'Ergonomic Office Chair',
    sku: 'CH-ERG-01',
    type: 'reorder_needed',
    currentStock: 12,
    reorderPoint: 15,
    timestamp: '2024-01-19T08:45:00Z',
  },
  {
    id: 'a4',
    productId: '9',
    productName: 'Headphone Stand Premium',
    sku: 'HP-STAND-01',
    type: 'reorder_needed',
    currentStock: 45,
    reorderPoint: 50,
    timestamp: '2024-01-19T07:20:00Z',
  },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  { 
    id: 'PO-001', 
    supplier: 'AudioTech Inc.', 
    supplierId: 's1',
    items: [
      { productId: '1', productName: 'Wireless Headphones Pro', sku: 'WH-001-BLK', quantity: 50, unitCost: 89.99 },
      { productId: '9', productName: 'Headphone Stand Premium', sku: 'HP-STAND-01', quantity: 30, unitCost: 34.99 },
    ],
    total: 5549.20, 
    status: 'pending', 
    orderDate: '2024-01-19',
    expectedDelivery: '2024-01-22',
    trackingNumber: 'TRK001ABC123',
  },
  { 
    id: 'PO-002', 
    supplier: 'KeyMaster Ltd.', 
    supplierId: 's2',
    items: [
      { productId: '2', productName: 'Mechanical Keyboard RGB', sku: 'KB-205-RGB', quantity: 40, unitCost: 129.99 },
    ],
    total: 5199.60, 
    status: 'approved', 
    orderDate: '2024-01-18',
    expectedDelivery: '2024-01-23',
    trackingNumber: 'TRK002DEF456',
  },
  { 
    id: 'PO-003', 
    supplier: 'ClickPro Corp.', 
    supplierId: 's3',
    items: [
      { productId: '3', productName: 'Ergonomic Mouse Wireless', sku: 'MS-100-WL', quantity: 60, unitCost: 45.99 },
    ],
    total: 2759.40, 
    status: 'shipped', 
    orderDate: '2024-01-17',
    expectedDelivery: '2024-01-19',
    trackingNumber: 'TRK003GHI789',
  },
  { 
    id: 'PO-004', 
    supplier: 'DisplayMax', 
    supplierId: 's4',
    items: [
      { productId: '4', productName: '27" 4K Monitor', sku: 'MN-450-27', quantity: 10, unitCost: 449.99 },
    ],
    total: 4499.90, 
    status: 'delivered', 
    orderDate: '2024-01-10',
    expectedDelivery: '2024-01-17',
    actualDelivery: '2024-01-16',
    trackingNumber: 'TRK004JKL012',
  },
  { 
    id: 'PO-005', 
    supplier: 'CableWorld', 
    supplierId: 's5',
    items: [
      { productId: '5', productName: 'USB-C Cable 3m', sku: 'CB-USB-C3', quantity: 200, unitCost: 12.99 },
    ],
    total: 2598.00, 
    status: 'pending', 
    orderDate: '2024-01-19',
    expectedDelivery: '2024-01-20',
    trackingNumber: 'TRK005MNO345',
  },
];

export const mockSalesData: SalesData[] = [
  { date: '2024-01-13', sales: 45, deliveries: 12, orders: 8, revenue: 12450 },
  { date: '2024-01-14', sales: 52, deliveries: 15, orders: 10, revenue: 15230 },
  { date: '2024-01-15', sales: 38, deliveries: 18, orders: 6, revenue: 9870 },
  { date: '2024-01-16', sales: 65, deliveries: 22, orders: 12, revenue: 18900 },
  { date: '2024-01-17', sales: 48, deliveries: 14, orders: 9, revenue: 14200 },
  { date: '2024-01-18', sales: 72, deliveries: 25, orders: 15, revenue: 22100 },
  { date: '2024-01-19', sales: 58, deliveries: 19, orders: 11, revenue: 16800 },
];

export const mockStats: DashboardStats = {
  totalProducts: mockProducts.length,
  lowStockItems: mockProducts.filter(p => p.currentStock > 0 && p.currentStock <= p.reorderPoint).length,
  outOfStockItems: mockProducts.filter(p => p.currentStock === 0).length,
  totalStockValue: mockProducts.reduce((acc, p) => acc + (p.currentStock * p.unitCost), 0),
  reorderNeeded: mockProducts.filter(p => p.currentStock <= p.reorderPoint).length,
};

export const getSupplierByName = (name: string): Supplier | undefined => {
  return mockSuppliers.find(s => s.name === name);
};

export const calculateExpectedDelivery = (supplierName: string, orderDate: Date = new Date()): Date => {
  const supplier = getSupplierByName(supplierName);
  const shippingDays = supplier?.shippingDays || 7;
  const delivery = new Date(orderDate);
  delivery.setDate(delivery.getDate() + shippingDays);
  return delivery;
};
