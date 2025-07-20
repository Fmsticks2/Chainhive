// API endpoint for fetching current market conditions

const { NoditService } = require('../nodit-service.js');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        
        // Initialize service with API key from environment
        const noditService = new NoditService(process.env.NODIT_API_KEY);
        
        // Fetch market conditions
        const marketData = await noditService.getMarketConditions();
        
        res.status(200).json({
            success: true,
            data: marketData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching market conditions:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to fetch market conditions',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}