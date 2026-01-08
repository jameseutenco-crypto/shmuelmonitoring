import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TrackingEvent {
  id: string;
  date: string;
  status: string;
  location?: string;
  completed: boolean;
}

interface OrderTrackingTimelineProps {
  trackingNumber: string;
  events: TrackingEvent[];
}

export function OrderTrackingTimeline({ trackingNumber, events }: OrderTrackingTimelineProps) {
  return (
    <div className="space-y-4">
      {/* Tracking Number Header */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Tracking Number</p>
        <p className="text-xl font-bold text-primary font-mono">{trackingNumber}</p>
      </div>
      
      {/* Tracking Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[160px_1fr] bg-muted/50 border-b border-border">
          <div className="px-4 py-3 font-semibold text-sm text-foreground">
            Date of Last Status
          </div>
          <div className="px-4 py-3 font-semibold text-sm text-foreground border-l border-border">
            Transaction Status
          </div>
        </div>
        
        {/* Events */}
        <div className="divide-y divide-border">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={cn(
                "grid grid-cols-[160px_1fr]",
                index % 2 === 0 ? "bg-background" : "bg-muted/20"
              )}
            >
              <div className="px-4 py-3 text-sm text-muted-foreground">
                {event.date}
              </div>
              <div className="px-4 py-3 border-l border-border flex items-center gap-3">
                <CheckCircle2 
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    event.completed ? "text-amber-500" : "text-muted-foreground/30"
                  )} 
                  fill={event.completed ? "currentColor" : "none"}
                  strokeWidth={event.completed ? 0 : 2}
                />
                <span className={cn(
                  "text-sm",
                  event.completed ? "text-foreground" : "text-muted-foreground"
                )}>
                  {event.status}
                  {event.location && (
                    <span className="text-muted-foreground"> {event.location}</span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
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
  
  // Always add order placed (oldest - at bottom)
  events.push({
    id: '1',
    date: formatDate(orderDateObj),
    status: `Order placed via`,
    location: 'Online System.',
    completed: true,
  });

  if (['approved', 'shipped', 'delivered'].includes(status)) {
    const confirmedDate = new Date(orderDateObj);
    confirmedDate.setHours(confirmedDate.getHours() + 2);
    events.unshift({
      id: '2',
      date: formatDate(confirmedDate),
      status: `Order confirmed by`,
      location: `${supplierName}.`,
      completed: true,
    });
  }

  if (['approved', 'shipped', 'delivered'].includes(status)) {
    const processingDate = new Date(orderDateObj);
    processingDate.setDate(processingDate.getDate() + 1);
    events.unshift({
      id: '3',
      date: formatDate(processingDate),
      status: `Processing at`,
      location: `${supplierName} WAREHOUSE.`,
      completed: true,
    });
  }

  if (['shipped', 'delivered'].includes(status)) {
    const shippedDate = new Date(orderDateObj);
    shippedDate.setDate(shippedDate.getDate() + 1);
    events.unshift({
      id: '4',
      date: formatDate(shippedDate),
      status: `Forwarded to`,
      location: 'REGIONAL DISTRIBUTION CENTER.',
      completed: true,
    });

    const transitDate = new Date(orderDateObj);
    transitDate.setDate(transitDate.getDate() + 2);
    events.unshift({
      id: '5',
      date: formatDate(transitDate),
      status: `Arrived at`,
      location: 'REGIONAL DISTRIBUTION CENTER.',
      completed: true,
    });

    const hubDate = new Date(orderDateObj);
    hubDate.setDate(hubDate.getDate() + 2);
    events.unshift({
      id: '6',
      date: formatDate(hubDate),
      status: `Forwarded to`,
      location: 'LOCAL DELIVERY HUB.',
      completed: true,
    });

    const arriveHubDate = new Date(orderDateObj);
    arriveHubDate.setDate(arriveHubDate.getDate() + 3);
    events.unshift({
      id: '7',
      date: formatDate(arriveHubDate),
      status: `Arrived at`,
      location: 'LOCAL DELIVERY HUB.',
      completed: true,
    });
  }

  if (status === 'delivered') {
    const deliveryDateObj = actualDelivery ? new Date(actualDelivery) : new Date(expectedDelivery);
    
    events.unshift({
      id: '8',
      date: formatDate(deliveryDateObj),
      status: `Ready for delivery. Please expect delivery within the day.`,
      location: '',
      completed: true,
    });

    events.unshift({
      id: '9',
      date: formatDate(deliveryDateObj),
      status: `Received by`,
      location: `WAREHOUSE MANAGER on ${formatDate(deliveryDateObj)}.`,
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
