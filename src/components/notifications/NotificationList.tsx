
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

interface NotificationListProps {
  type: 'all' | 'transactions' | 'price-alerts' | 'system';
  filter: string;
}

const NotificationList = ({ type, filter }: NotificationListProps) => {
  // Mock notification data
  const notifications = [
    {
      id: 1,
      type: 'transaction',
      title: 'Transaction Confirmed',
      message: 'Your ETH transfer of 0.5 ETH has been confirmed',
      timestamp: '2 minutes ago',
      read: false,
      icon: ArrowUpRight,
      iconColor: 'text-green-400',
      amount: '-0.5 ETH',
      hash: '0x1234...5678'
    },
    {
      id: 2,
      type: 'price-alert',
      title: 'Price Alert Triggered',
      message: 'Ethereum (ETH) has reached your target price of $2,300',
      timestamp: '15 minutes ago',
      read: false,
      icon: TrendingUp,
      iconColor: 'text-cyan-400',
      price: '$2,345.67',
      change: '+5.2%'
    },
    {
      id: 3,
      type: 'transaction',
      title: 'Incoming Transaction',
      message: 'Received 100 USDC from 0x789a...bcde',
      timestamp: '1 hour ago',
      read: true,
      icon: ArrowDownLeft,
      iconColor: 'text-blue-400',
      amount: '+100 USDC',
      hash: '0x9876...5432'
    },
    {
      id: 4,
      type: 'price-alert',
      title: 'Price Drop Alert',
      message: 'Bitcoin (BTC) has dropped below $42,000',
      timestamp: '2 hours ago',
      read: true,
      icon: TrendingDown,
      iconColor: 'text-red-400',
      price: '$41,850.00',
      change: '-3.1%'
    },
    {
      id: 5,
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance completed successfully',
      timestamp: '3 hours ago',
      read: true,
      icon: CheckCircle,
      iconColor: 'text-green-400'
    },
    {
      id: 6,
      type: 'system',
      title: 'API Rate Limit Warning',
      message: 'You are approaching your API rate limit (85% used)',
      timestamp: '4 hours ago',
      read: false,
      icon: AlertTriangle,
      iconColor: 'text-yellow-400'
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (type !== 'all' && notification.type !== type) return false;
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    return true;
  });

  if (filteredNotifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-400 mb-2">No notifications found</h3>
        <p className="text-gray-500">Check back later for updates</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredNotifications.map((notification, index) => (
        <div key={notification.id}>
          <Card className={`glass-strong p-4 transition-all hover:glass ${
            !notification.read ? 'border-l-4 border-l-cyan-400' : ''
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg glass ${notification.iconColor}`}>
                <notification.icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-white font-medium">{notification.title}</h4>
                    <p className="text-gray-300 text-sm mt-1">{notification.message}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!notification.read && (
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    )}
                    <span className="text-gray-400 text-xs whitespace-nowrap">
                      {notification.timestamp}
                    </span>
                  </div>
                </div>
                
                {/* Transaction specific details */}
                {notification.type === 'transaction' && (
                  <div className="flex items-center gap-4 mt-3">
                    <Badge className={`${
                      notification.amount?.startsWith('+') 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {notification.amount}
                    </Badge>
                    {notification.hash && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">Hash:</span>
                        <code className="text-xs text-cyan-400 font-mono">{notification.hash}</code>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Price alert specific details */}
                {notification.type === 'price-alert' && (
                  <div className="flex items-center gap-4 mt-3">
                    <Badge className="bg-cyan-500/20 text-cyan-400">
                      {notification.price}
                    </Badge>
                    <Badge className={`${
                      notification.change?.startsWith('+') 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {notification.change}
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-400 text-xs">{notification.timestamp}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                        Mark as read
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {index < filteredNotifications.length - 1 && (
            <Separator className="bg-white/5" />
          )}
        </div>
      ))}
      
      {filteredNotifications.length > 10 && (
        <div className="text-center py-4">
          <Button variant="outline" className="glass border-cyan-400/30 text-cyan-400">
            Load More Notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
