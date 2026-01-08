import { CheckCircle, Circle, Clock, Package, Truck, MapPin, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TrackingEvent {
  id: string;
  date: string;
  time: string;
  status: string;
  location: string;
  completed: boolean;
}

interface OrderTrackingTimelineProps {
  trackingNumber: string;
  events: TrackingEvent[];
}

const statusIcons: Record<string, React.ReactNode> = {
  'Order Placed': <Package className="h-4 w-4" />,
  'Order Confirmed': <CheckCircle className="h-4 w-4" />,
  'Processing': <Clock className="h-4 w-4" />,
  'Shipped': <Truck className="h-4 w-4" />,
  'In Transit': <Truck className="h-4 w-4" />,
  'Out for Delivery': <MapPin className="h-4 w-4" />,
  'Arrived at Hub': <Building className="h-4 w-4" />,
  'Delivered': <CheckCircle className="h-4 w-4" />,
};

export function OrderTrackingTimeline({ trackingNumber, events }: OrderTrackingTimelineProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
        <span className="text-sm text-muted-foreground">Tracking Number</span>
        <span className="font-mono font-bold text-primary">{trackingNumber}</span>
      </div>
      
      <div className="space-y-0">
        <div className="grid grid-cols-[140px_1fr] gap-4 text-sm font-semibold text-muted-foreground border-b border-border pb-2 mb-2">
          <span>Date of Last Status</span>
          <span>Transaction Status</span>
        </div>
        
        {events.map((event, index) => (
          <div
            key={event.id}
            className={cn(
              "grid grid-cols-[140px_1fr] gap-4 py-3 border-b border-border/50 last:border-0",
              index === 0 && "bg-success/5"
            )}
          >
            <div className="text-sm text-muted-foreground">
              <p>{event.date}</p>
              <p className="text-xs">{event.time}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full",
                event.completed ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
              )}>
                {event.completed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {statusIcons[event.status] || <Circle className="h-4 w-4" />}
                <span className={cn(
                  "font-medium",
                  event.completed ? "text-foreground" : "text-muted-foreground"
                )}>
                  {event.status}
                </span>
                {event.location && (
                  <span className="text-muted-foreground">at {event.location}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Generate tracking events based on order status
export function generateTrackingEvents(
  orderDate: string,
  status: string,
  supplierName: string,
  expectedDelivery: string,
  actualDelivery?: string
): TrackingEvent[] {
  const events: TrackingEvent[] = [];
  const orderDateObj = new Date(orderDate);
  
  // Order placed
  events.push({
    id: '1',
    date: formatDate(orderDateObj),
    time: '09:00 AM',
    status: 'Order Placed',
    location: 'Online System',
    completed: true,
  });

  if (['approved', 'shipped', 'delivered'].includes(status)) {
    const approvedDate = new Date(orderDateObj);
    approvedDate.setHours(approvedDate.getHours() + 4);
    events.unshift({
      id: '2',
      date: formatDate(approvedDate),
      time: '01:30 PM',
      status: 'Order Confirmed',
      location: supplierName,
      completed: true,
    });
  }

  if (['approved', 'shipped', 'delivered'].includes(status)) {
    const processingDate = new Date(orderDateObj);
    processingDate.setDate(processingDate.getDate() + 1);
    events.unshift({
      id: '3',
      date: formatDate(processingDate),
      time: '10:00 AM',
      status: 'Processing',
      location: `${supplierName} Warehouse`,
      completed: true,
    });
  }

  if (['shipped', 'delivered'].includes(status)) {
    const shippedDate = new Date(orderDateObj);
    shippedDate.setDate(shippedDate.getDate() + 1);
    events.unshift({
      id: '4',
      date: formatDate(shippedDate),
      time: '04:00 PM',
      status: 'Shipped',
      location: `${supplierName} Facility`,
      completed: true,
    });

    const transitDate = new Date(orderDateObj);
    transitDate.setDate(transitDate.getDate() + 2);
    events.unshift({
      id: '5',
      date: formatDate(transitDate),
      time: '08:30 AM',
      status: 'In Transit',
      location: 'Regional Distribution Center',
      completed: true,
    });

    const hubDate = new Date(orderDateObj);
    hubDate.setDate(hubDate.getDate() + 2);
    events.unshift({
      id: '6',
      date: formatDate(hubDate),
      time: '02:45 PM',
      status: 'Arrived at Hub',
      location: 'Local Delivery Hub',
      completed: true,
    });
  }

  if (status === 'delivered') {
    const deliveryDateObj = actualDelivery ? new Date(actualDelivery) : new Date(expectedDelivery);
    events.unshift({
      id: '7',
      date: formatDate(deliveryDateObj),
      time: '11:20 AM',
      status: 'Out for Delivery',
      location: 'Local Area',
      completed: true,
    });

    events.unshift({
      id: '8',
      date: formatDate(deliveryDateObj),
      time: '03:15 PM',
      status: 'Delivered',
      location: 'Your Warehouse',
      completed: true,
    });
  }

  return events;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });
}

// Generate a tracking number
export function generateTrackingNumber(orderId: string): string {
  const prefix = orderId.replace('PO-', '');
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TRK${prefix}${random}`;
}
