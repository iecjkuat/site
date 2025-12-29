/**
 * Test Ideas Migration
 * Tests the ideas innovation hub migration
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testIdeasMigration() {
    try {
        console.log('🧪 Testing Ideas Innovation Hub migration...');
        
        // For now, let's just validate the SQL syntax
        const sqlPath = path.join(__dirname, '..', 'supabase', '10-ideas-innovation-hub.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('📄 SQL file loaded successfully');
        console.log(`📊 File size: ${sql.length} characters`);
        
        // Check for common SQL syntax issues
        const issues = [];
        
        // Check for unmatched parentheses
        const openParens = (sql.match(/\(/g) || []).length;
        const closeParens = (sql.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
            issues.push(`Unmatched parentheses: ${openParens} open, ${closeParens} close`);
        }
        
        // Check for unmatched quotes
        const singleQuotes = (sql.match(/'/g) || []).length;
        if (singleQuotes % 2 !== 0) {
            issues.push(`Unmatched single quotes: ${singleQuotes}`);
        }
        
        // Check for basic SQL keywords
        const requiredKeywords = ['CREATE', 'TABLE', 'ALTER', 'SELECT'];
        requiredKeywords.forEach(keyword => {
            if (!sql.includes(keyword)) {
                issues.push(`Missing keyword: ${keyword}`);
            }
        });
        
        if (issues.length > 0) {
            console.log('⚠️ Potential issues found:');
            issues.forEach(issue => console.log(`  - ${issue}`));
        } else {
            console.log('✅ Basic SQL validation passed');
        }
        
        // Check for the specific column reference that was causing issues
        if (sql.includes('i.category_id')) {
            console.log('✅ Found category_id references');
        } else {
            console.log('❌ No category_id references found');
        }
        
        // Check for migration logic
        if (sql.includes('ALTER TABLE ideas')) {
            console.log('✅ Found migration logic');
        } else {
            console.log('❌ No migration logic found');
        }
        
        console.log('🎯 Migration test completed');
        
    } catch (error) {
        console.error('❌ Error testing migration:', error);
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testIdeasMigration();
}

module.exports = { testIdeasMigration };