// Test script to check image upload functionality
const { createClient } = require('@supabase/supabase-js');
const FileSystem = require('expo-file-system');

const supabaseUrl = 'https://tliwzfdnpeozlanhpxmn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaXd6ZmRucGVvemxhbmhweG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzY2MzksImV4cCI6MjA2NTUxMjYzOX0.1EY13lSb0UjsqNoqGJEK7Hgh4SBJ9LxBr3Llt89am44';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testImageUpload() {
  try {
    console.log('🔍 Testing image upload to Supabase Storage...');
    
    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }
    
    console.log('📦 Available buckets:', buckets.map(b => b.name));
    
    const propertyImagesBucket = buckets.find(b => b.name === 'property-images');
    if (!propertyImagesBucket) {
      console.log('❌ property-images bucket not found');
      return;
    }
    
    console.log('✅ property-images bucket found');
    
    // Test uploading a simple text file
    const testContent = 'test image content';
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(testFileName, testContent, {
        contentType: 'text/plain'
      });
    
    if (uploadError) {
      console.error('❌ Error uploading test file:', uploadError);
      return;
    }
    
    console.log('✅ Test file uploaded successfully:', uploadData);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(testFileName);
    
    console.log('🔗 Public URL:', publicUrl);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testImageUpload();
