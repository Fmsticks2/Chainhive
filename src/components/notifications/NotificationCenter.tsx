
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationList from './NotificationList';
import NotificationFilters from './NotificationFilters';
import { Bell, CheckCheck, Settings, Filter, Home, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleMarkAllRead = () => {
    toast({
      title: "Notifications Marked as Read",
      description: "All notifications have been marked as read.",
    });
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card className="glass p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="glass border-cyan-400/30 text-cyan-400">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Home
              </Button>
            </Link>
            <h2 className="text-xl font-semibold text-white">Notification Center</h2>
            <Badge className="bg-cyan-500/20 text-cyan-400">
              12 unread
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="glass border-purple-400/30 text-purple-400"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-1" />
              Filters
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="glass border-green-400/30 text-green-400"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark All Read
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="glass border-cyan-400/30 text-cyan-400"
              onClick={handleSettingsClick}
            >
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-4">
            <NotificationFilters filter={filter} onFilterChange={setFilter} />
          </div>
        )}
      </Card>

      {/* Notification Tabs */}
      <Card className="glass p-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 glass">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-primary"></div>
              Transactions
            </TabsTrigger>
            <TabsTrigger value="price-alerts" className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-secondary"></div>
              Price Alerts
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              System
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <NotificationList type="all" filter={filter} />
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-6">
            <NotificationList type="transactions" filter={filter} />
          </TabsContent>
          
          <TabsContent value="price-alerts" className="mt-6">
            <NotificationList type="price-alerts" filter={filter} />
          </TabsContent>
          
          <TabsContent value="system" className="mt-6">
            <NotificationList type="system" filter={filter} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default NotificationCenter;
