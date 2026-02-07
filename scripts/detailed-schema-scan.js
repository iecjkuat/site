/**
 * Detailed Database Schema Scanner
 * Gets complete column information using pg_catalog
 */

require('dotenv').config();
const { supabaseAdmin } = require('../lib/supabase');

async function getDetailedSchema() {
  console.log('🔍 Scanning Detailed Database Schema...\n');

  try {
    // Query pg_catalog to get table and column information
    const { data, error } = await supabaseAdmin.rpc('get_table_schema', {});

    if (error) {
      console.log('⚠️ RPC function not available, using alternative method...\n');
      await scanTablesDirectly();
      return;
    }

    console.log('Schema data:', data);
  } catch (error) {
    console.log('⚠️ Error with RPC, using direct table scan...\n');
    await scanTablesDirectly();
  }
}

async function scanTablesDirectly() {
  const tables = [
    'users', 'events', 'event_attendees', 'payments', 'ideas', 'idea_votes',
    'messages', 'resources', 'opportunities', 'support_tickets', 'articles',
    'media_files', 'executive_committee', 'club_patrons', 'profiles',
    'testimonials', 'projects', 'notifications', 'meetings', 'feedback'
  ];

  const schema = {};

  for (const tableName of tables) {
    try {
      // Get a sample row to understand structure
      const { data, error } = await supabaseAdmin
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`⚠️ ${tableName}: ${error.message}`);
        continue;
      }

      if (data && data.length > 0) {
        const sampleRow = data[0];
        const columns = Object.keys(sampleRow).map(col => ({
          name: col,
          type: typeof sampleRow[col],
          sample: sampleRow[col]
        }));

        schema[tableName] = columns;

        console.log(`\n📊 ${tableName.toUpperCase()}`);
        console.log('─'.repeat(80));
        columns.forEach(col => {
          const sample = col.sample !== null && col.sample !== undefined 
            ? JSON.stringify(col.sample).substring(0, 50) 
            : 'null';
          console.log(`  ${col.name.padEnd(30)} ${col.type.padEnd(15)} ${sample}`);
        });
      } else {
        // Table exists but is empty - try to get structure anyway
        const { data: emptyData, error: emptyError } = await supabaseAdmin
          .from(tableName)
          .select('*')
          .limit(0);

        if (!emptyError) {
          console.log(`\n📊 ${tableName.toUpperCase()} (empty table)`);
          console.log('─'.repeat(80));
          console.log('  Table exists but has no data to infer schema');
        }
      }
    } catch (error) {
      console.log(`❌ ${tableName}: ${error.message}`);
    }
  }

  // Save to file
  const fs = require('fs');
  fs.writeFileSync('detailed-schema.json', JSON.stringify(schema, null, 2));
  console.log('\n\n✅ Detailed schema saved to detailed-schema.json');
}

getDetailedSchema()
  .then(() => {
    console.log('\n✅ Detailed schema scan complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Scanner failed:', error);
    process.exit(1);
  });
