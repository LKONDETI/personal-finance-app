const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Proxy endpoint for Temenos API
app.get('/api/customers/:customerName', async (req, res) => {
  try {
    const { customerName } = req.params;
    const response = await axios.get(``);
    res.json(response.data);
  } catch (error) {
    console.error('Proxy Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Failed to fetch customer data'
    });
  }
});

// Add more proxy endpoints as needed
// Example for another external API:
// app.get('/api/other-endpoint', async (req, res) => {
//   try {
//     const response = await axios.get('https://other-api.com/endpoint');
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch data' });
//   }
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
}); 