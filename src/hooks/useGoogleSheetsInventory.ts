import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, StockAlert, DashboardStats } from '@/types/inventory';
import { mockProducts, mockStats, mockAlerts } from '@/data/mockInventory';

const SHEET_URL_KEY = 'googleSheetUrl';

interface SheetsData {
  products: Product[];
  stats: DashboardStats;
  alerts: StockAlert[];
}

export const useGoogleSheetsInventory = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [alerts, setAlerts] = useState<StockAlert[]>(mockAlerts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    return localStorage.getItem(SHEET_URL_KEY) || '';
  });
  const [isConnected, setIsConnected] = useState(false);

  const fetchFromSheet = useCallback(async (url: string) => {
    if (!url) return;
    
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching inventory from Google Sheet...");
      
      const { data, error: fnError } = await supabase.functions.invoke('fetch-sheets', {
        body: { sheetUrl: url }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to fetch sheet data');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log("Received data:", data);
      
      setProducts(data.products || []);
      setStats(data.stats || mockStats);
      setAlerts(data.alerts || []);
      setIsConnected(true);
      
      // Save URL to localStorage
      localStorage.setItem(SHEET_URL_KEY, url);
      setSheetUrl(url);

    } catch (err: any) {
      console.error("Error fetching from Google Sheets:", err);
      setError(err.message || 'Failed to fetch data from Google Sheets');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(SHEET_URL_KEY);
    setSheetUrl('');
    setProducts(mockProducts);
    setStats(mockStats);
    setAlerts(mockAlerts);
    setIsConnected(false);
    setError(null);
  }, []);

  const refresh = useCallback(() => {
    if (sheetUrl) {
      fetchFromSheet(sheetUrl);
    }
  }, [sheetUrl, fetchFromSheet]);

  // Auto-fetch on mount if URL is saved
  useEffect(() => {
    const savedUrl = localStorage.getItem(SHEET_URL_KEY);
    if (savedUrl) {
      fetchFromSheet(savedUrl);
    }
  }, [fetchFromSheet]);

  return {
    products,
    stats,
    alerts,
    loading,
    error,
    sheetUrl,
    isConnected,
    connectSheet: fetchFromSheet,
    disconnect,
    refresh,
  };
};
