import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  Link,
  Coins, 
  Bell, 
  Trophy, 
  Crown,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Web3Service, UserProfile, PortfolioSnapshot, Alert } from '@/services/web3Service';
import { useToast } from '@/hooks/use-toast';

const Web3Integration: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioSnapshot[]>([]);
  const [userAlerts, setUserAlerts] = useState<Alert[]>([]);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [rewardBalance, setRewardBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [profileHash, setProfileHash] = useState('');
  const [alertConditions, setAlertConditions] = useState('');
  const [alertType, setAlertType] = useState<number>(1);
  
  const { toast } = useToast();
  const web3Service = Web3Service.getInstance();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      if (web3Service.isConnected()) {
        const address = await web3Service.getCurrentAddress();
        if (address) {
          setIsConnected(true);
          setCurrentAddress(address);
          await loadUserData(address);
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      const address = await web3Service.connectWallet();
      if (address) {
        setIsConnected(true);
        setCurrentAddress(address);
        await loadUserData(address);
        toast({
          title: "Wallet Connected",
          description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async (address: string) => {
    try {
      // Load user profile
      const profile = await web3Service.getUserProfile(address);
      setUserProfile(profile);
      
      // Load portfolio history
      if (profile?.isActive) {
        const history = await web3Service.getPortfolioHistory(address);
        setPortfolioHistory(history);
        
        // Load alerts
        const alerts = await web3Service.getUserAlerts(address);
        setUserAlerts(alerts);
      }
      
      // Load token and reward balances
      const tokenBal = await web3Service.getTokenBalance(address);
      const rewardBal = await web3Service.getRewardBalance(address);
      setTokenBalance(tokenBal);
      setRewardBalance(rewardBal);
      
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const registerUser = async () => {
    if (!profileHash) {
      toast({
        title: "Missing Information",
        description: "Please enter a profile hash",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const txHash = await web3Service.registerUser(profileHash);
      toast({
        title: "Registration Successful",
        description: `Transaction: ${txHash.slice(0, 6)}...${txHash.slice(-4)}`,
      });
      
      // Reload user data
      if (currentAddress) {
        await loadUserData(currentAddress);
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAlert = async () => {
    if (!alertConditions) {
      toast({
        title: "Missing Information",
        description: "Please enter alert conditions",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await web3Service.createAlert(alertType, alertConditions);
      toast({
        title: "Alert Created",
        description: `Alert ID: ${result.alertId}`,
      });
      
      // Reload alerts
      if (currentAddress) {
        const alerts = await web3Service.getUserAlerts(currentAddress);
        setUserAlerts(alerts);
      }
      setAlertConditions('');
    } catch (error: any) {
      toast({
        title: "Alert Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const claimRewards = async () => {
    try {
      setIsLoading(true);
      const txHash = await web3Service.claimRewards();
      toast({
        title: "Rewards Claimed",
        description: `Transaction: ${txHash.slice(0, 6)}...${txHash.slice(-4)}`,
      });
      
      // Reload balances
      if (currentAddress) {
        const rewardBal = await web3Service.getRewardBalance(currentAddress);
        setRewardBalance(rewardBal);
      }
    } catch (error: any) {
      toast({
        title: "Claim Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseSubscription = async (tier: number) => {
    try {
      setIsLoading(true);
      const txHash = await web3Service.purchaseSubscription(tier);
      toast({
        title: "Subscription Purchased",
        description: `Transaction: ${txHash.slice(0, 6)}...${txHash.slice(-4)}`,
      });
      
      // Reload user profile
      if (currentAddress) {
        await loadUserData(currentAddress);
      }
    } catch (error: any) {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getSubscriptionTierName = (tier: number) => {
    switch (tier) {
      case 0: return 'Free';
      case 1: return 'Pro';
      case 2: return 'Enterprise';
      default: return 'Unknown';
    }
  };

  const getAlertTypeName = (type: number) => {
    switch (type) {
      case 1: return 'Price Alert';
      case 2: return 'Portfolio Alert';
      case 3: return 'Transaction Alert';
      case 4: return 'DeFi Alert';
      default: return 'Unknown';
    }
  };

  if (!isConnected) {
    return (
      <Card className="glass-strong p-8 text-center max-w-md mx-auto">
        <Wallet className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground mb-6">
          Connect your Web3 wallet to access ChainHive smart contract features
        </p>
        <Button
          onClick={connectWallet}
          disabled={isLoading}
          variant="gradient"
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Wallet className="w-5 h-5 mr-2" />
          )}
          Connect Wallet
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Status */}
      <Card className="glass-strong p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Web3 Dashboard</h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/50 text-primary">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
            <Badge variant="secondary">
              {web3Service.getCurrentChain()?.name || 'Unknown Network'}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg glass-subtle">
            <p className="text-muted-foreground text-sm">Wallet Address</p>
            <p className="font-mono text-sm text-foreground">
              {currentAddress?.slice(0, 6)}...{currentAddress?.slice(-4)}
            </p>
          </div>
          <div className="text-center p-4 rounded-lg glass-subtle">
            <p className="text-muted-foreground text-sm">HIVE Balance</p>
            <p className="text-xl font-bold text-primary">{tokenBalance.toFixed(2)}</p>
          </div>
          <div className="text-center p-4 rounded-lg glass-subtle">
            <p className="text-muted-foreground text-sm">Pending Rewards</p>
            <p className="text-xl font-bold text-accent">{rewardBalance.toFixed(2)}</p>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass-strong">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">User Profile</h3>
            
            {userProfile?.isActive ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Subscription Tier</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Crown className="w-4 h-4 text-accent" />
                      <span className="font-medium">{getSubscriptionTierName(userProfile.subscriptionTier)}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Analyses</Label>
                    <p className="font-medium mt-1">{userProfile.totalAnalyses}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Registration Date</Label>
                    <p className="font-medium mt-1">{formatDate(userProfile.registrationTime)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Rewards Earned</Label>
                    <p className="font-medium mt-1">{userProfile.rewardsEarned.toFixed(2)} HIVE</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <Button
                    onClick={() => purchaseSubscription(1)}
                    disabled={isLoading || userProfile.subscriptionTier >= 1}
                    variant="gradient"
                  >
                    Upgrade to Pro (50 HIVE)
                  </Button>
                  <Button
                    onClick={() => purchaseSubscription(2)}
                    disabled={isLoading || userProfile.subscriptionTier >= 2}
                    variant="gradient"
                  >
                    Upgrade to Enterprise (200 HIVE)
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Register your wallet to start using ChainHive smart contract features.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="profileHash">Profile Hash (IPFS)</Label>
                  <Input
                    id="profileHash"
                    value={profileHash}
                    onChange={(e) => setProfileHash(e.target.value)}
                    placeholder="Enter IPFS hash of your profile data"
                    className="glass"
                  />
                </div>
                <Button onClick={registerUser} disabled={isLoading} variant="gradient">
                  {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Register User
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Portfolio History</h3>
            
            {portfolioHistory.length > 0 ? (
              <div className="space-y-3">
                {portfolioHistory.slice(-5).reverse().map((snapshot, index) => (
                  <div key={index} className="p-4 rounded-lg glass-subtle">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Total Value</Label>
                        <p className="font-medium">${snapshot.totalValue.toFixed(2)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Risk Score</Label>
                        <p className="font-medium">{snapshot.riskScore}/10</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Diversification</Label>
                        <p className="font-medium">{snapshot.diversificationScore}/10</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Date</Label>
                        <p className="font-medium">{formatDate(snapshot.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No portfolio data recorded on-chain yet.
              </p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Create Alert</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alertType">Alert Type</Label>
                  <select
                    id="alertType"
                    value={alertType}
                    onChange={(e) => setAlertType(Number(e.target.value))}
                    className="w-full p-2 rounded-lg glass border border-border"
                  >
                    <option value={1}>Price Alert</option>
                    <option value={2}>Portfolio Alert</option>
                    <option value={3}>Transaction Alert</option>
                    <option value={4}>DeFi Alert</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alertConditions">Conditions (JSON)</Label>
                  <Input
                    id="alertConditions"
                    value={alertConditions}
                    onChange={(e) => setAlertConditions(e.target.value)}
                    placeholder='{"token": "ETH", "threshold": 2500}'
                    className="glass"
                  />
                </div>
              </div>
              <Button onClick={createAlert} disabled={isLoading} variant="gradient">
                {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create Alert
              </Button>
            </div>
          </Card>

          <Card className="glass p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Your Alerts</h3>
            
            {userAlerts.length > 0 ? (
              <div className="space-y-3">
                {userAlerts.map((alert, index) => (
                  <div key={index} className="p-4 rounded-lg glass-subtle">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{getAlertTypeName(alert.alertType)}</p>
                        <p className="text-sm text-muted-foreground">{alert.conditions}</p>
                        <p className="text-xs text-muted-foreground">
                          Created: {formatDate(alert.createdAt)} | Triggered: {alert.triggeredCount} times
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {alert.isActive ? (
                          <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No alerts created yet.
              </p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Rewards & Tokens</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-center p-6 rounded-lg glass-subtle">
                  <Coins className="w-12 h-12 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-primary">{rewardBalance.toFixed(2)}</p>
                  <p className="text-muted-foreground">Pending Rewards</p>
                </div>
                
                <Button
                  onClick={claimRewards}
                  disabled={isLoading || rewardBalance === 0}
                  variant="gradient"
                  className="w-full"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Claim Rewards
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="text-center p-6 rounded-lg glass-subtle">
                  <Trophy className="w-12 h-12 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-accent">{tokenBalance.toFixed(2)}</p>
                  <p className="text-muted-foreground">HIVE Token Balance</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Earn 10 HIVE for each portfolio analysis
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Web3Integration;