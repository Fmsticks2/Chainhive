
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Key, Smartphone, AlertCircle, Check, Eye, EyeOff } from 'lucide-react';

const SecuritySettings = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [autoLogout, setAutoLogout] = useState(true);
  const [showApiKeys, setShowApiKeys] = useState(false);

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <Card className="glass-strong p-4">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-gray-400" />
              <div>
                <Label className="text-white">2FA Protection</Label>
                <p className="text-sm text-gray-400">Add an extra layer of security</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {twoFactorEnabled && <Badge className="bg-green-500/20 text-green-400">Enabled</Badge>}
              <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
            </div>
          </div>
          
          {!twoFactorEnabled && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Recommended</span>
              </div>
              <p className="text-sm text-gray-300">
                Enable 2FA to secure your account with time-based codes from your authenticator app.
              </p>
              <Button className="mt-3 gradient-primary text-white">
                Setup 2FA
              </Button>
            </div>
          )}
          
          {twoFactorEnabled && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium">Two-Factor Authentication Active</span>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                Your account is protected with 2FA. You can manage backup codes below.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="glass border-green-400/30 text-green-400">
                  View Backup Codes
                </Button>
                <Button variant="outline" size="sm" className="glass border-red-400/30 text-red-400">
                  Disable 2FA
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Session Management */}
      <Card className="glass-strong p-4">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Session Management</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Auto-logout</Label>
              <p className="text-sm text-gray-400">Automatically sign out after inactivity</p>
            </div>
            <Switch checked={autoLogout} onCheckedChange={setAutoLogout} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Session Timeout</Label>
              <p className="text-sm text-gray-400">Minutes of inactivity before logout</p>
            </div>
            <Input 
              type="number" 
              defaultValue="30" 
              className="w-20 glass text-center"
              min="5"
              max="120"
            />
          </div>
          
          <Separator className="bg-white/10" />
          
          <div className="space-y-3">
            <h4 className="text-white font-medium">Active Sessions</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <div>
                  <p className="text-white text-sm">Current Session</p>
                  <p className="text-gray-400 text-xs">Chrome on Windows • Last active: Now</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400">Current</Badge>
              </div>
              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <div>
                  <p className="text-white text-sm">Mobile Session</p>
                  <p className="text-gray-400 text-xs">Safari on iOS • Last active: 2 hours ago</p>
                </div>
                <Button variant="outline" size="sm" className="glass border-red-400/30 text-red-400">
                  Revoke
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* API Key Management */}
      <Card className="glass-strong p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 rounded bg-gradient-secondary"></div>
          <h3 className="text-lg font-semibold text-white">API Access</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Personal API Key</Label>
              <p className="text-sm text-gray-400">For accessing your data programmatically</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="glass border-cyan-400/30 text-cyan-400"
              onClick={() => setShowApiKeys(!showApiKeys)}
            >
              {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showApiKeys ? 'Hide' : 'Show'}
            </Button>
          </div>
          
          <div className="p-3 glass rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">API Key</span>
              <Badge className="bg-blue-500/20 text-blue-400">Active</Badge>
            </div>
            <div className="font-mono text-sm text-white bg-black/20 p-2 rounded">
              {showApiKeys ? 'sk_live_1234567890abcdef...' : '••••••••••••••••••••••••'}
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" className="glass border-cyan-400/30 text-cyan-400">
                Copy Key
              </Button>
              <Button variant="outline" size="sm" className="glass border-yellow-400/30 text-yellow-400">
                Regenerate
              </Button>
              <Button variant="outline" size="sm" className="glass border-red-400/30 text-red-400">
                Revoke
              </Button>
            </div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-blue-400 font-medium mb-2">API Usage This Month</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Requests:</span>
                <span className="text-white ml-2">1,247 / 10,000</span>
              </div>
              <div>
                <span className="text-gray-400">Rate Limit:</span>
                <span className="text-white ml-2">100/min</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SecuritySettings;
