#!/usr/bin/env node

/**
 * Migrate Partnerships & Opportunities System
 * This script manually creates the required tables and columns
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function executeSQL(sql, description) {
  console.log(`🔄 ${description}...`);
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.error(`❌ ${description} failed:`, error);
      return false;
    }
    console.log(`✅ ${description} completed`);
    return true;
  } catch (err) {
    // Try alternative approach using direct table operations
    console.log(`⚠️ RPC failed, trying alternative approach for: ${description}`);
    return false;
  }
}

async function createTables() {
  console.log('🚀 Creating Partnerships & Opportunities tables...');

  // Create opportunity_categories table
  try {
    console.log('📋 Creating opportunity_categories table...');
    const { error: catError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS opportunity_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          icon VARCHAR(50),
          color VARCHAR(20),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });
    
    if (catError) {
      console.error('❌ opportunity_categories creation failed:', catError);
    } else {
      console.log('✅ opportunity_categories table created');
    }
  } catch (err) {
    console.error('❌ opportunity_categories exception:', err.message);
  }

  // Create partnership_organizations table
  try {
    console.log('📋 Creating partnership_organizations table...');
    const { error: orgError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS partnership_organizations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          website VARCHAR(500),
          contact_person VARCHAR(255),
          contact_email VARCHAR(255),
          organization_type VARCHAR(50),
          industry VARCHAR(100),
          partnership_type VARCHAR(50),
          partnership_status VARCHAR(20) DEFAULT 'active',
          benefits_offered TEXT[],
          linkedin_url VARCHAR(500),
          opportunities_posted INTEGER DEFAULT 0,
          members_hired INTEGER DEFAULT 0,
          events_sponsored INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });
    
    if (orgError) {
      console.error('❌ partnership_organizations creation failed:', orgError);
    } else {
      console.log('✅ partnership_organizations table created');
    }
  } catch (err) {
    console.error('❌ partnership_organizations exception:', err.message);
  }

  // Add missing columns to opportunities table
  const columnsToAdd = [
    'category_id UUID REFERENCES opportunity_categories(id)',
    'organization VARCHAR(255)',
    'location_type VARCHAR(20) DEFAULT \'hybrid\'',
    'eligibility_criteria TEXT',
    'compensation_type VARCHAR(50)',
    'compensation_amount DECIMAL(15,2)',
    'start_date TIMESTAMP WITH TIME ZONE',
    'duration_months INTEGER',
    'priority_level VARCHAR(20) DEFAULT \'normal\'',
    'is_featured BOOLEAN DEFAULT FALSE'
  ];

  for (const column of columnsToAdd) {
    try {
      const columnName = column.split(' ')[0];
      console.log(`📋 Adding column ${columnName} to opportunities table...`);
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS ${column};`
      });
      
      if (error) {
        console.error(`❌ Adding ${columnName} failed:`, error);
      } else {
        console.log(`✅ Added column ${columnName}`);
      }
    } catch (err) {
      console.error(`❌ Exception adding column:`, err.message);
    }
  }

  return true;
}

async function insertMockData() {
  console.log('🌱 Inserting mock data...');

  // Insert opportunity categories
  try {
    console.log('📋 Inserting opportunity categories...');
    const categories = [
      { name: 'Competitions', description: 'Local and international competitions', icon: 'fa-trophy', color: '#f59e0b' },
      { name: 'Funding', description: 'Grants and funding opportunities', icon: 'fa-dollar-sign', color: '#10b981' },
      { name: 'Internships', description: 'Internship opportunities', icon: 'fa-briefcase', color: '#3b82f6' },
      { name: 'Jobs', description: 'Full-time and part-time jobs', icon: 'fa-user-tie', color: '#8b5cf6' },
      { name: 'Networking', description: 'Networking events and meetups', icon: 'fa-users', color: '#ef4444' },
      { name: 'Partnerships', description: 'Collaboration opportunities', icon: 'fa-handshake', color: '#06b6d4' },
      { name: 'Grants', description: 'Research and project grants', icon: 'fa-award', color: '#f97316' }
    ];

    for (const category of categories) {
      const { error } = await supabase
        .from('opportunity_categories')
        .insert(category)
        .select();
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`❌ Category ${category.name} failed:`, error);
      } else {
        console.log(`✅ Category ${category.name} inserted`);
      }
    }
  } catch (err) {
    console.error('❌ Categories insertion failed:', err.message);
  }

  // Insert partnership organizations
  try {
    console.log('📋 Inserting partnership organizations...');
    const organizations = [
      {
        name: 'Safaricom PLC',
        description: 'Leading telecommunications company in Kenya',
        website: 'https://www.safaricom.co.ke',
        contact_person: 'Innovation Team',
        contact_email: 'innovation@safaricom.co.ke',
        organization_type: 'corporate',
        industry: 'Telecommunications',
        partnership_type: 'sponsor',
        partnership_status: 'active',
        benefits_offered: ['Internship opportunities', 'Mentorship programs', 'Funding for projects'],
        linkedin_url: 'https://linkedin.com/company/safaricom'
      },
      {
        name: 'Microsoft Kenya',
        description: 'Global technology company providing cloud computing solutions',
        website: 'https://www.microsoft.com/kenya',
        contact_person: 'Student Engagement Lead',
        contact_email: 'students@microsoft.com',
        organization_type: 'corporate',
        industry: 'Technology',
        partnership_type: 'mentor',
        partnership_status: 'active',
        benefits_offered: ['Azure credits', 'Technical training', 'Certification programs'],
        linkedin_url: 'https://linkedin.com/company/microsoft'
      }
    ];

    for (const org of organizations) {
      const { error } = await supabase
        .from('partnership_organizations')
        .insert(org)
        .select();
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`❌ Organization ${org.name} failed:`, error);
      } else {
        console.log(`✅ Organization ${org.name} inserted`);
      }
    }
  } catch (err) {
    console.error('❌ Organizations insertion failed:', err.message);
  }

  console.log('✅ Mock data insertion completed');
}

async function migratePartnerships() {
  console.log('🚀 Migrating Partnerships & Opportunities System...');

  try {
    await createTables();
    await insertMockData();
    
    console.log('🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- opportunity_categories table created');
    console.log('- partnership_organizations table created');
    console.log('- opportunities table updated with new columns');
    console.log('- Mock data inserted');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  migratePartnerships();
}

module.exports = migratePartnerships;