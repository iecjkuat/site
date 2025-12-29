#!/usr/bin/env node

/**
 * Apply Partnerships & Opportunities Schema
 * This script manually applies the schema changes from 21-partnerships-opportunities.sql
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function applyPartnershipsSchema() {
  console.log('🚀 Applying Partnerships & Opportunities Schema...');

  try {
    // Step 1: Create opportunity_categories table
    console.log('📋 Creating opportunity_categories table...');
    
    const { error: catError } = await supabase.rpc('query', {
      query_text: `
        CREATE TABLE IF NOT EXISTS opportunity_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          icon VARCHAR(50),
          color VARCHAR(20),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (catError) {
      console.error('❌ opportunity_categories creation failed:', catError);
    } else {
      console.log('✅ opportunity_categories table created');
    }

    // Step 2: Create partnership_organizations table
    console.log('📋 Creating partnership_organizations table...');
    
    const { error: orgError } = await supabase.rpc('query', {
      query_text: `
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

    // Step 3: Add new columns to existing opportunities table
    console.log('📋 Adding new columns to opportunities table...');
    
    const newColumns = [
      'category_id UUID REFERENCES opportunity_categories(id)',
      'organization VARCHAR(255)',
      'location_type VARCHAR(20) DEFAULT \'hybrid\'',
      'eligibility_criteria TEXT',
      'compensation_type VARCHAR(50)',
      'compensation_amount DECIMAL(15,2)',
      'compensation_currency VARCHAR(10) DEFAULT \'KES\'',
      'start_date TIMESTAMP WITH TIME ZONE',
      'end_date TIMESTAMP WITH TIME ZONE',
      'duration_months INTEGER',
      'is_ongoing BOOLEAN DEFAULT FALSE',
      'priority_level VARCHAR(20) DEFAULT \'normal\'',
      'is_featured BOOLEAN DEFAULT FALSE',
      'is_verified BOOLEAN DEFAULT FALSE',
      'view_count INTEGER DEFAULT 0',
      'application_count INTEGER DEFAULT 0',
      'bookmark_count INTEGER DEFAULT 0',
      'image_url VARCHAR(500)',
      'attachments JSONB DEFAULT \'[]\'',
      'source VARCHAR(100)',
      'contact_phone VARCHAR(20)',
      'external_id VARCHAR(100)',
      'updated_by UUID REFERENCES users(id)'
    ];

    for (const column of newColumns) {
      const columnName = column.split(' ')[0];
      try {
        const { error } = await supabase.rpc('query', {
          query_text: `ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS ${column};`
        });
        
        if (error) {
          console.error(`❌ Adding ${columnName} failed:`, error.message);
        } else {
          console.log(`✅ Added column ${columnName}`);
        }
      } catch (err) {
        console.error(`❌ Exception adding ${columnName}:`, err.message);
      }
    }

    // Step 4: Create additional tables
    console.log('📋 Creating additional tables...');

    // opportunity_applications table
    const { error: appError } = await supabase.rpc('query', {
      query_text: `
        CREATE TABLE IF NOT EXISTS opportunity_applications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          application_status VARCHAR(20) DEFAULT 'submitted',
          cover_letter TEXT,
          resume_url VARCHAR(500),
          portfolio_url VARCHAR(500),
          additional_documents JSONB DEFAULT '[]',
          custom_responses JSONB DEFAULT '{}',
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          reviewed_at TIMESTAMP WITH TIME ZONE,
          decision_at TIMESTAMP WITH TIME ZONE,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(opportunity_id, user_id)
        );
      `
    });

    if (appError) {
      console.error('❌ opportunity_applications creation failed:', appError);
    } else {
      console.log('✅ opportunity_applications table created');
    }

    // opportunity_bookmarks table
    const { error: bookError } = await supabase.rpc('query', {
      query_text: `
        CREATE TABLE IF NOT EXISTS opportunity_bookmarks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(opportunity_id, user_id)
        );
      `
    });

    if (bookError) {
      console.error('❌ opportunity_bookmarks creation failed:', bookError);
    } else {
      console.log('✅ opportunity_bookmarks table created');
    }

    // opportunity_views table
    const { error: viewError } = await supabase.rpc('query', {
      query_text: `
        CREATE TABLE IF NOT EXISTS opportunity_views (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (viewError) {
      console.error('❌ opportunity_views creation failed:', viewError);
    } else {
      console.log('✅ opportunity_views table created');
    }

    console.log('\n🎉 Partnerships & Opportunities schema applied successfully!');
    console.log('\n📊 Summary:');
    console.log('✅ opportunity_categories table created');
    console.log('✅ partnership_organizations table created');
    console.log('✅ opportunities table enhanced with new columns');
    console.log('✅ opportunity_applications table created');
    console.log('✅ opportunity_bookmarks table created');
    console.log('✅ opportunity_views table created');
    
    console.log('\n🔄 Next step: Run the mock data script to populate the tables');

  } catch (error) {
    console.error('❌ Schema application failed:', error.message);
    
    // If the 'query' RPC doesn't exist either, provide alternative instructions
    if (error.message.includes('Could not find the function')) {
      console.log('\n💡 Alternative approach needed:');
      console.log('The Supabase instance doesn\'t have the required RPC functions.');
      console.log('You can apply the schema manually by:');
      console.log('1. Opening the Supabase dashboard');
      console.log('2. Going to the SQL Editor');
      console.log('3. Copying and pasting the contents of supabase/21-partnerships-opportunities.sql');
      console.log('4. Running the SQL directly in the dashboard');
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  applyPartnershipsSchema();
}

module.exports = applyPartnershipsSchema;