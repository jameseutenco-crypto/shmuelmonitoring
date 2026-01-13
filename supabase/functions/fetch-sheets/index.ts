import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitCost: number;
  supplier: string;
  lastRestocked: string;
  warehouse: string;
  icon: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sheetUrl } = await req.json();
    
    if (!sheetUrl) {
      console.error("Missing sheetUrl parameter");
      return new Response(
        JSON.stringify({ error: 'sheetUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Fetching data from Google Sheet:", sheetUrl);

    // Extract spreadsheet ID from URL
    const sheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) {
      console.error("Invalid Google Sheets URL format");
      return new Response(
        JSON.stringify({ error: 'Invalid Google Sheets URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sheetId = sheetIdMatch[1];
    
    // Fetch data from Google Sheets using the public CSV export
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
    console.log("Fetching from CSV URL:", csvUrl);
    
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      console.error("Failed to fetch sheet:", response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch sheet. Make sure it is shared publicly.' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const text = await response.text();
    console.log("Raw response length:", text.length);
    
    // Parse the JSONP response from Google
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
    if (!jsonMatch) {
      console.error("Failed to parse Google Sheets response");
      return new Response(
        JSON.stringify({ error: 'Failed to parse sheet data. Ensure sheet is public.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = JSON.parse(jsonMatch[1]);
    const rows = data.table.rows;
    const cols = data.table.cols;
    
    console.log("Parsed rows count:", rows.length);
    console.log("Columns:", cols.map((c: any) => c.label));

    // Map column headers (first row or column labels)
    const headers = cols.map((col: any) => col.label?.toLowerCase().trim() || '');
    
    // Find column indices
    const getColIndex = (names: string[]) => {
      for (const name of names) {
        const idx = headers.findIndex((h: string) => h.includes(name));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const idxId = getColIndex(['id']);
    const idxSku = getColIndex(['sku']);
    const idxName = getColIndex(['name', 'product']);
    const idxCategory = getColIndex(['category']);
    const idxCurrentStock = getColIndex(['current', 'stock', 'currentstock']);
    const idxMinStock = getColIndex(['min', 'minstock']);
    const idxMaxStock = getColIndex(['max', 'maxstock']);
    const idxReorderPoint = getColIndex(['reorder', 'reorderpoint']);
    const idxUnitCost = getColIndex(['cost', 'unitcost', 'price']);
    const idxSupplier = getColIndex(['supplier']);
    const idxLastRestocked = getColIndex(['restocked', 'lastrestocked', 'date']);
    const idxWarehouse = getColIndex(['warehouse']);
    const idxIcon = getColIndex(['icon']);

    console.log("Column indices:", {
      idxId, idxSku, idxName, idxCategory, idxCurrentStock,
      idxMinStock, idxMaxStock, idxReorderPoint, idxUnitCost,
      idxSupplier, idxLastRestocked, idxWarehouse, idxIcon
    });

    // Parse products
    const products: Product[] = [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.c;
      
      if (!cells) continue;
      
      const getValue = (idx: number, defaultVal: any = '') => {
        if (idx === -1 || !cells[idx]) return defaultVal;
        return cells[idx].v !== null && cells[idx].v !== undefined ? cells[idx].v : defaultVal;
      };

      const id = getValue(idxId, String(i + 1));
      const sku = getValue(idxSku, '');
      const name = getValue(idxName, '');
      
      // Skip empty rows
      if (!name && !sku) continue;

      const product: Product = {
        id: String(id),
        sku: String(sku),
        name: String(name),
        category: String(getValue(idxCategory, 'Uncategorized')),
        currentStock: Number(getValue(idxCurrentStock, 0)) || 0,
        minStock: Number(getValue(idxMinStock, 0)) || 0,
        maxStock: Number(getValue(idxMaxStock, 100)) || 100,
        reorderPoint: Number(getValue(idxReorderPoint, 10)) || 10,
        unitCost: Number(getValue(idxUnitCost, 0)) || 0,
        supplier: String(getValue(idxSupplier, 'Unknown')),
        lastRestocked: String(getValue(idxLastRestocked, new Date().toISOString().split('T')[0])),
        warehouse: String(getValue(idxWarehouse, 'Warehouse A')),
        icon: String(getValue(idxIcon, 'Package')),
      };

      products.push(product);
    }

    console.log("Parsed products count:", products.length);

    // Generate stats
    const stats = {
      totalProducts: products.length,
      lowStockItems: products.filter(p => p.currentStock > 0 && p.currentStock <= p.reorderPoint).length,
      outOfStockItems: products.filter(p => p.currentStock === 0).length,
      totalStockValue: products.reduce((acc, p) => acc + (p.currentStock * p.unitCost), 0),
      reorderNeeded: products.filter(p => p.currentStock <= p.reorderPoint).length,
    };

    // Generate alerts
    const alerts = products
      .filter(p => p.currentStock <= p.reorderPoint)
      .map((p, idx) => ({
        id: `a${idx + 1}`,
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        type: p.currentStock === 0 ? 'out_of_stock' : (p.currentStock < p.minStock ? 'low_stock' : 'reorder_needed'),
        currentStock: p.currentStock,
        reorderPoint: p.reorderPoint,
        timestamp: new Date().toISOString(),
      }));

    console.log("Generated alerts count:", alerts.length);

    return new Response(
      JSON.stringify({ products, stats, alerts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error("Error processing request:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
