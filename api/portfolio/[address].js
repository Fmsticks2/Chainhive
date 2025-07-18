import { NoditService } from '../../nodit-service.js';
import dotenv from 'dotenv';
dotenv.config();

const NODIT_API_KEY = process.env.NODIT_API_KEY || 'demo-key';
const noditService = new NoditService(NODIT_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.query;
    const { chains } = req.query;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    const portfolio = await noditService.getMultiChainPortfolio(
      address, 
      chains ? chains.split(',') : undefined
    );
    
    res.json({
      success: true,
      data: portfolio,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Portfolio API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio data',
      message: error.message
    });
  }
}