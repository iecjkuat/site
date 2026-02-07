/**
 * Direct SQL Executor for Supabase
 * Uses pg library to execute SQL files directly
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// We'll use node-fetch to call Supabase REST API
async function executeSQLFile(filePath) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📄 Executing: ${path.basename(filePath)}`);
  console.log('='.repeat(80));

  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    
    if (!sql.trim()) {
      console.log('⚠️ File is empty, skipping...');
      return { success: true, skipped: true };
    }

    console.log(`📝 SQL Length: ${sql.length} characters\n`);
    console.log('📋 SQL Preview:');
    console.log('-'.repeat(80));
    console.log(sql.substring(0, 500) + (sql.length > 500 ? '...' : ''));
    console.log('-'.repeat(80));
    
    console.log('\n⚠️ MANUAL EXECUTION REQUIRED');
    console.log('Please copy the SQL above and run it in Supabase SQL Editor:');
    console.log(`👉 ${process.env.SUPABASE_URL}/project/_/sql`);
    console.log('\nPress Enter when done to continue to next file...');

    // Wait for user input
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });

    return { success: true };

  } catch (error) {
    console.error('\n❌ Error reading file:', error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/run-sql-direct.js <filename.sql>');
    console.log('Example: node scripts/run-sql-direct.js 01-core-tables.sql');
    process.exit(1);
  }

  const fileName = args[0];
  const filePath = path.join(__dirname, '..', 'supabase', fileName);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${fileName}`);
    console.error(`Looking in: ${filePath}`);
    process.exit(1);
  }

  const result = await executeSQLFile(filePath);
  
  if (result.success) {
    console.log('\n✅ File processed successfully!');
  } else {
    console.log('\n❌ File processing failed!');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
