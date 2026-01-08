import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Mail, Shield, User } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();

  return (
    <PageLayout
      title="Settings"
      description="Manage your account and preferences"
    >
      <div className="max-w-2xl space-y-6">
        {/* Profile Section */}
        <div className="glass-card rounded-xl border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Profile</h2>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={user?.username || ''} disabled className="bg-secondary border-border" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@stockpulse.com" className="bg-secondary border-border" />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="glass-card rounded-xl border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Low Stock Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when items fall below reorder point</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Out of Stock Alerts</p>
                <p className="text-sm text-muted-foreground">Immediate notification for zero stock items</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Order Updates</p>
                <p className="text-sm text-muted-foreground">Updates on purchase order status changes</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="glass-card rounded-xl border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Email Preferences</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Daily Summary</p>
                <p className="text-sm text-muted-foreground">Receive a daily inventory summary email</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Weekly Reports</p>
                <p className="text-sm text-muted-foreground">Automated weekly analytics report</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="glass-card rounded-xl border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Security</h2>
          </div>
          <div className="space-y-4">
            <Button variant="outline">Change Password</Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </PageLayout>
  );
}
