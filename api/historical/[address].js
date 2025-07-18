// API endpoint for fetching historical portfolio data

export default async function handler(req, res) {
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
        const { NoditService } = await import('../../nodit-service.js');
        
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
        
        // Return mock historical data as fallback
        const mockData = generateMockHistoricalData(parseInt(days));
        
        res.status(200).json({
            success: true,
            data: mockData,
            address,
            days: parseInt(days),
            timestamp: new Date().toISOString(),
            fallback: true
        });
    }
}

function generateMockHistoricalData(days) {
    const data = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    // Generate mock data points for the requested period
    for (let i = days; i >= 0; i--) {
        const timestamp = now - (i * dayMs);
        const baseValue = 50000 + Math.random() * 20000; // Random portfolio value
        
        data.push({
            timestamp,
            date: new Date(timestamp).toISOString().split('T')[0],
            totalValue: baseValue,
            tokenCount: Math.floor(5 + Math.random() * 10),
            nftCount: Math.floor(Math.random() * 5),
            chains: ['ethereum', 'polygon', 'bsc']
        });
    }
    
    return {
        portfolio: data,
        summary: {
            startValue: data[0]?.totalValue || 0,
            endValue: data[data.length - 1]?.totalValue || 0,
            change: data.length > 1 ? 
                ((data[data.length - 1].totalValue - data[0].totalValue) / data[0].totalValue * 100) : 0,
            period: `${days} days`
        }
    };
}