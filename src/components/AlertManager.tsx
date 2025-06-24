
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertConfig, AlertService } from '@/services/alertService';
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, TrendingUp, Wallet, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AlertManager = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState<Partial<AlertConfig>>({
    type: 'price'
  });
  const { toast } = useToast();
  const alertService = AlertService.getInstance();

  useEffect(() => {
    const unsubscribe = alertService.subscribe(setAlerts);
    setAlerts(alertService.getAlerts());
    
    return unsubscribe;
  }, []);

  const handleCreateAlert = () => {
    if (!newAlert.title || !newAlert.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    alertService.createAlert(newAlert as AlertConfig);
    setNewAlert({ type: 'price' });
    setShowCreateForm(false);
    toast({
      title: "Alert Created",
      description: "Your alert has been created successfully",
    });
  };

  const handleDeleteAlert = (alertId: string) => {
    alertService.deleteAlert(alertId);
    toast({
      title: "Alert Deleted",
      description: "Alert has been removed",
    });
  };

  const handleToggleAlert = (alertId: string) => {
    alertService.toggleAlert(alertId);
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'price': return <TrendingUp className="w-4 h-4" />;
      case 'wallet': return <Wallet className="w-4 h-4" />;
      case 'transaction': return <Activity className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getAlertsByType = (type: Alert['type']) => {
    return alerts.filter(alert => alert.type === type);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Alert Management</h2>
            <p className="text-gray-400">Manage your price alerts and wallet monitoring</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="gradient-primary"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Alert
          </Button>
        </div>

        {/* Create Alert Form */}
        {showCreateForm && (
          <div className="mt-6 p-4 glass rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Alert</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Alert Type</label>
                <Select
                  value={newAlert.type}
                  onValueChange={(value) => setNewAlert({ ...newAlert, type: value as Alert['type'] })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price Alert</SelectItem>
                    <SelectItem value="wallet">Wallet Movement</SelectItem>
                    <SelectItem value="transaction">Transaction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <Input
                  value={newAlert.title || ''}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  placeholder="Alert title"
                  className="bg-gray-800 border-gray-600"
                />
              </div>
              {newAlert.type === 'price' && (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Token Symbol</label>
                    <Input
                      value={newAlert.tokenSymbol || ''}
                      onChange={(e) => setNewAlert({ ...newAlert, tokenSymbol: e.target.value })}
                      placeholder="ETH, BTC, etc."
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Price Threshold</label>
                    <Input
                      type="number"
                      value={newAlert.priceThreshold || ''}
                      onChange={(e) => setNewAlert({ ...newAlert, priceThreshold: Number(e.target.value) })}
                      placeholder="Target price"
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                </>
              )}
              {newAlert.type === 'wallet' && (
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-2">Wallet Address</label>
                  <Input
                    value={newAlert.walletAddress || ''}
                    onChange={(e) => setNewAlert({ ...newAlert, walletAddress: e.target.value })}
                    placeholder="0x... or wallet address"
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreateAlert} className="gradient-primary">
                Create Alert
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Alert Tabs */}
      <Card className="glass p-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 glass">
            <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
            <TabsTrigger value="price">Price ({getAlertsByType('price').length})</TabsTrigger>
            <TabsTrigger value="wallet">Wallet ({getAlertsByType('wallet').length})</TabsTrigger>
            <TabsTrigger value="active">Active ({alerts.filter(a => a.isActive).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <AlertList 
              alerts={alerts} 
              onToggle={handleToggleAlert} 
              onDelete={handleDeleteAlert}
              getAlertIcon={getAlertIcon}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="price" className="mt-6">
            <AlertList 
              alerts={getAlertsByType('price')} 
              onToggle={handleToggleAlert} 
              onDelete={handleDeleteAlert}
              getAlertIcon={getAlertIcon}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="wallet" className="mt-6">
            <AlertList 
              alerts={getAlertsByType('wallet')} 
              onToggle={handleToggleAlert} 
              onDelete={handleDeleteAlert}
              getAlertIcon={getAlertIcon}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <AlertList 
              alerts={alerts.filter(a => a.isActive)} 
              onToggle={handleToggleAlert} 
              onDelete={handleDeleteAlert}
              getAlertIcon={getAlertIcon}
              formatDate={formatDate}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

interface AlertListProps {
  alerts: Alert[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  getAlertIcon: (type: Alert['type']) => React.ReactNode;
  formatDate: (date: Date) => string;
}

const AlertList: React.FC<AlertListProps> = ({ alerts, onToggle, onDelete, getAlertIcon, formatDate }) => {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No alerts found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className="glass p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className={`p-2 rounded-lg ${
                alert.type === 'price' ? 'bg-green-500/20' :
                alert.type === 'wallet' ? 'bg-blue-500/20' : 'bg-purple-500/20'
              }`}>
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-white">{alert.title}</h4>
                  <Badge variant={alert.isActive ? "default" : "secondary"} className="text-xs">
                    {alert.isActive ? 'Active' : 'Paused'}
                  </Badge>
                  {alert.triggeredAt && (
                    <Badge variant="destructive" className="text-xs">
                      Triggered
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-400">{alert.message}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Created: {formatDate(alert.createdAt)}</span>
                  {alert.triggeredAt && (
                    <span>Triggered: {formatDate(alert.triggeredAt)}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle(alert.id)}
                className="text-cyan-400 hover:text-cyan-300"
              >
                {alert.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(alert.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertManager;
