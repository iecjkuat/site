/**
 * Verify and Create Storage Bucket for Resources
 * 
 * This script checks if the 'resources' storage bucket exists in Supabase
 * and creates it if it's missing.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Required: SUPABASE_URL, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAndCreateBucket() {
  console.log('🔍 Checking storage bucket setup...\n');

  try {
    // List all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      return;
    }

    console.log('📦 Existing buckets:', buckets.map(b => b.name).join(', ') || 'None');

    // Check if resources bucket exists
    const resourcesBucket = buckets.find(b => b.id === 'resources' || b.name === 'resources');

    if (resourcesBucket) {
      console.log('\n✅ Resources bucket exists!');
      console.log('   - ID:', resourcesBucket.id);
      console.log('   - Name:', resourcesBucket.name);
      console.log('   - Public:', resourcesBucket.public);
      console.log('   - File size limit:', resourcesBucket.file_size_limit ? `${resourcesBucket.file_size_limit / 1024 / 1024}MB` : 'Not set');
      console.log('   - Created:', resourcesBucket.created_at);

      // List files in bucket
      const { data: files, error: filesError } = await supabase.storage
        .from('resources')
        .list('', { limit: 10 });

      if (!filesError && files) {
        console.log('\n📁 Files in bucket:', files.length);
        if (files.length > 0) {
          console.log('   Recent files:');
          files.slice(0, 5).forEach(file => {
            console.log(`   - ${file.name} (${(file.metadata?.size / 1024).toFixed(2)}KB)`);
          });
        }
      }
    } else {
      console.log('\n❌ Resources bucket does NOT exist!');
      console.log('   Creating bucket now...\n');

      // Create the bucket
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('resources', {
        public: true, // Make public for easier access
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/zip',
          'application/x-zip-compressed'
        ]
      });

      if (createError) {
        console.error('❌ Error creating bucket:', createError.message);
        console.error('\n📝 Manual steps:');
        console.error('   1. Go to Supabase Dashboard > Storage');
        console.error('   2. Click "New bucket"');
        console.error('   3. Name: resources');
        console.error('   4. Public: Yes');
        console.error('   5. File size limit: 10MB');
        console.error('   6. Click "Create bucket"');
        console.error('\n   OR run this SQL in Supabase SQL Editor:');
        console.error('   supabase/32-create-storage-bucket-if-missing.sql');
        return;
      }

      console.log('✅ Resources bucket created successfully!');
      console.log('   - Bucket ID:', newBucket?.name || 'resources');
    }

    // Test upload permissions
    console.log('\n🧪 Testing upload permissions...');
    const testContent = 'Test file for resources bucket';
    const testPath = 'test/test-file.txt';

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resources')
      .upload(testPath, Buffer.from(testContent), {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message);
      console.error('   This might be a permissions issue.');
      console.error('   Run: supabase/32-create-storage-bucket-if-missing.sql');
    } else {
      console.log('✅ Upload test successful!');
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('resources')
        .getPublicUrl(testPath);
      
      console.log('   - Test file URL:', urlData.publicUrl);

      // Clean up test file
      await supabase.storage.from('resources').remove([testPath]);
      console.log('   - Test file cleaned up');
    }

    console.log('\n✅ Storage bucket verification complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Upload sample files: node scripts/create-sample-resource-files.js');
    console.log('   2. Test downloads on Resources page');
    console.log('   3. Upload real files via CMS');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error(error);
  }
}

// Run verification
verifyAndCreateBucket().catch(console.error);
