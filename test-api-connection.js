#!/usr/bin/env node

/**
 * API Connection Test Script
 * Tests the connection between Next.js frontend and Express backend
 */

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const API_BASE_URL = 'http://localhost:5000';

/**
 * Make HTTP request
 */
async function makeRequest(method, endpoint, data = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseData = await response.json();
    
    return {
      status: response.status,
      success: response.ok,
      data: responseData
    };
  } catch (error) {
    return {
      status: 0,
      success: false,
      error: error.message
    };
  }
}

/**
 * Log test result
 */
function logResult(testName, success, details = '') {
  const status = success ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  console.log(`${status} ${testName}`);
  if (details) {
    console.log(`   ${colors.blue}${details}${colors.reset}`);
  }
}

/**
 * Test server connectivity
 */
async function testServerConnectivity() {
  console.log(`\n${colors.bold}${colors.yellow}=== Server Connectivity ===${colors.reset}`);
  
  const response = await makeRequest('GET', '/health');
  const success = response.success && response.status === 200;
  
  logResult(
    'Backend server reachable',
    success,
    success ? `Server running on ${API_BASE_URL}` : `Failed to connect to ${API_BASE_URL}`
  );
  
  return success;
}

/**
 * Test authentication endpoints
 */
async function testAuthentication() {
  console.log(`\n${colors.bold}${colors.yellow}=== Authentication Tests ===${colors.reset}`);
  
  // Test login with valid credentials
  const loginResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'test@example.com',
    password: 'password123'
  });
  
  const loginSuccess = loginResponse.success && loginResponse.status === 200;
  logResult(
    'Login with valid credentials',
    loginSuccess,
    loginSuccess ? `User: ${loginResponse.data?.data?.user?.name}` : `Error: ${loginResponse.data?.error}`
  );
  
  // Test login with invalid credentials
  const invalidLoginResponse = await makeRequest('POST', '/api/auth/login', {
    email: 'invalid@example.com',
    password: 'wrongpassword'
  });
  
  const invalidLoginSuccess = !invalidLoginResponse.success && invalidLoginResponse.status === 401;
  logResult(
    'Login with invalid credentials (should fail)',
    invalidLoginSuccess,
    invalidLoginSuccess ? 'Correctly rejected invalid credentials' : 'Should have rejected invalid credentials'
  );
  
  // Test registration
  const registerResponse = await makeRequest('POST', '/api/auth/register', {
    name: 'Test User',
    email: 'newuser@example.com',
    password: 'password123',
    employeeId: 'TEST001',
    role: 'FACULTY',
    department: 'IT'
  });
  
  const registerSuccess = registerResponse.success && registerResponse.status === 201;
  logResult(
    'User registration',
    registerSuccess,
    registerSuccess ? `User created: ${registerResponse.data?.data?.name}` : `Error: ${registerResponse.data?.error}`
  );
  
  return loginSuccess;
}

/**
 * Test data endpoints
 */
async function testDataEndpoints() {
  console.log(`\n${colors.bold}${colors.yellow}=== Data Endpoints Tests ===${colors.reset}`);
  
  // Test keys endpoint
  const keysResponse = await makeRequest('GET', '/api/keys');
  const keysSuccess = keysResponse.status === 200;
  logResult(
    'GET /api/keys',
    keysSuccess,
    keysSuccess ? `Keys available: ${keysResponse.data?.data?.length || 0}` : `Error: ${keysResponse.data?.error}`
  );
  
  // Test users endpoint
  const usersResponse = await makeRequest('GET', '/api/users');
  const usersSuccess = usersResponse.status === 200;
  logResult(
    'GET /api/users',
    usersSuccess,
    usersSuccess ? `Users available: ${usersResponse.data?.data?.length || 0}` : `Error: ${usersResponse.data?.error}`
  );
  
  // Test departments endpoint
  const departmentsResponse = await makeRequest('GET', '/api/departments');
  const departmentsSuccess = departmentsResponse.status === 200;
  logResult(
    'GET /api/departments',
    departmentsSuccess,
    departmentsSuccess ? `Departments available: ${departmentsResponse.data?.data?.length || 0}` : `Error: ${departmentsResponse.data?.error}`
  );
  
  // Test dashboard stats
  const statsResponse = await makeRequest('GET', '/api/dashboard/stats');
  const statsSuccess = statsResponse.status === 200;
  logResult(
    'GET /api/dashboard/stats',
    statsSuccess,
    statsSuccess ? 'Dashboard stats retrieved' : `Error: ${statsResponse.data?.error}`
  );
  
  return keysSuccess && usersSuccess && departmentsSuccess;
}

/**
 * Test frontend environment
 */
async function testFrontendEnvironment() {
  console.log(`\n${colors.bold}${colors.yellow}=== Frontend Environment ===${colors.reset}`);
  
  // Check if Next.js is running
  try {
    const response = await fetch('http://localhost:3001');
    const nextjsRunning = response.ok;
    logResult(
      'Next.js frontend running',
      nextjsRunning,
      nextjsRunning ? 'Frontend accessible at http://localhost:3001' : 'Frontend not accessible'
    );
    
    // Check test page
    const testPageResponse = await fetch('http://localhost:3001/test-api');
    const testPageRunning = testPageResponse.ok;
    logResult(
      'API test page accessible',
      testPageRunning,
      testPageRunning ? 'Test page: http://localhost:3001/test-api' : 'Test page not accessible'
    );
    
    return nextjsRunning;
  } catch (error) {
    logResult(
      'Next.js frontend running',
      false,
      'Frontend not running or not accessible'
    );
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`${colors.bold}${colors.blue}API Integration Connection Test${colors.reset}`);
  console.log(`${colors.blue}Testing connection between Next.js frontend and Express backend${colors.reset}\n`);

  const startTime = Date.now();
  
  // Run all tests
  const serverConnected = await testServerConnectivity();
  const authWorking = serverConnected ? await testAuthentication() : false;
  const dataWorking = serverConnected ? await testDataEndpoints() : false;
  const frontendWorking = await testFrontendEnvironment();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`\n${colors.bold}${colors.yellow}=== Test Summary ===${colors.reset}`);
  
  const allTestsPassed = serverConnected && authWorking && dataWorking && frontendWorking;
  
  if (allTestsPassed) {
    console.log(`${colors.bold}${colors.green}🎉 All Tests Passed!${colors.reset}`);
    console.log(`${colors.green}✅ Backend server: Connected${colors.reset}`);
    console.log(`${colors.green}✅ Authentication: Working${colors.reset}`);
    console.log(`${colors.green}✅ Data endpoints: Working${colors.reset}`);
    console.log(`${colors.green}✅ Frontend: Running${colors.reset}`);
    console.log(`\n${colors.bold}${colors.green}🚀 Your API integration is working perfectly!${colors.reset}`);
    console.log(`${colors.blue}Visit: http://localhost:3001/test-api${colors.reset}`);
  } else {
    console.log(`${colors.bold}${colors.red}❌ Some Tests Failed${colors.reset}`);
    console.log(`${colors.red}Backend server: ${serverConnected ? '✅' : '❌'}${colors.reset}`);
    console.log(`${colors.red}Authentication: ${authWorking ? '✅' : '❌'}${colors.reset}`);
    console.log(`${colors.red}Data endpoints: ${dataWorking ? '✅' : '❌'}${colors.reset}`);
    console.log(`${colors.red}Frontend: ${frontendWorking ? '✅' : '❌'}${colors.reset}`);
    
    console.log(`\n${colors.yellow}Troubleshooting:${colors.reset}`);
    if (!serverConnected) {
      console.log(`${colors.yellow}• Start the Express server: cd server && npm run dev${colors.reset}`);
    }
    if (!frontendWorking) {
      console.log(`${colors.yellow}• Start the Next.js frontend: cd client/key-management && npm run dev${colors.reset}`);
    }
  }
  
  console.log(`\n${colors.blue}Total time: ${duration}s${colors.reset}`);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
