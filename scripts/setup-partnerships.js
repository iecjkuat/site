#!/usr/bin/env node

/**
 * Setup Partnerships & Opportunities System
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function executeSQL(sql, description) {
  console.log(`🔄 ${description}...`);
  try {
    const { data, error } = await supabase.rpc('query', { query_text: sql });
    if (error) {
      console.error(`❌ ${description} failed:`, error);
      return false;
    }
    console.log(`✅ ${description} completed`);
    return true;
  } catch (err) {
    console.error(`❌ ${description} exception:`, err.message);
    return false;
  }
}

async function setupPartnerships() {
  console.log('🚀 Setting up Partnerships & Opportunities System...');

  // First, create the schema
  const schemaPath = path.join(__dirname, '..', 'supabase', '21-partnerships-opportunities.sql');
  const mockDataPath = path.join(__dirname, '..', 'supabase', '22-partnerships-opportunities-mock-data.sql');

  try {
    // Read and execute schema
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 Running partnerships opportunities schema...');
    
    // Execute schema in parts to avoid issues
    const schemaSuccess = await executeSQL(schemaSQL, 'Schema creation');
    
    if (!schemaSuccess) {
      console.log('⚠️ Schema creation had issues, but continuing with mock data...');
    }

    // Read and execute mock data
    const mockDataSQL = fs.readFileSync(mockDataPath, 'utf8');
    console.log('📄 Running partnerships opportunities mock data...');
    
    const mockDataSuccess = await executeSQL(mockDataSQL, 'Mock data insertion');
    
    if (mockDataSuccess) {
      console.log('🎉 Partnerships & Opportunities system setup completed successfully!');
    } else {
      console.log('⚠️ Setup completed with some issues. Check the logs above.');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  setupPartnerships();
}

module.exports = setupPartnerships;