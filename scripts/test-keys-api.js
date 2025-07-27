#!/usr/bin/env node

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env' });

// Test the keys API endpoint
async function testKeysAPI() {
  try {
    console.log('🔍 Testing Keys API endpoint...');
    
    // Test the admin keys endpoint (this is what Security Head uses)
    const response = await fetch('http://localhost:3001/api/admin/keys?includeStats=true', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real usage, this would include authentication headers
      }
    });

    console.log(`📡 Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API Response successful`);
      console.log(`📊 Total keys returned: ${data.keys?.length || 0}`);
      
      if (data.keys && data.keys.length > 0) {
        // Group by building to show block distribution
        const keysByBuilding = data.keys.reduce((acc, key) => {
          const building = key.location?.building || 'Unknown';
          if (!acc[building]) acc[building] = 0;
          acc[building]++;
          return acc;
        }, {});
        
        console.log('\n🏢 Keys by Building:');
        Object.entries(keysByBuilding).forEach(([building, count]) => {
          console.log(`  ${building}: ${count} keys`);
        });
        
        // Show sample keys
        console.log('\n📋 Sample keys:');
        data.keys.slice(0, 5).forEach(key => {
          console.log(`  - ${key.name} (${key.labNumber}) - ${key.department} - ${key.currentStatus}`);
        });
      }
    } else {
      const errorData = await response.text();
      console.log(`❌ API Error: ${errorData}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test without authentication (will likely fail, but shows the endpoint structure)
console.log('⚠️  Note: This test may fail due to authentication requirements');
console.log('   The Security Head dashboard will have proper authentication');
console.log('');

testKeysAPI();
