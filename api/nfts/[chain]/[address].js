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
    
    const nfts = await noditService.getNFTData(address, chain);
    
    res.json({
      success: true,
      data: nfts,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('NFTs API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch NFT data',
      message: error.message
    });
  }
}