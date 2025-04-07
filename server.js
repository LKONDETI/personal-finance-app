const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Proxy endpoint for Temenos API
app.get('/api/customers', async (req, res) => {
  try {
    console.log('Received request from client:', req.query);
    
    // Using the exact API URL format
    const temenosApiUrl = process.env.TEMENOS_PUBLIC_API_URL;
    const fullUrl = `${temenosApiUrl}?email=${req.query.email}`;
    
    console.log('Forwarding request to Temenos API:', fullUrl);
    
    let data = '';
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: fullUrl,
      headers: { 
        'Content-Type': 'application/json', 
        'apikey': process.env.TEMENOS_API_KEY
      },
      data: data
    };

    const response = await axios.request(config);
    console.log('Received response from Temenos API:', JSON.stringify(response.data));
    res.json(response.data);
  } catch (error) {
    console.error('Proxy Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Failed to fetch customer data'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
}); 