const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Proxy endpoint for Temenos API
app.get('/api/customers', async (req, res) => {
  try {
    console.log('Received request from client:', req.query);
    
    // Using environment variables for API configuration
    const temenosApiUrl = process.env.TEMENOS_PUBLIC_API_URL;
    const temenosApiKey = process.env.TEMENOS_API_KEY;
    
    if (!temenosApiUrl || !temenosApiKey) {
      console.error('Missing environment variables:', {
        temenosApiUrl: !!temenosApiUrl,
        temenosApiKey: !!temenosApiKey
      });
      throw new Error('Temenos API configuration is missing in environment variables');
    }

    const fullUrl = `${temenosApiUrl}?email=${req.query.email}`;
    console.log('Forwarding request to Temenos API:', fullUrl);
    
    let data = '';
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: fullUrl,
      headers: { 
        'Content-Type': 'application/json', 
        'apikey': temenosApiKey
      },
      data: data
    };

    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: {
        ...config.headers,
        apikey: '***' // Hide the actual API key in logs
      }
    });

    const response = await axios.request(config);
    console.log('Received response from Temenos API:', JSON.stringify(response.data));
    res.json(response.data);
  } catch (error) {
    console.error('Proxy Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    
    // Send more detailed error response
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Failed to fetch customer data',
      details: error.message,
      status: error.response?.status || 500
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log('Environment check:', {
    TEMENOS_PUBLIC_API_URL: process.env.TEMENOS_PUBLIC_API_URL ? 'Set' : 'Not Set',
    TEMENOS_API_KEY: process.env.TEMENOS_API_KEY ? 'Set' : 'Not Set'
  });
}); 