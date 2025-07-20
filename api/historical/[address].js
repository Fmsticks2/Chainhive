// API endpoint for fetching historical portfolio data

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { address } = req.query;
    const { days = '30' } = req.query;
    
    if (!address) {
        return res.status(400).json({ error: 'Address is required' });
    }

    try {
        // Import NoditService
        const { NoditService } = require('../../nodit-service.js');
        
        // Initialize service with API key from environment
        const noditService = new NoditService(process.env.NODIT_API_KEY);
        
        // Fetch historical data
        const historicalData = await noditService.getHistoricalData(address, parseInt(days));
        
        res.status(200).json({
            success: true,
            data: historicalData,
            address,
            days: parseInt(days),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching historical data:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to fetch historical data',
            message: error.message,
            address,
            days: parseInt(days),
            timestamp: new Date().toISOString()
        });
    }
}