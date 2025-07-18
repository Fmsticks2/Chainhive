import { NoditService } from '../../../nodit-service.js';
import dotenv from 'dotenv';
dotenv.config();

const NODIT_API_KEY = process.env.NODIT_API_KEY || 'demo-key';
const noditService = new NoditService(NODIT_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { chain, address } = req.query;
    
    if (!address || !chain) {
      return res.status(400).json({ error: 'Chain and address are required' });
    }
    
    const balance = await noditService.getTokenBalances(address, chain);
    
    res.json({
      success: true,
      data: balance,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Balance API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch balance data',
      message: error.message
    });
  }
}