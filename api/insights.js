// API endpoint for AI-powered portfolio insights

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { portfolioData, address, chains } = req.body;
    
    if (!portfolioData || !address) {
        return res.status(400).json({ error: 'Portfolio data and address are required' });
    }

    try {
        // Import NoditService
        const { NoditService } = require('../nodit-service.js');
        
        // Initialize service with API key from environment
        const noditService = new NoditService(process.env.NODIT_API_KEY);
        
        // Generate AI insights based on portfolio data
        const insights = await noditService.generateInsights(portfolioData, address, chains);
        
        res.status(200).json({
            success: true,
            data: insights,
            address,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating insights:', error);
        
        // Fallback to basic insights if AI service fails
        const fallbackInsights = generateFallbackInsights(portfolioData);
        
        res.status(200).json({
            success: true,
            data: fallbackInsights,
            address,
            timestamp: new Date().toISOString(),
            fallback: true
        });
    }
}

function generateFallbackInsights(portfolioData) {
    const totalValue = Object.values(portfolioData)
        .reduce((sum, chain) => sum + (chain.totalValue || 0), 0);
    
    const chains = Object.keys(portfolioData).filter(chain => 
        portfolioData[chain].totalValue > 0
    );
    
    const allTokens = chains.flatMap(chain => portfolioData[chain].tokens || []);
    const allNFTs = chains.flatMap(chain => portfolioData[chain].nfts || []);
    
    let insights = `Portfolio Analysis Summary:\n\n`;
    insights += `💰 Total Portfolio Value: $${totalValue.toLocaleString()}\n`;
    insights += `🔗 Active Chains: ${chains.length} (${chains.join(', ')})\n`;
    insights += `🪙 Total Tokens: ${allTokens.length}\n`;
    insights += `🖼️ Total NFTs: ${allNFTs.length}\n\n`;
    
    if (allTokens.length > 0) {
        const topToken = allTokens.reduce((max, token) => 
            token.usdValue > max.usdValue ? token : max
        );
        insights += `🏆 Largest Holding: ${topToken.symbol} ($${topToken.usdValue.toLocaleString()})\n`;
    }
    
    // Risk assessment
    const diversificationScore = calculateDiversificationScore(allTokens);
    insights += `📊 Diversification Score: ${diversificationScore.toFixed(1)}/10\n`;
    
    if (diversificationScore < 4) {
        insights += `⚠️ Consider diversifying your portfolio across more assets\n`;
    } else if (diversificationScore > 7) {
        insights += `✅ Well-diversified portfolio\n`;
    }
    
    return {
        insights,
        confidence: 0.7,
        recommendations: [
            "Monitor your largest holdings for concentration risk",
            "Consider rebalancing if any single asset exceeds 30% of portfolio",
            "Keep track of cross-chain exposure and gas costs"
        ]
    };
}

function calculateDiversificationScore(tokens) {
    if (!tokens || tokens.length === 0) return 0;
    
    const totalValue = tokens.reduce((sum, token) => sum + token.usdValue, 0);
    if (totalValue === 0) return 0;
    
    // Calculate Herfindahl-Hirschman Index for diversification
    const hhi = tokens.reduce((sum, token) => {
        const share = token.usdValue / totalValue;
        return sum + (share * share);
    }, 0);
    
    // Convert to 0-10 scale (lower HHI = higher diversification)
    return Math.max(0, 10 - (hhi * 10));
}