// Test script to verify Supabase Storage setup
require('dotenv').config();
const { supabaseAdmin } = require('./lib/supabase');

async function testStorageSetup() {
    console.log('🔍 Testing Supabase Storage Setup...\n');

    try {
        // 1. Check if bucket exists
        console.log('1️⃣ Checking if "resources" bucket exists...');
        const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
        
        if (bucketsError) {
            console.error('❌ Error listing buckets:', bucketsError);
            return;
        }

        const resourcesBucket = buckets.find(b => b.id === 'resources');
        if (!resourcesBucket) {
            console.error('❌ "resources" bucket NOT found!');
            console.log('Available buckets:', buckets.map(b => b.id));
            console.log('\n💡 Run supabase/17-setup-storage.sql to create the bucket');
            return;
        }

        console.log('✅ "resources" bucket exists');
        console.log('   - Public:', resourcesBucket.public);
        console.log('   - File size limit:', resourcesBucket.file_size_limit, 'bytes');
        console.log('   - Allowed MIME types:', resourcesBucket.allowed_mime_types);

        // 2. Try to upload a test file
        console.log('\n2️⃣ Testing file upload...');
        const testContent = Buffer.from('This is a test file');
        const testPath = 'test/test-file.txt';

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('resources')
            .upload(testPath, testContent, {
                contentType: 'text/plain',
                upsert: true
            });

        if (uploadError) {
            console.error('❌ Upload failed:', uploadError);
            console.log('\n💡 This might be a permissions issue. Check storage policies.');
            return;
        }

        console.log('✅ Test file uploaded successfully');
        console.log('   - Path:', uploadData.path);

        // 3. Try to get public URL
        console.log('\n3️⃣ Getting public URL...');
        const { data: urlData } = supabaseAdmin.storage
            .from('resources')
            .getPublicUrl(testPath);

        console.log('✅ Public URL generated:', urlData.publicUrl);

        // 4. List files in bucket
        console.log('\n4️⃣ Listing files in bucket...');
        const { data: files, error: listError } = await supabaseAdmin.storage
            .from('resources')
            .list('test');

        if (listError) {
            console.error('❌ Error listing files:', listError);
        } else {
            console.log('✅ Files in test folder:', files.length);
        }

        // 5. Clean up test file
        console.log('\n5️⃣ Cleaning up test file...');
        const { error: deleteError } = await supabaseAdmin.storage
            .from('resources')
            .remove([testPath]);

        if (deleteError) {
            console.error('⚠️  Could not delete test file:', deleteError);
        } else {
            console.log('✅ Test file deleted');
        }

        console.log('\n✅ All storage tests passed! Upload should work.');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testStorageSetup();
