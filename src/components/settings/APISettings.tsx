
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Key, Globe, Zap, AlertCircle, Check, ExternalLink } from 'lucide-react';

const APISettings = () => {
  const [infuraKey, setInfuraKey] = useState('');
  const [alchemyKey, setAlchemyKey] = useState('');
  const [moralisKey, setMoralisKey] = useState('');
  const [autoFailover, setAutoFailover] = useState(true);

  return (
    <div className="space-y-6">
      {/* RPC Provider Settings */}
      <Card className="glass-strong p-4">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">RPC Providers</h3>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-medium">Provider Configuration</span>
            </div>
            <p className="text-sm text-gray-300">
              Configure your blockchain RPC providers for optimal performance and redundancy.
            </p>
          </div>
          
          {/* Infura */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/placeholder.svg" alt="Infura" className="w-6 h-6 rounded" />
                <div>
                  <Label className="text-white">Infura API Key</Label>
                  <p className="text-sm text-gray-400">Ethereum and IPFS gateway</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400">
                <Check className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Input 
                type="password"
                value={infuraKey}
                onChange={(e) => setInfuraKey(e.target.value)}
                placeholder="Enter Infura Project ID"
                className="glass"
              />
              <Button variant="outline" className="glass border-cyan-400/30 text-cyan-400">
                Test
              </Button>
            </div>
          </div>
          
          <Separator className="bg-white/10" />
          
          {/* Alchemy */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/placeholder.svg" alt="Alchemy" className="w-6 h-6 rounded" />
                <div>
                  <Label className="text-white">Alchemy API Key</Label>
                  <p className="text-sm text-gray-400">Enhanced blockchain APIs</p>
                </div>
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-400">
                <AlertCircle className="w-3 h-3 mr-1" />
                Not Set
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Input 
                type="password"
                value={alchemyKey}
                onChange={(e) => setAlchemyKey(e.target.value)}
                placeholder="Enter Alchemy API Key"
                className="glass"
              />
              <Button variant="outline" className="glass border-cyan-400/30 text-cyan-400">
                Test
              </Button>
            </div>
          </div>
          
          <Separator className="bg-white/10" />
          
          {/* Moralis */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/placeholder.svg" alt="Moralis" className="w-6 h-6 rounded" />
                <div>
                  <Label className="text-white">Moralis API Key</Label>
                  <p className="text-sm text-gray-400">Web3 development platform</p>
                </div>
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-400">
                <AlertCircle className="w-3 h-3 mr-1" />
                Not Set
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Input 
                type="password"
                value={moralisKey}
                onChange={(e) => setMoralisKey(e.target.value)}
                placeholder="Enter Moralis API Key"
                className="glass"
              />
              <Button variant="outline" className="glass border-cyan-400/30 text-cyan-400">
                Test
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Provider Management */}
      <Card className="glass-strong p-4">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Provider Management</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Auto Failover</Label>
              <p className="text-sm text-gray-400">Automatically switch providers on failure</p>
            </div>
            <Switch checked={autoFailover} onCheckedChange={setAutoFailover} />
          </div>
          
          <div className="space-y-3">
            <h4 className="text-white font-medium">Provider Priority</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white">Infura (Primary)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                  <Button variant="outline" size="sm" className="glass">
                    Configure
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-white">Alchemy (Backup)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-500/20 text-gray-400">Standby</Badge>
                  <Button variant="outline" size="sm" className="glass">
                    Configure
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-white">Moralis (Tertiary)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-500/20 text-gray-400">Standby</Badge>
                  <Button variant="outline" size="sm" className="glass">
                    Configure
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Usage Statistics */}
      <Card className="glass-strong p-4">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">API Usage Statistics</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 glass rounded-lg">
              <div className="text-2xl font-bold text-cyan-400">1,247</div>
              <div className="text-sm text-gray-400">Requests Today</div>
            </div>
            <div className="text-center p-3 glass rounded-lg">
              <div className="text-2xl font-bold text-purple-400">98.5%</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
            <div className="text-center p-3 glass rounded-lg">
              <div className="text-2xl font-bold text-green-400">145ms</div>
              <div className="text-sm text-gray-400">Avg Response</div>
            </div>
            <div className="text-center p-3 glass rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">3</div>
              <div className="text-sm text-gray-400">Rate Limits Hit</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="glass border-cyan-400/30 text-cyan-400 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              View Full Analytics
            </Button>
            <Button variant="outline" className="glass border-purple-400/30 text-purple-400">
              Export Usage Data
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default APISettings;
