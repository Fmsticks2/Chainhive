
export interface Alert {
  id: string;
  type: 'price' | 'wallet' | 'transaction' | 'system';
  title: string;
  message: string;
  threshold?: number;
  currentValue?: number;
  walletAddress?: string;
  tokenSymbol?: string;
  chain?: string;
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

export interface AlertConfig {
  type: Alert['type'];
  title: string;
  walletAddress?: string;
  tokenSymbol?: string;
  chain?: string;
  priceThreshold?: number;
  percentageChange?: number;
  volumeThreshold?: number;
}

export class AlertService {
  private static instance: AlertService;
  private alerts: Alert[] = [];
  private subscribers: ((alerts: Alert[]) => void)[] = [];
  private webhookUrl = '';

  static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  constructor() {
    this.initializeMockAlerts();
    this.startMonitoring();
  }

  private initializeMockAlerts() {
    this.alerts = [
      {
        id: '1',
        type: 'price',
        title: 'ETH Price Alert',
        message: 'ETH has reached your target price of $2,500',
        threshold: 2500,
        currentValue: 2545.67,
        tokenSymbol: 'ETH',
        isActive: true,
        createdAt: new Date(Date.now() - 3600000),
        triggeredAt: new Date()
      },
      {
        id: '2',
        type: 'wallet',
        title: 'Large Wallet Movement',
        message: 'Wallet 0x1234...5678 moved 1000 ETH',
        walletAddress: '0x1234567890123456789012345678901234567890',
        chain: 'ethereum',
        isActive: true,
        createdAt: new Date(Date.now() - 1800000),
        triggeredAt: new Date(Date.now() - 300000)
      }
    ];
  }

  private startMonitoring() {
    // Simulate real-time monitoring
    setInterval(() => {
      this.checkPriceAlerts();
      this.checkWalletMovements();
    }, 30000); // Check every 30 seconds
  }

  private async checkPriceAlerts() {
    // Simulate price alert checking
    const randomTrigger = Math.random() < 0.1; // 10% chance to trigger
    if (randomTrigger) {
      const newAlert: Alert = {
        id: Date.now().toString(),
        type: 'price',
        title: 'Price Movement Alert',
        message: `LINK has moved ${(Math.random() * 10).toFixed(1)}% in the last hour`,
        tokenSymbol: 'LINK',
        isActive: true,
        createdAt: new Date(),
        triggeredAt: new Date()
      };
      this.alerts.unshift(newAlert);
      this.notifySubscribers();
    }
  }

  private async checkWalletMovements() {
    // Simulate wallet movement detection
    const randomTrigger = Math.random() < 0.05; // 5% chance to trigger
    if (randomTrigger) {
      const newAlert: Alert = {
        id: Date.now().toString(),
        type: 'wallet',
        title: 'Whale Movement Detected',
        message: `Large transaction detected on ${['Ethereum', 'Polygon', 'BSC'][Math.floor(Math.random() * 3)]}`,
        chain: ['ethereum', 'polygon', 'bsc'][Math.floor(Math.random() * 3)],
        isActive: true,
        createdAt: new Date(),
        triggeredAt: new Date()
      };
      this.alerts.unshift(newAlert);
      this.notifySubscribers();
    }
  }

  createAlert(config: AlertConfig): Alert {
    const alert: Alert = {
      id: Date.now().toString(),
      type: config.type,
      title: config.title,
      message: `Alert created for ${config.title}`,
      threshold: config.priceThreshold,
      walletAddress: config.walletAddress,
      tokenSymbol: config.tokenSymbol,
      chain: config.chain,
      isActive: true,
      createdAt: new Date()
    };

    this.alerts.unshift(alert);
    this.notifySubscribers();
    return alert;
  }

  getAlerts(): Alert[] {
    return this.alerts;
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => alert.isActive);
  }

  deleteAlert(alertId: string): void {
    this.alerts = this.alerts.filter(alert => alert.id !== alertId);
    this.notifySubscribers();
  }

  toggleAlert(alertId: string): void {
    const alert = this.alerts.find(alert => alert.id === alertId);
    if (alert) {
      alert.isActive = !alert.isActive;
      this.notifySubscribers();
    }
  }

  subscribe(callback: (alerts: Alert[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.alerts));
  }

  setWebhookUrl(url: string): void {
    this.webhookUrl = url;
  }

  private async sendWebhook(alert: Alert): Promise<void> {
    if (!this.webhookUrl) return;

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'alert',
          alert: alert,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Failed to send webhook:', error);
    }
  }
}
