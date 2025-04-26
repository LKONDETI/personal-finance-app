const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Debug environment variables
console.log('Environment Variables Debug:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Present' : 'Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Present' : 'Missing');
console.log('Current working directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please ensure your .env file exists and contains:');
  console.error('SUPABASE_URL=your_project_url');
  console.error('SUPABASE_ANON_KEY=your_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Endpoint to fetch customer data from Supabase
app.get('/api/customers', async (req, res) => {
  try {
    console.log('Received request from client:', req.query);
    
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        message: 'Email parameter is required'
      });
    }

    // Query Supabase for customer data
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }

    console.log('Retrieved customer data from Supabase:', data);
    res.json(data);
  } catch (error) {
    console.error('Error Details:', {
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    
    res.status(500).json({
      message: 'Failed to fetch customer data',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Environment check:', {
    SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Not Set',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not Set'
  });
}); 