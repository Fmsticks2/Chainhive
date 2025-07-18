// API endpoint for fetching current market conditions

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Import NoditService
        const { NoditService } = await import('../nodit-service.js');
        
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
        
        // Return mock market conditions as fallback
        const mockData = generateMockMarketConditions();
        
        res.status(200).json({
            success: true,
            data: mockData,
            timestamp: new Date().toISOString(),
            fallback: true
        });
    }
}

function generateMockMarketConditions() {
    const sentiments = ['bullish', 'bearish', 'neutral'];
    const volatilities = ['low', 'medium', 'high'];
    const trends = ['upward', 'downward', 'sideways'];
    
    return {
        sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
        volatility: volatilities[Math.floor(Math.random() * volatilities.length)],
        trend: trends[Math.floor(Math.random() * trends.length)],
        fearGreedIndex: Math.floor(Math.random() * 100),
        btcDominance: 40 + Math.random() * 20, // 40-60%
        totalMarketCap: 1.2e12 + Math.random() * 0.8e12, // $1.2T - $2T
        volume24h: 50e9 + Math.random() * 100e9, // $50B - $150B
        topGainers: [
            { symbol: 'ETH', change: 5.2 },
            { symbol: 'BTC', change: 3.1 },
            { symbol: 'SOL', change: 8.7 }
        ],
        topLosers: [
            { symbol: 'ADA', change: -2.1 },
            { symbol: 'DOT', change: -1.8 },
            { symbol: 'LINK', change: -3.2 }
        ]
    };
}