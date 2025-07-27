#!/usr/bin/env node

import mongoose from 'mongoose';
import { config } from 'dotenv';
import Key from '../models/Key.js';

// Load environment variables
config({ path: '.env' });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Logging functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  header: (msg) => console.log(`${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  separator: () => console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`)
};

// Database connection function
async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in .env file');
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    log.success('Connected to MongoDB successfully');
  } catch (error) {
    log.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
}

// Function to verify block keys
async function verifyBlockKeys() {
  try {
    log.separator();
    log.header('🔑 VNR VJIET Key Management System - Block Keys Verification');
    log.separator();
    
    // Connect to database
    await connectDB();
    
    // Get overall summary
    const totalKeys = await Key.countDocuments({ isActive: true });
    log.info(`Total active keys in database: ${totalKeys}`);
    
    // Get block summary using the new method
    const blockSummary = await Key.getBlockSummary();
    
    log.header('📊 Block-wise Summary');
    log.separator();
    
    let totalVerified = 0;
    
    for (const block of blockSummary) {
      const building = block._id;
      const { totalKeys, availableKeys, assignedKeys, maintenanceKeys, departments } = block;
      
      log.header(`🏢 ${building}`);
      log.info(`  Total Keys: ${totalKeys}`);
      log.success(`  Available: ${availableKeys}`);
      log.warning(`  Assigned: ${assignedKeys}`);
      log.error(`  Maintenance: ${maintenanceKeys}`);
      log.info(`  Departments: ${departments.join(', ')}`);
      
      // Get department breakdown for this block
      const deptSummary = await Key.getDepartmentSummaryByBlock(building);
      log.info('  Department Breakdown:');
      
      for (const dept of deptSummary) {
        log.info(`    ${dept._id}: ${dept.totalKeys} total (${dept.availableKeys} available, ${dept.assignedKeys} assigned)`);
      }
      
      totalVerified += totalKeys;
      log.separator();
    }
    
    // Verification summary
    log.header('✅ Verification Summary');
    log.info(`Total keys verified: ${totalVerified}`);
    log.info(`Expected keys: 300 (50 per block × 6 blocks)`);
    
    if (totalVerified === 300) {
      log.success('✅ All block keys are properly imported and verified!');
    } else {
      log.error(`❌ Key count mismatch! Expected 300, found ${totalVerified}`);
    }
    
    // Check for any keys without proper block assignment
    const keysWithoutBuilding = await Key.countDocuments({
      isActive: true,
      $or: [
        { 'location.building': { $exists: false } },
        { 'location.building': null },
        { 'location.building': '' }
      ]
    });
    
    if (keysWithoutBuilding > 0) {
      log.warning(`Found ${keysWithoutBuilding} keys without proper building assignment`);
    } else {
      log.success('All keys have proper building assignments');
    }
    
    // Sample keys from each block
    log.header('📋 Sample Keys from Each Block');
    for (const block of blockSummary) {
      const building = block._id;
      const sampleKeys = await Key.find({ 'location.building': building, isActive: true })
        .limit(3)
        .select('name labNumber department location.floor currentStatus');
      
      log.info(`${building} samples:`);
      sampleKeys.forEach(key => {
        log.info(`  - ${key.name} (${key.labNumber}) - ${key.department} - ${key.currentStatus}`);
      });
    }
    
  } catch (error) {
    log.error(`Verification failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log.info('Database connection closed');
  }
}

// Run the verification
verifyBlockKeys();
