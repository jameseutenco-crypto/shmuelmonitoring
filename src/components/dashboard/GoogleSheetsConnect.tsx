import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, RefreshCw, Unlink, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoogleSheetsConnectProps {
  isConnected: boolean;
  sheetUrl: string;
  loading: boolean;
  error: string | null;
  onConnect: (url: string) => void;
  onDisconnect: () => void;
  onRefresh: () => void;
}

export const GoogleSheetsConnect: React.FC<GoogleSheetsConnectProps> = ({
  isConnected,
  sheetUrl,
  loading,
  error,
  onConnect,
  onDisconnect,
  onRefresh,
}) => {
  const [inputUrl, setInputUrl] = useState(sheetUrl);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onConnect(inputUrl.trim());
    }
  };

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Google Sheets Connection</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Connect to a public Google Sheet to sync your inventory data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Connected to Google Sheets</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                className="text-destructive hover:text-destructive"
              >
                <Unlink className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-3">
            <div className="space-y-2">
              <Input
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                disabled={loading}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Make sure your sheet is shared publicly (Anyone with link can view)
              </p>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !inputUrl.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Connect Sheet
                </>
              )}
            </Button>
          </form>
        )}

        {error && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isConnected && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Required columns in your sheet:</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
              <span>• id</span>
              <span>• sku</span>
              <span>• name</span>
              <span>• category</span>
              <span>• currentStock</span>
              <span>• minStock</span>
              <span>• maxStock</span>
              <span>• reorderPoint</span>
              <span>• unitCost</span>
              <span>• supplier</span>
              <span>• lastRestocked</span>
              <span>• warehouse</span>
              <span>• icon</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
