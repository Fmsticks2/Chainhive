// ChainHive Telegram Bot Server
// Standalone server for running the Telegram bot

import ChainHiveTelegramBot from './telegram-bot.js';
import dotenv from 'dotenv';
dotenv.config();

// Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const NODIT_API_KEY = process.env.NODIT_API_KEY;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate required environment variables
if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is required in environment variables');
    console.log('💡 Get your bot token from @BotFather on Telegram');
    process.exit(1);
}

if (!NODIT_API_KEY) {
    console.error('❌ NODIT_API_KEY is required in environment variables');
    console.log('💡 Get your API key from NODIT and set it as an environment variable');
    process.exit(1);
}

// Error handling
process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down Telegram bot gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down Telegram bot gracefully');
    process.exit(0);
});

// Initialize and start the bot
async function startBot() {
    try {
        console.log('🤖 Starting ChainHive Telegram Bot...');
        console.log(`📊 Environment: ${NODE_ENV}`);
        console.log(`🔑 Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
        console.log(`🔗 NODIT API Key: ${NODIT_API_KEY.substring(0, 8)}...`);
        
        // Create bot instance
        const bot = new ChainHiveTelegramBot(BOT_TOKEN, NODIT_API_KEY);
        
        console.log('✅ ChainHive Telegram Bot started successfully!');
        console.log('📱 Bot is now listening for messages...');
        console.log('💡 Send /start to your bot to begin');
        
        // Keep the process alive
        setInterval(() => {
            // Health check or periodic tasks can go here
        }, 30000);
        
    } catch (error) {
        console.error('❌ Failed to start Telegram bot:', error);
        process.exit(1);
    }
}

// Start the bot
startBot();

// Export for testing
module.exports = { startBot };