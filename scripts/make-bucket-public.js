/**
 * Make Resources Bucket Public
 * 
 * This script updates the resources bucket to be public,
 * allowing direct access to files without signed URLs.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function makeBucketPublic() {
  console.log('🔧 Updating resources bucket to public...\n');

  try {
    // Update bucket to be public
    const { data, error } = await supabase.storage.updateBucket('resources', {
      public: true,
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

    if (error) {
      console.error('❌ Error updating bucket:', error.message);
      console.error('\n📝 Manual steps:');
      console.error('   1. Go to Supabase Dashboard > Storage > resources');
      console.error('   2. Click "Edit bucket"');
      console.error('   3. Toggle "Public bucket" to ON');
      console.error('   4. Click "Save"');
      return;
    }

    console.log('✅ Resources bucket is now public!');
    console.log('   Files can be accessed directly via public URLs');

    // Verify the change
    const { data: buckets } = await supabase.storage.listBuckets();
    const resourcesBucket = buckets.find(b => b.id === 'resources');

    if (resourcesBucket) {
      console.log('\n📦 Bucket status:');
      console.log('   - Public:', resourcesBucket.public);
      console.log('   - File size limit:', `${resourcesBucket.file_size_limit / 1024 / 1024}MB`);
    }

    // Test public access
    console.log('\n🧪 Testing public access...');
    const { data: files } = await supabase.storage
      .from('resources')
      .list('constitution', { limit: 1 });

    if (files && files.length > 0) {
      const testFile = `constitution/${files[0].name}`;
      const { data: urlData } = supabase.storage
        .from('resources')
        .getPublicUrl(testFile);

      console.log('✅ Public URL generated:');
      console.log('   ', urlData.publicUrl);
      console.log('\n   Try opening this URL in your browser - it should work!');
    }

    console.log('\n✅ Bucket update complete!');
    console.log('\n📋 Downloads should now work without signed URLs');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run update
makeBucketPublic().catch(console.error);
