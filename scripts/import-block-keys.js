#!/usr/bin/env node

import mongoose from 'mongoose';
import { config } from 'dotenv';
import Key from '../models/Key.js';
import User from '../models/User.js';
import blockKeysData, { blockSummary } from '../data/block-keys-seed.js';

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

  log.info('Connecting to MongoDB...');
  
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

// Function to find or create security head user
async function ensureSecurityHead() {
  let securityHead = await User.findOne({ role: 'security_head' });
  
  if (!securityHead) {
    log.warning('No security head user found. Creating default security head...');
    
    securityHead = new User({
      email: 'security.head@vnrvjiet.in',
      name: 'Security Head',
      employeeId: 'SEC001',
      role: 'security_head',
      department: 'Security',
      isActive: true
    });
    
    await securityHead.save();
    log.success('Created default security head user');
  }
  
  return securityHead;
}

// Function to import keys for a specific block
async function importBlockKeys(blockCode, blockData, securityHead, options = {}) {
  const { building, keys } = blockData;
  const { dryRun = false, skipExisting = true } = options;
  
  log.header(`Importing keys for ${building} (${blockCode})`);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const keyData of keys) {
    try {
      // Check if key already exists
      const existingKey = await Key.findOne({
        labNumber: keyData.labNumber,
        department: keyData.department
      });
      
      if (existingKey && skipExisting) {
        log.warning(`Key ${keyData.labNumber} already exists, skipping...`);
        skipped++;
        continue;
      }
      
      if (!dryRun) {
        // Create the key
        const key = new Key({
          ...keyData,
          createdBy: securityHead._id
        });
        
        await key.save();
        log.success(`Created key: ${key.name} (${key.labNumber})`);
      } else {
        log.info(`[DRY RUN] Would create key: ${keyData.name} (${keyData.labNumber})`);
      }
      
      imported++;
      
    } catch (error) {
      log.error(`Failed to create key ${keyData.labNumber}: ${error.message}`);
      errors++;
    }
  }
  
  return { imported, skipped, errors };
}

// Function to validate seed data
function validateSeedData() {
  log.header('Validating seed data...');
  
  const issues = [];
  
  // Check total number of keys
  if (blockSummary.totalKeys !== 300) {
    issues.push(`Expected 300 total keys, found ${blockSummary.totalKeys}`);
  }
  
  // Check each block has 50 keys
  Object.entries(blockSummary.keysByBlock).forEach(([blockCode, blockInfo]) => {
    if (blockInfo.count !== 50) {
      issues.push(`${blockCode} has ${blockInfo.count} keys, expected 50`);
    }
  });
  
  // Check for duplicate lab numbers
  const allKeys = Object.values(blockKeysData).flatMap(block => block.keys);
  const labNumbers = allKeys.map(key => key.labNumber);
  const duplicates = labNumbers.filter((item, index) => labNumbers.indexOf(item) !== index);
  
  if (duplicates.length > 0) {
    issues.push(`Duplicate lab numbers found: ${[...new Set(duplicates)].join(', ')}`);
  }
  
  if (issues.length > 0) {
    log.error('Validation failed:');
    issues.forEach(issue => log.error(`  - ${issue}`));
    return false;
  }
  
  log.success('Seed data validation passed');
  return true;
}

// Main import function
async function importAllKeys(options = {}) {
  const { 
    dryRun = false, 
    skipExisting = true, 
    blocksToImport = Object.keys(blockKeysData),
    clearExisting = false 
  } = options;
  
  try {
    log.separator();
    log.header('🔑 VNR VJIET Key Management System - Block Keys Import');
    log.separator();
    
    // Validate seed data
    if (!validateSeedData()) {
      process.exit(1);
    }
    
    // Connect to database
    await connectDB();
    
    // Ensure security head exists
    const securityHead = await ensureSecurityHead();
    log.info(`Using security head: ${securityHead.name} (${securityHead.email})`);
    
    // Clear existing keys if requested
    if (clearExisting && !dryRun) {
      log.warning('Clearing existing keys...');
      const deleteResult = await Key.deleteMany({});
      log.info(`Deleted ${deleteResult.deletedCount} existing keys`);
    }
    
    // Import summary
    const summary = {
      totalImported: 0,
      totalSkipped: 0,
      totalErrors: 0,
      blockResults: {}
    };
    
    // Import keys for each specified block
    for (const blockCode of blocksToImport) {
      if (!blockKeysData[blockCode]) {
        log.error(`Block ${blockCode} not found in seed data`);
        continue;
      }
      
      const result = await importBlockKeys(
        blockCode, 
        blockKeysData[blockCode], 
        securityHead, 
        { dryRun, skipExisting }
      );
      
      summary.totalImported += result.imported;
      summary.totalSkipped += result.skipped;
      summary.totalErrors += result.errors;
      summary.blockResults[blockCode] = result;
      
      log.separator();
    }
    
    // Display final summary
    log.header('📊 Import Summary');
    log.info(`Total keys processed: ${summary.totalImported + summary.totalSkipped + summary.totalErrors}`);
    log.success(`Successfully imported: ${summary.totalImported}`);
    
    if (summary.totalSkipped > 0) {
      log.warning(`Skipped (already exist): ${summary.totalSkipped}`);
    }
    
    if (summary.totalErrors > 0) {
      log.error(`Failed to import: ${summary.totalErrors}`);
    }
    
    // Block-wise summary
    log.header('📋 Block-wise Results');
    Object.entries(summary.blockResults).forEach(([blockCode, result]) => {
      const blockInfo = blockSummary.keysByBlock[blockCode];
      log.info(`${blockInfo.building}: ${result.imported} imported, ${result.skipped} skipped, ${result.errors} errors`);
    });
    
    if (dryRun) {
      log.header('🔍 This was a dry run - no changes were made to the database');
    } else {
      log.header('🎉 Key import completed successfully!');
    }
    
  } catch (error) {
    log.error(`Import failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log.info('Database connection closed');
  }
}

// Command line interface
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    skipExisting: !args.includes('--overwrite'),
    clearExisting: args.includes('--clear'),
    blocksToImport: Object.keys(blockKeysData)
  };
  
  // Parse specific blocks
  const blockArg = args.find(arg => arg.startsWith('--blocks='));
  if (blockArg) {
    const blocks = blockArg.split('=')[1].split(',').map(b => b.trim().toUpperCase());
    options.blocksToImport = blocks.filter(b => blockKeysData[`${b}_BLOCK`]).map(b => `${b}_BLOCK`);
  }
  
  return options;
}

// Help function
function showHelp() {
  console.log(`
${colors.bright}VNR VJIET Key Management - Block Keys Import${colors.reset}

Usage: npm run import:keys [options]

Options:
  --dry-run          Show what would be imported without making changes
  --overwrite        Overwrite existing keys (default: skip existing)
  --clear            Clear all existing keys before import
  --blocks=A,B,C     Import only specific blocks (A,B,C,D,PG,E)
  --help             Show this help message

Examples:
  npm run import:keys                    # Import all blocks, skip existing
  npm run import:keys -- --dry-run       # Preview import without changes
  npm run import:keys -- --blocks=A,B    # Import only A and B blocks
  npm run import:keys -- --clear         # Clear existing and import all
`);
}

// Main execution
if (process.argv.includes('--help')) {
  showHelp();
  process.exit(0);
}

const options = parseArguments();
importAllKeys(options);
