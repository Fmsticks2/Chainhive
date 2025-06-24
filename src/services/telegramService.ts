
export interface TelegramUser {
  id: number;
  username: string;
  first_name: string;
  last_name?: string;
  wallets: string[];
  alerts: string[];
  preferences: {
    notifications: boolean;
    language: string;
    timezone: string;
  };
}

export interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  text: string;
  date: number;
}

export interface BotCommand {
  command: string;
  description: string;
  handler: (message: TelegramMessage) => Promise<string>;
}

export class TelegramService {
  private static instance: TelegramService;
  private botToken: string = '';
  private webhookUrl: string = '';
  private users: Map<number, TelegramUser> = new Map();
  private commands: Map<string, BotCommand> = new Map();

  static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  constructor() {
    this.initializeCommands();
  }

  setBotToken(token: string): void {
    this.botToken = token;
  }

  setWebhookUrl(url: string): void {
    this.webhookUrl = url;
  }

  private initializeCommands(): void {
    this.commands.set('/start', {
      command: '/start',
      description: 'Start using the Portfolio Bot',
      handler: this.handleStart
    });

    this.commands.set('/portfolio', {
      command: '/portfolio',
      description: 'View your portfolio summary',
      handler: this.handlePortfolio
    });

    this.commands.set('/analyze', {
      command: '/analyze',
      description: 'Analyze a wallet address',
      handler: this.handleAnalyze
    });

    this.commands.set('/alerts', {
      command: '/alerts',
      description: 'Manage your alerts',
      handler: this.handleAlerts
    });

    this.commands.set('/price', {
      command: '/price',
      description: 'Get token price information',
      handler: this.handlePrice
    });

    this.commands.set('/help', {
      command: '/help',
      description: 'Show available commands',
      handler: this.handleHelp
    });
  }

  async sendMessage(chatId: number, text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
    if (!this.botToken) {
      console.error('Bot token not set');
      return false;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: parseMode,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  async processWebhook(update: any): Promise<void> {
    if (update.message) {
      const message: TelegramMessage = update.message;
      await this.handleMessage(message);
    }
  }

  private async handleMessage(message: TelegramMessage): Promise<void> {
    const text = message.text.trim();
    const chatId = message.from.id;

    // Register user if new
    if (!this.users.has(chatId)) {
      this.users.set(chatId, {
        id: chatId,
        username: message.from.username,
        first_name: message.from.first_name,
        last_name: message.from.last_name,
        wallets: [],
        alerts: [],
        preferences: {
          notifications: true,
          language: 'en',
          timezone: 'UTC'
        }
      });
    }

    // Parse command
    const commandMatch = text.match(/^\/(\w+)(@\w+)?\s*(.*)/);
    if (commandMatch) {
      const commandName = `/${commandMatch[1]}`;
      const args = commandMatch[3];
      
      const command = this.commands.get(commandName);
      if (command) {
        try {
          const response = await command.handler({ ...message, text: args });
          await this.sendMessage(chatId, response);
        } catch (error) {
          await this.sendMessage(chatId, 'Sorry, I encountered an error processing your request.');
        }
      } else {
        await this.sendMessage(chatId, 'Unknown command. Type /help for available commands.');
      }
    } else {
      // Handle non-command messages (natural language)
      await this.handleNaturalLanguage(message);
    }
  }

  private handleStart = async (message: TelegramMessage): Promise<string> => {
    return `
🚀 <b>Welcome to Portfolio Bot!</b>

I'm your Web3 portfolio assistant. I can help you:

💼 Analyze wallet portfolios across multiple chains
📊 Track token prices and market data
🔔 Set up price and wallet alerts
📈 Get AI-powered portfolio insights

<b>Quick Commands:</b>
/portfolio - View your saved wallets
/analyze [wallet] - Analyze any wallet
/price [token] - Get token price
/alerts - Manage your alerts
/help - Show all commands

Try: <code>/analyze 0x...</code> with any wallet address!
    `;
  };

  private handlePortfolio = async (message: TelegramMessage): Promise<string> => {
    const user = this.users.get(message.from.id);
    if (!user || user.wallets.length === 0) {
      return '📝 You have no saved wallets. Use /analyze [wallet_address] to add one!';
    }

    let response = '💼 <b>Your Portfolio Summary:</b>\n\n';
    for (const wallet of user.wallets) {
      // Mock portfolio data - integrate with actual service
      response += `🔍 <code>${wallet.slice(0, 10)}...${wallet.slice(-6)}</code>\n`;
      response += `💰 Total Value: $12,450.67\n`;
      response += `📈 24h Change: +5.2%\n\n`;
    }

    return response;
  };

  private handleAnalyze = async (message: TelegramMessage): Promise<string> => {
    const walletAddress = message.text.trim();
    
    if (!walletAddress) {
      return '❌ Please provide a wallet address.\nExample: <code>/analyze 0x1234...5678</code>';
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress) && !/^r[a-zA-Z0-9]{25,34}$/.test(walletAddress)) {
      return '❌ Invalid wallet address format. Please provide a valid Ethereum or XRPL address.';
    }

    // Mock analysis - integrate with actual MultiChainService
    const response = `
🔍 <b>Wallet Analysis</b>
<code>${walletAddress.slice(0, 10)}...${walletAddress.slice(-6)}</code>

💰 <b>Total Portfolio Value:</b> $12,450.67
📈 <b>24h Change:</b> +5.2%
🌐 <b>Networks:</b> 3 (Ethereum, Polygon, BSC)

<b>Top Holdings:</b>
• ETH: $8,234.56 (66.2%)
• USDC: $2,500.00 (20.1%)
• MATIC: $1,234.56 (9.9%)

🤖 <b>AI Insight:</b> Well-diversified portfolio with strong blue-chip exposure. Consider rebalancing if ETH allocation exceeds comfort level.

💡 Use the web app for detailed analysis: portfolio.yourapp.com
    `;

    // Save wallet to user's list
    const user = this.users.get(message.from.id);
    if (user && !user.wallets.includes(walletAddress)) {
      user.wallets.push(walletAddress);
    }

    return response;
  };

  private handleAlerts = async (message: TelegramMessage): Promise<string> => {
    const user = this.users.get(message.from.id);
    if (!user || user.alerts.length === 0) {
      return '🔔 You have no active alerts.\n\nCreate alerts on the web app or use:\n<code>/price ETH 2500</code> to set a price alert';
    }

    let response = '🔔 <b>Your Active Alerts:</b>\n\n';
    // Mock alerts data
    response += '📈 ETH Price Alert: $2,500 (Current: $2,345)\n';
    response += '🐋 Whale Movement: 1000+ ETH transfers\n';
    response += '💼 Portfolio Alert: -10% daily change\n\n';
    response += '⚙️ Manage alerts on the web app for more options.';

    return response;
  };

  private handlePrice = async (message: TelegramMessage): Promise<string> => {
    const args = message.text.trim().split(' ');
    const symbol = args[0]?.toUpperCase();
    
    if (!symbol) {
      return '❌ Please specify a token symbol.\nExample: <code>/price ETH</code>';
    }

    // Mock price data - integrate with actual CryptoService
    const mockPrices: { [key: string]: any } = {
      'ETH': { price: 2345.67, change: 5.2 },
      'BTC': { price: 43210.00, change: 2.1 },
      'MATIC': { price: 0.82, change: 3.4 }
    };

    const tokenData = mockPrices[symbol];
    if (!tokenData) {
      return `❌ Token ${symbol} not found. Try ETH, BTC, MATIC, etc.`;
    }

    const changeEmoji = tokenData.change >= 0 ? '📈' : '📉';
    const changeSign = tokenData.change >= 0 ? '+' : '';

    return `
💰 <b>${symbol} Price</b>

💵 <b>Price:</b> $${tokenData.price.toLocaleString()}
${changeEmoji} <b>24h Change:</b> ${changeSign}${tokenData.change.toFixed(2)}%

📊 Get detailed charts on the web app
    `;
  };

  private handleHelp = async (message: TelegramMessage): Promise<string> => {
    let response = '🤖 <b>Portfolio Bot Commands:</b>\n\n';
    
    for (const command of this.commands.values()) {
      response += `<code>${command.command}</code> - ${command.description}\n`;
    }

    response += '\n💡 <b>Pro Tips:</b>\n';
    response += '• Send any wallet address to analyze it\n';
    response += '• Use the web app for advanced features\n';
    response += '• Enable notifications for real-time alerts\n';

    return response;
  };

  private async handleNaturalLanguage(message: TelegramMessage): Promise<void> {
    const text = message.text.toLowerCase();
    let response = '';

    // Check if it looks like a wallet address
    if (/0x[a-fA-F0-9]{40}/.test(text) || /r[a-zA-Z0-9]{25,34}/.test(text)) {
      const walletMatch = text.match(/(0x[a-fA-F0-9]{40}|r[a-zA-Z0-9]{25,34})/);
      if (walletMatch) {
        const mockMessage = { ...message, text: walletMatch[1] };
        response = await this.handleAnalyze(mockMessage);
      }
    } else if (text.includes('price') || text.includes('cost')) {
      // Extract token from natural language
      const tokenMatch = text.match(/\b(eth|bitcoin|btc|matic|polygon|usdc|usdt)\b/i);
      if (tokenMatch) {
        const mockMessage = { ...message, text: tokenMatch[1] };
        response = await this.handlePrice(mockMessage);
      } else {
        response = '💰 Ask me about token prices! Try "What\'s the price of ETH?" or use /price ETH';
      }
    } else {
      response = '🤔 I didn\'t understand that. Try:\n• Sending a wallet address to analyze\n• Asking about token prices\n• Using /help for commands';
    }

    await this.sendMessage(message.from.id, response);
  }

  async setupWebhook(): Promise<boolean> {
    if (!this.botToken || !this.webhookUrl) {
      return false;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: this.webhookUrl,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error setting up webhook:', error);
      return false;
    }
  }

  getUsers(): TelegramUser[] {
    return Array.from(this.users.values());
  }

  async broadcastAlert(alert: any): Promise<void> {
    const message = `
🚨 <b>Alert Triggered!</b>

${alert.title}
${alert.message}

⏰ Time: ${new Date().toLocaleTimeString()}
    `;

    for (const user of this.users.values()) {
      if (user.preferences.notifications) {
        await this.sendMessage(user.id, message);
      }
    }
  }
}
