
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, Smartphone, Volume2, AlertTriangle } from 'lucide-react';

const NotificationSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);

  return (
    <div className="space-y-6">
      {/* General Notification Settings */}
      <Card className="glass-strong p-4">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">General Notifications</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <Label className="text-white">Email Notifications</Label>
                <p className="text-sm text-gray-400">Receive updates via email</p>
              </div>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-gray-400" />
              <div>
                <Label className="text-white">Push Notifications</Label>
                <p className="text-sm text-gray-400">Browser push notifications</p>
              </div>
            </div>
            <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <div>
                <Label className="text-white">Sound Alerts</Label>
                <p className="text-sm text-gray-400">Play sounds for important notifications</p>
              </div>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
          </div>
        </div>
      </Card>

      {/* Price Alerts */}
      <Card className="glass-strong p-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Price Alerts</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Enable Price Alerts</Label>
              <p className="text-sm text-gray-400">Get notified when prices hit your targets</p>
            </div>
            <Switch checked={priceAlerts} onCheckedChange={setPriceAlerts} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white mb-2 block">Price Change Threshold (%)</Label>
              <Input 
                type="number" 
                defaultValue="5" 
                className="glass"
                placeholder="5"
              />
            </div>
            <div>
              <Label className="text-white mb-2 block">Check Interval (minutes)</Label>
              <Input 
                type="number" 
                defaultValue="15" 
                className="glass"
                placeholder="15"
              />
            </div>
          </div>
          
          <Button className="w-full gradient-primary text-white">
            Manage Price Alerts
          </Button>
        </div>
      </Card>

      {/* Transaction Alerts */}
      <Card className="glass-strong p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 rounded bg-gradient-secondary"></div>
          <h3 className="text-lg font-semibold text-white">Transaction Alerts</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Transaction Notifications</Label>
              <p className="text-sm text-gray-400">Alerts for wallet transactions</p>
            </div>
            <Switch checked={transactionAlerts} onCheckedChange={setTransactionAlerts} />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Incoming transactions</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Outgoing transactions</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Failed transactions</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Large transactions (&gt;$1000)</span>
              <Switch />
            </div>
          </div>
          
          <Separator className="bg-white/10" />
          
          <div>
            <Label className="text-white mb-2 block">Minimum Alert Amount ($)</Label>
            <Input 
              type="number" 
              defaultValue="100" 
              className="glass"
              placeholder="100"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationSettings;
