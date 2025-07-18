// ChainHive Telegram Bot
// Multi-Chain Portfolio Tracker Bot with NODIT Integration

import TelegramBot from 'node-telegram-bot-api';
import { NoditService } from './nodit-service.js';

class ChainHiveTelegramBot {
    constructor(botToken, noditApiKey) {
        this.bot = new TelegramBot(botToken, { polling: true });
        this.noditService = new NoditService(noditApiKey);
        this.userSessions = new Map();
        this.userWallets = new Map();
        this.userPreferences = new Map();
        
        this.setupCommands();
        this.setupCallbacks();
        this.setupInlineQueries();
        
        console.log('ChainHive Telegram Bot initialized successfully!');
    }

    setupCommands() {
        // Start command
        this.bot.onText(/\/start/, (msg) => {
            this.handleStart(msg);
        });

        // Help command
        this.bot.onText(/\/help/, (msg) => {
            this.handleHelp(msg);
        });

        // Add wallet command
        this.bot.onText(/\/addwallet (.+)/, (msg, match) => {
            this.handleAddWallet(msg, match[1]);
        });

        // Portfolio command
        this.bot.onText(/\/portfolio/, (msg) => {
            this.handlePortfolio(msg);
        });

        // Balance command
        this.bot.onText(/\/balance (.+)/, (msg, match) => {
            this.handleBalance(msg, match[1]);
        });

        // Analyze command
        this.bot.onText(/\/analyze/, (msg) => {
            this.handleAnalyze(msg);
        });

        // Alerts command
        this.bot.onText(/\/alerts/, (msg) => {
            this.handleAlerts(msg);
        });

        // Settings command
        this.bot.onText(/\/settings/, (msg) => {
            this.handleSettings(msg);
        });

        // Price command
        this.bot.onText(/\/price (.+)/, (msg, match) => {
            this.handlePrice(msg, match[1]);
        });

        // Gas command
        this.bot.onText(/\/gas/, (msg) => {
            this.handleGas(msg);
        });

        // News command
        this.bot.onText(/\/news/, (msg) => {
            this.handleNews(msg);
        });
    }

    setupCallbacks() {
        // Handle callback queries from inline keyboards
        this.bot.on('callback_query', (callbackQuery) => {
            this.handleCallbackQuery(callbackQuery);
        });

        // Handle text messages
        this.bot.on('message', (msg) => {
            if (!msg.text || msg.text.startsWith('/')) return;
            this.handleTextMessage(msg);
        });
    }

    setupInlineQueries() {
        // Handle inline queries
        this.bot.on('inline_query', (query) => {
            this.handleInlineQuery(query);
        });
    }

    // ==================== COMMAND HANDLERS ====================

    async handleStart(msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        
        const welcomeMessage = `
🚀 *Welcome to ChainHive!*

Your AI-powered multi-chain portfolio tracker. I can help you:

📊 Track portfolios across multiple blockchains
🤖 Get AI-powered insights and recommendations
🔔 Set up real-time alerts for your assets
📈 Monitor token prices and market trends
⛽ Check gas fees across networks

*Quick Start:*
1. Add your wallet: \`/addwallet YOUR_ADDRESS\`
2. View portfolio: \`/portfolio\`
3. Get AI analysis: \`/analyze\`

Type /help for all available commands.
        `;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: '📊 Add Wallet', callback_data: 'add_wallet' },
                    { text: '📈 View Portfolio', callback_data: 'portfolio' }
                ],
                [
                    { text: '🤖 AI Analysis', callback_data: 'analyze' },
                    { text: '⚙️ Settings', callback_data: 'settings' }
                ],
                [
                    { text: '📚 Help', callback_data: 'help' },
                    { text: '🌐 Website', url: 'https://chainhive.io' }
                ]
            ]
        };

        await this.bot.sendMessage(chatId, welcomeMessage, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }

    async handleHelp(msg) {
        const chatId = msg.chat.id;
        
        const helpMessage = `
🔧 *ChainHive Commands*

*Wallet Management:*
\`/addwallet <address>\` - Add a wallet to track
\`/portfolio\` - View your complete portfolio
\`/balance <chain>\` - Check balance on specific chain

*Analysis & Insights:*
\`/analyze\` - Get AI-powered portfolio analysis
\`/price <token>\` - Check token price
\`/gas\` - Check current gas fees

*Alerts & Monitoring:*
\`/alerts\` - Manage price and transaction alerts
\`/news\` - Get latest crypto news

*Settings:*
\`/settings\` - Configure preferences
\`/help\` - Show this help message

*Supported Chains:*
• Ethereum (ETH)
• Polygon (MATIC)
• BSC (BNB)
• Arbitrum
• Optimism
• Aptos (APT)
• Sui (SUI)
• XRPL (XRP)
• Solana (SOL)

*Examples:*
\`/addwallet 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b1\`
\`/price ETH\`
\`/balance ethereum\`
        `;

        await this.bot.sendMessage(chatId, helpMessage, {
            parse_mode: 'Markdown'
        });
    }

    async handleAddWallet(msg, address) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        
        if (!this.isValidAddress(address)) {
            await this.bot.sendMessage(chatId, '❌ Invalid wallet address format. Please provide a valid address.');
            return;
        }

        try {
            // Add wallet to user's list
            if (!this.userWallets.has(userId)) {
                this.userWallets.set(userId, []);
            }
            
            const userWallets = this.userWallets.get(userId);
            if (userWallets.includes(address)) {
                await this.bot.sendMessage(chatId, '⚠️ This wallet is already being tracked.');
                return;
            }
            
            userWallets.push(address);
            this.userWallets.set(userId, userWallets);
            
            // Send confirmation with quick actions
            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '📊 View Portfolio', callback_data: `portfolio_${address}` },
                        { text: '🤖 Analyze', callback_data: `analyze_${address}` }
                    ],
                    [
                        { text: '🔔 Set Alerts', callback_data: `alerts_${address}` }
                    ]
                ]
            };
            
            await this.bot.sendMessage(chatId, 
                `✅ Wallet added successfully!\n\n📍 Address: \`${address}\`\n\nWhat would you like to do next?`,
                {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                }
            );
            
        } catch (error) {
            console.error('Error adding wallet:', error);
            await this.bot.sendMessage(chatId, '❌ Failed to add wallet. Please try again.');
        }
    }

    async handlePortfolio(msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        
        const userWallets = this.userWallets.get(userId);
        if (!userWallets || userWallets.length === 0) {
            await this.bot.sendMessage(chatId, 
                '📭 No wallets found. Add a wallet first using:\n\n\`/addwallet YOUR_ADDRESS\`',
                { parse_mode: 'Markdown' }
            );
            return;
        }

        try {
            await this.bot.sendMessage(chatId, '🔄 Fetching your portfolio data...');
            
            let totalPortfolioValue = 0;
            let portfolioSummary = '📊 *Your Multi-Chain Portfolio*\n\n';
            
            for (const address of userWallets) {
                const portfolio = await this.noditService.getMultiChainPortfolio(address);
                
                portfolioSummary += `📍 *Wallet:* \`${this.shortenAddress(address)}\`\n`;
                
                for (const [chain, data] of Object.entries(portfolio)) {
                    if (data.error) continue;
                    
                    const chainEmoji = this.getChainEmoji(chain);
                    portfolioSummary += `${chainEmoji} *${chain.toUpperCase()}:* $${data.totalValue.toLocaleString()}\n`;
                    totalPortfolioValue += data.totalValue;
                    
                    // Show top 3 tokens
                    const topTokens = data.tokens
                        .sort((a, b) => (b.valueUSD || 0) - (a.valueUSD || 0))
                        .slice(0, 3);
                    
                    for (const token of topTokens) {
                        portfolioSummary += `  • ${token.symbol}: ${token.balanceFormatted} ($${(token.valueUSD || 0).toLocaleString()})\n`;
                    }
                    
                    portfolioSummary += '\n';
                }
            }
            
            portfolioSummary += `💰 *Total Portfolio Value:* $${totalPortfolioValue.toLocaleString()}\n`;
            portfolioSummary += `🕐 *Last Updated:* ${new Date().toLocaleString()}`;
            
            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '🤖 AI Analysis', callback_data: 'analyze_all' },
                        { text: '🔄 Refresh', callback_data: 'portfolio_refresh' }
                    ],
                    [
                        { text: '📈 Detailed View', callback_data: 'portfolio_detailed' },
                        { text: '🔔 Set Alerts', callback_data: 'alerts_setup' }
                    ]
                ]
            };
            
            await this.bot.sendMessage(chatId, portfolioSummary, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
            
        } catch (error) {
            console.error('Error fetching portfolio:', error);
            await this.bot.sendMessage(chatId, '❌ Failed to fetch portfolio data. Please try again.');
        }
    }

    async handleAnalyze(msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        
        const userWallets = this.userWallets.get(userId);
        if (!userWallets || userWallets.length === 0) {
            await this.bot.sendMessage(chatId, '📭 No wallets to analyze. Add a wallet first.');
            return;
        }

        try {
            await this.bot.sendMessage(chatId, '🤖 Analyzing your portfolio with AI...');
            
            // Fetch portfolio data
            const portfolioData = {};
            for (const address of userWallets) {
                portfolioData[address] = await this.noditService.getMultiChainPortfolio(address);
            }
            
            // Generate AI insights
            const insights = await this.noditService.generatePortfolioInsights(portfolioData);
            
            let analysisMessage = '🧠 *AI Portfolio Analysis*\n\n';
            analysisMessage += `📋 *Summary:* ${insights.summary}\n\n`;
            
            if (insights.recommendations.length > 0) {
                analysisMessage += '💡 *Recommendations:*\n';
                insights.recommendations.forEach((rec, index) => {
                    analysisMessage += `${index + 1}. ${rec}\n`;
                });
                analysisMessage += '\n';
            }
            
            if (insights.alerts.length > 0) {
                analysisMessage += '⚠️ *Alerts:*\n';
                insights.alerts.forEach(alert => {
                    analysisMessage += `• ${alert}\n`;
                });
                analysisMessage += '\n';
            }
            
            analysisMessage += `🎯 *Confidence:* ${(insights.confidence * 100).toFixed(1)}%`;
            
            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '📊 View Portfolio', callback_data: 'portfolio' },
                        { text: '🔄 Re-analyze', callback_data: 'analyze_refresh' }
                    ],
                    [
                        { text: '🎯 DeFi Opportunities', callback_data: 'defi_opportunities' }
                    ]
                ]
            };
            
            await this.bot.sendMessage(chatId, analysisMessage, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
            
        } catch (error) {
            console.error('Error analyzing portfolio:', error);
            await this.bot.sendMessage(chatId, '❌ Failed to analyze portfolio. Please try again.');
        }
    }

    async handlePrice(msg, tokenSymbol) {
        const chatId = msg.chat.id;
        
        try {
            await this.bot.sendMessage(chatId, `🔍 Fetching price for ${tokenSymbol.toUpperCase()}...`);
            
            // Mock price data (replace with actual NODIT API call)
            const priceData = await this.fetchTokenPrice(tokenSymbol);
            
            const priceMessage = `
💰 *${priceData.symbol} Price*

💵 *Current:* $${priceData.price}
📈 *24h Change:* ${priceData.change24h}%
📊 *24h Volume:* $${priceData.volume24h}
🏆 *Market Cap:* $${priceData.marketCap}
🕐 *Updated:* ${new Date().toLocaleString()}
            `;
            
            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '📈 Chart', callback_data: `chart_${tokenSymbol}` },
                        { text: '🔔 Set Alert', callback_data: `price_alert_${tokenSymbol}` }
                    ],
                    [
                        { text: '🔄 Refresh', callback_data: `price_${tokenSymbol}` }
                    ]
                ]
            };
            
            await this.bot.sendMessage(chatId, priceMessage, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
            
        } catch (error) {
            console.error('Error fetching price:', error);
            await this.bot.sendMessage(chatId, `❌ Failed to fetch price for ${tokenSymbol}. Please try again.`);
        }
    }

    async handleGas(msg) {
        const chatId = msg.chat.id;
        
        try {
            await this.bot.sendMessage(chatId, '⛽ Fetching current gas fees...');
            
            // Mock gas data (replace with actual NODIT API call)
            const gasData = await this.fetchGasFees();
            
            let gasMessage = '⛽ *Current Gas Fees*\n\n';
            
            for (const [chain, data] of Object.entries(gasData)) {
                const chainEmoji = this.getChainEmoji(chain);
                gasMessage += `${chainEmoji} *${chain.toUpperCase()}*\n`;
                gasMessage += `  🚀 Fast: ${data.fast} gwei\n`;
                gasMessage += `  🚶 Standard: ${data.standard} gwei\n`;
                gasMessage += `  🐌 Safe: ${data.safe} gwei\n\n`;
            }
            
            gasMessage += `🕐 *Updated:* ${new Date().toLocaleString()}`;
            
            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '🔄 Refresh', callback_data: 'gas_refresh' },
                        { text: '📊 Gas Tracker', url: 'https://etherscan.io/gastracker' }
                    ]
                ]
            };
            
            await this.bot.sendMessage(chatId, gasMessage, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
            
        } catch (error) {
            console.error('Error fetching gas fees:', error);
            await this.bot.sendMessage(chatId, '❌ Failed to fetch gas fees. Please try again.');
        }
    }

    // ==================== CALLBACK HANDLERS ====================

    async handleCallbackQuery(callbackQuery) {
        const chatId = callbackQuery.message.chat.id;
        const userId = callbackQuery.from.id;
        const data = callbackQuery.data;
        
        // Acknowledge the callback query
        await this.bot.answerCallbackQuery(callbackQuery.id);
        
        try {
            if (data === 'portfolio') {
                await this.handlePortfolio({ chat: { id: chatId }, from: { id: userId } });
            } else if (data === 'analyze_all') {
                await this.handleAnalyze({ chat: { id: chatId }, from: { id: userId } });
            } else if (data === 'add_wallet') {
                await this.bot.sendMessage(chatId, 
                    '📝 Please send your wallet address:\n\n\`/addwallet YOUR_ADDRESS\`',
                    { parse_mode: 'Markdown' }
                );
            } else if (data === 'settings') {
                await this.handleSettings({ chat: { id: chatId }, from: { id: userId } });
            } else if (data === 'help') {
                await this.handleHelp({ chat: { id: chatId } });
            } else if (data.startsWith('price_')) {
                const token = data.split('_')[1];
                await this.handlePrice({ chat: { id: chatId } }, token);
            } else if (data === 'gas_refresh') {
                await this.handleGas({ chat: { id: chatId } });
            }
        } catch (error) {
            console.error('Error handling callback query:', error);
            await this.bot.sendMessage(chatId, '❌ An error occurred. Please try again.');
        }
    }

    // ==================== UTILITY METHODS ====================

    isValidAddress(address) {
        // Basic validation for different address formats
        if (address.startsWith('0x') && address.length === 42) {
            return true; // Ethereum-like address
        }
        if (address.startsWith('0x') && address.length === 66) {
            return true; // Aptos address
        }
        if (address.match(/^r[a-zA-Z0-9]{24,34}$/)) {
            return true; // XRPL address
        }
        return false;
    }

    shortenAddress(address) {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    getChainEmoji(chain) {
        const emojis = {
            ethereum: '🔷',
            polygon: '🟣',
            bsc: '🟡',
            arbitrum: '🔵',
            optimism: '🔴',
            aptos: '⚫',
            sui: '🔵',
            xrpl: '💎',
            solana: '🟢'
        };
        return emojis[chain.toLowerCase()] || '⚪';
    }

    async fetchTokenPrice(symbol) {
        // Mock implementation - replace with actual NODIT API call
        const mockPrices = {
            'ETH': { symbol: 'ETH', price: '2,345.67', change24h: '+2.34', volume24h: '15.2B', marketCap: '282.1B' },
            'BTC': { symbol: 'BTC', price: '43,210.89', change24h: '+1.23', volume24h: '28.5B', marketCap: '847.3B' },
            'USDC': { symbol: 'USDC', price: '1.00', change24h: '+0.01', volume24h: '5.8B', marketCap: '32.1B' }
        };
        
        return mockPrices[symbol.toUpperCase()] || {
            symbol: symbol.toUpperCase(),
            price: 'N/A',
            change24h: 'N/A',
            volume24h: 'N/A',
            marketCap: 'N/A'
        };
    }

    async fetchGasFees() {
        // Mock implementation - replace with actual NODIT API call
        return {
            ethereum: { fast: 45, standard: 35, safe: 25 },
            polygon: { fast: 35, standard: 25, safe: 15 },
            bsc: { fast: 5, standard: 3, safe: 1 },
            arbitrum: { fast: 2, standard: 1.5, safe: 1 }
        };
    }

    // Additional handlers for other commands...
    async handleAlerts(msg) {
        const chatId = msg.chat.id;
        await this.bot.sendMessage(chatId, '🔔 Alert management coming soon!');
    }

    async handleSettings(msg) {
        const chatId = msg.chat.id;
        await this.bot.sendMessage(chatId, '⚙️ Settings panel coming soon!');
    }

    async handleBalance(msg, chain) {
        const chatId = msg.chat.id;
        await this.bot.sendMessage(chatId, `📊 Balance for ${chain} coming soon!`);
    }

    async handleNews(msg) {
        const chatId = msg.chat.id;
        await this.bot.sendMessage(chatId, '📰 Crypto news coming soon!');
    }

    async handleTextMessage(msg) {
        const chatId = msg.chat.id;
        
        // Check if it looks like a wallet address
        if (this.isValidAddress(msg.text)) {
            await this.handleAddWallet(msg, msg.text);
        } else {
            await this.bot.sendMessage(chatId, 
                '🤔 I didn\'t understand that. Type /help to see available commands.'
            );
        }
    }

    async handleInlineQuery(query) {
        const results = [
            {
                type: 'article',
                id: '1',
                title: 'Check Portfolio',
                description: 'View your multi-chain portfolio',
                input_message_content: {
                    message_text: '/portfolio'
                }
            },
            {
                type: 'article',
                id: '2',
                title: 'AI Analysis',
                description: 'Get AI-powered portfolio insights',
                input_message_content: {
                    message_text: '/analyze'
                }
            }
        ];
        
        await this.bot.answerInlineQuery(query.id, results);
    }
}

// Export for use
export default ChainHiveTelegramBot;

// Example usage:
// const bot = new ChainHiveTelegramBot('YOUR_BOT_TOKEN', 'YOUR_NODIT_API_KEY');
// console.log('ChainHive Telegram Bot is running...');