#!/usr/bin/env node

/**
 * Simple script to run SQL files using Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runSqlFile(filePath) {
  console.log(`📄 Running SQL file: ${filePath}`);
  
  try {
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Split SQL content by statements (simple approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error);
            console.error(`Statement: ${statement.substring(0, 100)}...`);
          }
        } catch (err) {
          console.error(`❌ Exception in statement ${i + 1}:`, err.message);
          console.error(`Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }
    
    console.log(`✅ Completed SQL file: ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Failed to run SQL file ${filePath}:`, error.message);
  }
}

async function main() {
  const sqlFile = process.argv[2];
  if (!sqlFile) {
    console.error('Usage: node run-sql-file.js <path-to-sql-file>');
    process.exit(1);
  }
  
  const fullPath = path.resolve(sqlFile);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
  }
  
  await runSqlFile(fullPath);
}

if (require.main === module) {
  main();
}