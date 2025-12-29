#!/usr/bin/env node

/**
 * Test Simple Opportunities Route
 */

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Simple test route
app.get('/test/opportunities', async (req, res) => {
  try {
    console.log('📋 Testing simple opportunities route...');
    
    // Simple query first
    const { data: opportunities, error } = await supabase
      .from('opportunities')
      .select('id, title, organization, opportunity_type, status')
      .eq('status', 'active')
      .limit(5);

    if (error) {
      console.error('❌ Database error:', error);
      return res.status(500).json({ 
        message: 'Database error', 
        error: error.message 
      });
    }

    console.log(`✅ Found ${opportunities.length} opportunities`);
    
    res.json({
      success: true,
      count: opportunities.length,
      opportunities: opportunities
    });
    
  } catch (error) {
    console.error('❌ Route error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Test with categories
app.get('/test/opportunities-with-categories', async (req, res) => {
  try {
    console.log('📋 Testing opportunities with categories...');
    
    const { data: opportunities, error } = await supabase
      .from('opportunities')
      .select(`
        id, title, organization, opportunity_type, status,
        category:opportunity_categories(name, icon, color)
      `)
      .eq('status', 'active')
      .limit(3);

    if (error) {
      console.error('❌ Database error:', error);
      return res.status(500).json({ 
        message: 'Database error', 
        error: error.message 
      });
    }

    console.log(`✅ Found ${opportunities.length} opportunities with categories`);
    
    res.json({
      success: true,
      count: opportunities.length,
      opportunities: opportunities
    });
    
  } catch (error) {
    console.error('❌ Route error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🧪 Test server running on http://localhost:${PORT}`);
  console.log(`📋 Test routes:`);
  console.log(`   GET /test/opportunities`);
  console.log(`   GET /test/opportunities-with-categories`);
});