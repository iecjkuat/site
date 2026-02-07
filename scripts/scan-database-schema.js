/**
 * Database Schema Scanner
 * Scans the current Supabase database to get all tables and their columns
 */

require('dotenv').config();
const { supabaseAdmin } = require('../lib/supabase');

async function scanDatabaseSchema() {
  console.log('🔍 Scanning Supabase Database Schema...\n');

  try {
    // Query to get all tables in the public schema
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (tablesError) {
      console.error('❌ Error fetching tables:', tablesError);
      
      // Fallback: Try to query known tables directly
      console.log('\n📋 Attempting to scan known tables...\n');
      const knownTables = [
        'users', 'events', 'event_attendees', 'payments', 'ideas', 'idea_votes',
        'messages', 'resources', 'opportunities', 'support_tickets', 'articles',
        'media_files', 'executive_committee', 'club_patrons', 'profiles',
        'testimonials', 'projects', 'project_collaborations', 'notifications',
        'meetings', 'meeting_attendees', 'meeting_minutes', 'elections',
        'election_candidates', 'election_votes', 'feedback', 'chat_groups',
        'chat_group_members', 'announcements', 'financial_transactions',
        'budget_categories', 'annual_budgets', 'donations_sponsorships',
        'opportunity_applications', 'opportunity_bookmarks', 'resource_downloads',
        'activity_logs', 'communication_logs'
      ];

      const existingTables = [];
      
      for (const tableName of knownTables) {
        const { data, error } = await supabaseAdmin
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          existingTables.push({ table_name: tableName });
        }
      }

      if (existingTables.length === 0) {
        console.error('❌ Could not find any tables. Please check your database connection.');
        process.exit(1);
      }

      await scanTableDetails(existingTables);
      return;
    }

    if (!tables || tables.length === 0) {
      console.log('⚠️ No tables found in the public schema.');
      return;
    }

    console.log(`✅ Found ${tables.length} tables\n`);
    await scanTableDetails(tables);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

async function scanTableDetails(tables) {
  const schema = {};

  for (const table of tables) {
    const tableName = table.table_name;
    
    try {
      // Get column information using RPC or direct query
      const { data: sampleRow, error: sampleError } = await supabaseAdmin
        .from(tableName)
        .select('*')
        .limit(1)
        .single();

      let columns = [];
      
      if (!sampleError && sampleRow) {
        // Extract column names from sample row
        columns = Object.keys(sampleRow).map(col => ({
          column_name: col,
          data_type: typeof sampleRow[col]
        }));
      } else {
        // Try to get just the column names
        const { data: emptyData, error: emptyError } = await supabaseAdmin
          .from(tableName)
          .select('*')
          .limit(0);

        if (!emptyError) {
          columns = [{ column_name: 'Unable to fetch columns', data_type: 'unknown' }];
        }
      }

      // Get row count
      const { count, error: countError } = await supabaseAdmin
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      schema[tableName] = {
        columns: columns,
        row_count: countError ? 0 : count
      };

      console.log(`📊 Table: ${tableName}`);
      console.log(`   Rows: ${schema[tableName].row_count}`);
      console.log(`   Columns: ${columns.map(c => c.column_name).join(', ')}`);
      console.log('');

    } catch (error) {
      console.log(`⚠️ Table: ${tableName} - Error: ${error.message}\n`);
    }
  }

  // Save schema to file
  const fs = require('fs');
  const schemaJson = JSON.stringify(schema, null, 2);
  fs.writeFileSync('database-schema.json', schemaJson);
  console.log('\n✅ Schema saved to database-schema.json');

  // Generate summary report
  generateSummaryReport(schema);
}

function generateSummaryReport(schema) {
  console.log('\n' + '='.repeat(80));
  console.log('DATABASE SCHEMA SUMMARY');
  console.log('='.repeat(80) + '\n');

  const tableNames = Object.keys(schema).sort();
  
  console.log(`Total Tables: ${tableNames.length}\n`);

  // Group tables by category
  const categories = {
    'Core': ['users', 'profiles'],
    'Events': ['events', 'event_attendees'],
    'Payments': ['payments', 'financial_transactions', 'donations_sponsorships'],
    'Ideas': ['ideas', 'idea_votes'],
    'Communication': ['messages', 'chat_groups', 'chat_group_members', 'announcements'],
    'Resources': ['resources', 'resource_downloads', 'resource_reviews'],
    'Opportunities': ['opportunities', 'opportunity_applications', 'opportunity_bookmarks'],
    'Leadership': ['executive_committee', 'club_patrons'],
    'Governance': ['meetings', 'meeting_attendees', 'meeting_minutes', 'elections', 'election_candidates', 'election_votes'],
    'Projects': ['projects', 'project_collaborations'],
    'Support': ['support_tickets', 'feedback'],
    'CMS': ['articles', 'media_files'],
    'System': ['notifications', 'activity_logs', 'communication_logs']
  };

  for (const [category, tables] of Object.entries(categories)) {
    const existingTables = tables.filter(t => schema[t]);
    if (existingTables.length > 0) {
      console.log(`${category}:`);
      existingTables.forEach(table => {
        const info = schema[table];
        console.log(`  ✓ ${table} (${info.row_count} rows, ${info.columns.length} columns)`);
      });
      console.log('');
    }
  }

  // List uncategorized tables
  const categorizedTables = Object.values(categories).flat();
  const uncategorized = tableNames.filter(t => !categorizedTables.includes(t));
  
  if (uncategorized.length > 0) {
    console.log('Other Tables:');
    uncategorized.forEach(table => {
      const info = schema[table];
      console.log(`  ✓ ${table} (${info.row_count} rows, ${info.columns.length} columns)`);
    });
    console.log('');
  }

  console.log('='.repeat(80) + '\n');
}

// Run the scanner
scanDatabaseSchema()
  .then(() => {
    console.log('✅ Database schema scan complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Scanner failed:', error);
    process.exit(1);
  });
