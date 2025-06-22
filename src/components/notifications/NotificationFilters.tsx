
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Search, Filter, X } from 'lucide-react';

interface NotificationFiltersProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

const NotificationFilters = ({ filter, onFilterChange }: NotificationFiltersProps) => {
  return (
    <div className="glass-strong p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Filters</h3>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label className="text-gray-300 text-sm">Status</Label>
          <Select value={filter} onValueChange={onFilterChange}>
            <SelectTrigger className="glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-strong border-white/20">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Type Filter */}
        <div className="space-y-2">
          <Label className="text-gray-300 text-sm">Type</Label>
          <Select defaultValue="all">
            <SelectTrigger className="glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-strong border-white/20">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="transactions">Transactions</SelectItem>
              <SelectItem value="price-alerts">Price Alerts</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="security">Security</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Time Range */}
        <div className="space-y-2">
          <Label className="text-gray-300 text-sm">Time Range</Label>
          <Select defaultValue="all">
            <SelectTrigger className="glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-strong border-white/20">
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Search */}
        <div className="space-y-2">
          <Label className="text-gray-300 text-sm">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search notifications..."
              className="glass pl-10"
            />
          </div>
        </div>
      </div>
      
      {/* Quick Filters */}
      <div className="space-y-2">
        <Label className="text-gray-300 text-sm">Quick Filters</Label>
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-cyan-500/20 hover:border-cyan-400/60 hover:text-cyan-400"
          >
            High Priority
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-green-500/20 hover:border-green-400/60 hover:text-green-400"
          >
            Completed Transactions
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-red-500/20 hover:border-red-400/60 hover:text-red-400"
          >
            Failed Transactions
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-purple-500/20 hover:border-purple-400/60 hover:text-purple-400"
          >
            Price Targets Hit
          </Badge>
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-yellow-500/20 hover:border-yellow-400/60 hover:text-yellow-400"
          >
            Wallet Activity
          </Badge>
        </div>
      </div>
      
      <div className="flex justify-between pt-2">
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          Clear All Filters
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="glass border-gray-400/30 text-gray-400">
            Cancel
          </Button>
          <Button size="sm" className="gradient-primary text-white">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationFilters;
