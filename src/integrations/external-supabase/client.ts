import { createClient } from '@supabase/supabase-js';

// External Supabase connection
const EXTERNAL_SUPABASE_URL = 'https://myvqxyirodlwuquvdchu.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'sb_publishable_AeagOkT87V5ixWKvG8EE3g_5z8KkuWd';

export const externalSupabase = createClient(
  EXTERNAL_SUPABASE_URL,
  EXTERNAL_SUPABASE_ANON_KEY
);

// Types for your external database tables
export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  reorderPoint: number;
  unitCost: number;
  supplier: string;
}

export interface Order {
  id: string;
  orderDate: string;
  status: string;
  supplier: string;
  items: any; // JSON or array
  total: number;
  expectedDelivery: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}
