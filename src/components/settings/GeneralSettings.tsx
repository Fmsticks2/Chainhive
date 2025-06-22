
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun, Globe, Palette } from 'lucide-react';

const GeneralSettings = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [autoRefresh, setAutoRefresh] = useState(true);

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card className="glass-strong p-4">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Appearance</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-4 h-4 text-gray-400" /> : <Sun className="w-4 h-4 text-gray-400" />}
              <div>
                <Label className="text-white">Dark Mode</Label>
                <p className="text-sm text-gray-400">Switch between light and dark themes</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Interface Density</Label>
              <p className="text-sm text-gray-400">Adjust spacing and component sizes</p>
            </div>
            <Select defaultValue="comfortable">
              <SelectTrigger className="w-40 glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong border-white/20">
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Localization */}
      <Card className="glass-strong p-4">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Localization</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Language</Label>
              <p className="text-sm text-gray-400">Choose your preferred language</p>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40 glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong border-white/20">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Currency</Label>
              <p className="text-sm text-gray-400">Default currency for price displays</p>
            </div>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-40 glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong border-white/20">
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
                <SelectItem value="BTC">BTC (₿)</SelectItem>
                <SelectItem value="ETH">ETH (Ξ)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Data & Performance */}
      <Card className="glass-strong p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 rounded bg-gradient-primary"></div>
          <h3 className="text-lg font-semibold text-white">Data & Performance</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Auto-refresh Data</Label>
              <p className="text-sm text-gray-400">Automatically update blockchain data</p>
            </div>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Refresh Interval</Label>
              <p className="text-sm text-gray-400">How often to update data (seconds)</p>
            </div>
            <Input 
              type="number" 
              defaultValue="30" 
              className="w-20 glass text-center"
              min="5"
              max="300"
            />
          </div>
          
          <Separator className="bg-white/10" />
          
          <div className="flex gap-3">
            <Button variant="outline" className="glass border-cyan-400/30 hover:border-cyan-400/60 text-cyan-400">
              Clear Cache
            </Button>
            <Button variant="outline" className="glass border-red-400/30 hover:border-red-400/60 text-red-400">
              Reset Settings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GeneralSettings;
