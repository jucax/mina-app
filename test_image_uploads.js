// Test script for image uploads in Mina App
// Run this in your app's console or add to a test screen

import { supabase } from './src/services/supabase';
import { PropertyService } from './src/services/propertyService';

export const ImageUploadTester = {
  // Test profile image upload
  testProfileImageUpload: async () => {
    console.log('🧪 Testing profile image upload...');
    
    try {
      // Create a test image (you can replace this with actual image selection)
      const testImageUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ No authenticated user found');
        return false;
      }
      
      const fileExt = 'png';
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${fileName}`;
      
      console.log('📝 File details:', { fileName, filePath, userId: user.id });
      
      // Convert data URI to blob
      const response = await fetch(testImageUri);
      const blob = await response.blob();
      
      console.log('📦 Blob details:', { size: blob.size, type: blob.type });
      
      // Upload to profile-images bucket
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: true
        });
      
      if (error) {
        console.error('❌ Profile image upload failed:', error);
        return false;
      }
      
      console.log('✅ Profile image uploaded:', data);
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);
      
      console.log('🔗 Profile image URL:', publicUrl);
      return true;
      
    } catch (error) {
      console.error('❌ Profile image test failed:', error);
      return false;
    }
  },
  
  // Test property image upload
  testPropertyImageUpload: async () => {
    console.log('🧪 Testing property image upload...');
    
    try {
      // Create test images
      const testImageUris = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      ];
      
      console.log('📤 Testing PropertyService.uploadImages...');
      const uploadedUrls = await PropertyService.uploadImages(testImageUris);
      
      console.log('✅ Property images uploaded:', uploadedUrls);
      return uploadedUrls.length > 0;
      
    } catch (error) {
      console.error('❌ Property image test failed:', error);
      return false;
    }
  },
  
  // Test storage buckets
  testStorageBuckets: async () => {
    console.log('🧪 Testing storage buckets...');
    
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('❌ Failed to list buckets:', error);
        return false;
      }
      
      console.log('📦 Available buckets:', buckets.map(b => b.name));
      
      const profileBucket = buckets.find(b => b.name === 'profile-images');
      const propertyBucket = buckets.find(b => b.name === 'property-images');
      
      console.log('🔍 Bucket status:', {
        profileImages: profileBucket ? '✅ Found' : '❌ Missing',
        propertyImages: propertyBucket ? '✅ Found' : '❌ Missing'
      });
      
      return profileBucket && propertyBucket;
      
    } catch (error) {
      console.error('❌ Storage bucket test failed:', error);
      return false;
    }
  },
  
  // Test database access
  testDatabaseAccess: async () => {
    console.log('🧪 Testing database access...');
    
    try {
      const { data: properties, error } = await supabase
        .from('properties')
        .select('id, images')
        .limit(1);
      
      if (error) {
        console.error('❌ Database access failed:', error);
        return false;
      }
      
      console.log('✅ Database access successful');
      console.log('📊 Sample property:', properties?.[0]);
      
      return true;
      
    } catch (error) {
      console.error('❌ Database test failed:', error);
      return false;
    }
  },
  
  // Run all tests
  runAllTests: async () => {
    console.log('🚀 Starting image upload tests...');
    console.log('='.repeat(40));
    
    const results = {
      storageBuckets: await ImageUploadTester.testStorageBuckets(),
      databaseAccess: await ImageUploadTester.testDatabaseAccess(),
      profileImageUpload: await ImageUploadTester.testProfileImageUpload(),
      propertyImageUpload: await ImageUploadTester.testPropertyImageUpload()
    };
    
    console.log('='.repeat(40));
    console.log('📋 Test Results:');
    console.log('✅ Storage Buckets:', results.storageBuckets);
    console.log('✅ Database Access:', results.databaseAccess);
    console.log('✅ Profile Image Upload:', results.profileImageUpload);
    console.log('✅ Property Image Upload:', results.propertyImageUpload);
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`🎯 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! Image uploads are working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Check the logs above for details.');
    }
    
    return results;
  }
};

// Usage:
// import { ImageUploadTester } from './test_image_uploads';
// ImageUploadTester.runAllTests(); 