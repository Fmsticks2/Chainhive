const dotenv = require('dotenv');
dotenv.config();

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.WEB3AUTH_CLIENT_ID) {
    return res.status(500).json({ error: 'WEB3AUTH_CLIENT_ID environment variable is required' });
  }

  res.json({
    web3auth: {
      clientId: process.env.WEB3AUTH_CLIENT_ID,
      network: process.env.WEB3AUTH_NETWORK || "sapphire_mainnet"
    }
  });
}