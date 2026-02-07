/**
 * SQL Migration Runner
 * Executes SQL files directly against Supabase database
 */

require('dotenv').config();
const { supabaseAdmin } = require('../lib/supabase');
const fs = require('fs');
const path = require('path');

async function runMigration(sqlFilePath) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📄 Running: ${path.basename(sqlFilePath)}`);
  console.log('='.repeat(80));

  try {
    // Read SQL file
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    if (!sql.trim()) {
      console.log('⚠️ File is empty, skipping...');
      return { success: true, skipped: true };
    }

    console.log(`📝 SQL Length: ${sql.length} characters`);
    console.log(`\n🔄 Executing SQL...`);

    // Execute SQL using Supabase RPC
    // Note: Supabase doesn't have a direct SQL execution endpoint via JS client
    // We'll need to use the REST API directly
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If RPC doesn't exist, we'll execute via raw query
      console.log('⚠️ RPC method not available, trying alternative...');
      
      // Split SQL into individual statements and execute
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      console.log(`📊 Found ${statements.length} SQL statements`);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        
        // Skip comments and empty lines
        if (!statement || statement.startsWith('--') || statement.startsWith('/*')) {
          continue;
        }

        console.log(`\n  [${i + 1}/${statements.length}] Executing statement...`);
        console.log(`  Preview: ${statement.substring(0, 100)}...`);

        try {
          // For CREATE TABLE, ALTER TABLE, etc., we need to use raw SQL
          // Supabase JS client doesn't support DDL directly
          const response = await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
              },
              body: JSON.stringify({ query: statement + ';' })
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.log(`  ❌ Failed: ${errorText}`);
            throw new Error(errorText);
          }

          console.log(`  ✅ Success`);
        } catch (stmtError) {
          console.error(`  ❌ Error executing statement:`, stmtError.message);
          throw stmtError;
        }
      }

      console.log(`\n✅ All statements executed successfully!`);
      return { success: true };
    }

    console.log('✅ Migration completed successfully!');
    return { success: true, data };

  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('Error:', error.message);
    
    if (error.details) {
      console.error('Details:', error.details);
    }
    
    if (error.hint) {
      console.error('Hint:', error.hint);
    }

    return { success: false, error: error.message };
  }
}

async function runAllMigrations() {
  console.log('\n🚀 Starting Database Migration');
  console.log('='.repeat(80));

  const migrationsDir = path.join(__dirname, '..', 'supabase');
  
  // Get all SQL files sorted by name
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('⚠️ No SQL files found in supabase/ directory');
    return;
  }

  console.log(`📁 Found ${files.length} migration file(s):\n`);
  files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));

  const results = [];

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const result = await runMigration(filePath);
    
    results.push({
      file,
      ...result
    });

    if (!result.success) {
      console.log(`\n❌ Stopping migration due to error in ${file}`);
      break;
    }

    // Small delay between migrations
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(80));

  const successful = results.filter(r => r.success && !r.skipped).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed === 0) {
    console.log('\n🎉 All migrations completed successfully!');
  } else {
    console.log('\n⚠️ Some migrations failed. Please review errors above.');
  }

  console.log('='.repeat(80) + '\n');
}

// Check if specific file provided as argument
const args = process.argv.slice(2);

if (args.length > 0) {
  const filePath = path.join(__dirname, '..', 'supabase', args[0]);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${args[0]}`);
    process.exit(1);
  }

  runMigration(filePath)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
} else {
  runAllMigrations()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
