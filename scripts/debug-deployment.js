#!/usr/bin/env node

/**
 * Debug script to help diagnose deployment issues
 * Run this script to check various aspects of the deployment
 */

const https = require('https');
const http = require('http');

const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'https://vnrkeys.vercel.app';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function checkDeployment() {
  console.log('🔍 Checking deployment at:', DEPLOYMENT_URL);
  console.log('=' * 50);

  try {
    // Check home page
    console.log('\n1. Checking home page...');
    const homeResponse = await makeRequest(DEPLOYMENT_URL);
    console.log(`   Status: ${homeResponse.statusCode}`);
    console.log(`   Content-Type: ${homeResponse.headers['content-type']}`);

    // Check API health
    console.log('\n2. Checking API health...');
    try {
      const apiResponse = await makeRequest(`${DEPLOYMENT_URL}/api/debug/user-info`);
      console.log(`   API Status: ${apiResponse.statusCode}`);
      if (apiResponse.statusCode === 401) {
        console.log('   ✅ API is working (401 expected for unauthenticated request)');
      }
    } catch (error) {
      console.log(`   ❌ API Error: ${error.message}`);
    }

    // Check login page
    console.log('\n3. Checking login page...');
    const loginResponse = await makeRequest(`${DEPLOYMENT_URL}/login`);
    console.log(`   Status: ${loginResponse.statusCode}`);

    // Check if NextAuth is configured
    console.log('\n4. Checking NextAuth configuration...');
    try {
      const authResponse = await makeRequest(`${DEPLOYMENT_URL}/api/auth/providers`);
      console.log(`   Auth Status: ${authResponse.statusCode}`);
      if (authResponse.statusCode === 200) {
        const providers = JSON.parse(authResponse.data);
        console.log(`   ✅ Auth providers configured: ${Object.keys(providers).join(', ')}`);
      }
    } catch (error) {
      console.log(`   ❌ Auth Error: ${error.message}`);
    }

    console.log('\n' + '=' * 50);
    console.log('🎯 Deployment Check Complete');
    console.log('\nIf you\'re experiencing issues:');
    console.log('1. Check that environment variables are set in Vercel');
    console.log('2. Ensure NEXTAUTH_URL is set to your deployment URL');
    console.log('3. Verify Google OAuth credentials are correct');
    console.log('4. Check that MongoDB connection is working');

  } catch (error) {
    console.error('❌ Deployment check failed:', error.message);
  }
}

// Run the check
checkDeployment();
