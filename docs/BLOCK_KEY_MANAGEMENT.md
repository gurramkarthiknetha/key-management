# Block-wise Key Management System

## Overview

The VNR VJIET Key Management System now supports comprehensive block-wise key allocation with 300 lab keys distributed across 6 blocks. This system allows the Security Incharge to efficiently manage keys by building blocks and assign them to faculty members.

## Block Distribution

### Total Keys: 300 (50 keys per block)

| Block | Building | Departments | Key Count |
|-------|----------|-------------|-----------|
| A Block | A Block | Computer Science, Information Technology | 50 |
| B Block | B Block | Electronics, Information Technology | 50 |
| C Block | C Block | Mechanical, Civil | 50 |
| D Block | D Block | Chemical, Physics, Chemistry | 50 |
| PG Block | PG Block | Computer Science, Electronics, Mechanical | 50 |
| E Block | E Block | Mathematics, Physics, Chemistry | 50 |

## Key Import System

### Quick Start
To import all block keys into the database:

```bash
npm run import:keys
```

### Import Options

#### Basic Import
```bash
npm run import:keys                    # Import all blocks, skip existing keys
```

#### Preview Import (Dry Run)
```bash
npm run import:keys -- --dry-run       # Preview what would be imported
```

#### Import Specific Blocks
```bash
npm run import:keys -- --blocks=A,B,C  # Import only A, B, and C blocks
```

#### Clear and Re-import
```bash
npm run import:keys -- --clear         # Clear existing keys and import all
```

#### Overwrite Existing Keys
```bash
npm run import:keys -- --overwrite     # Overwrite existing keys instead of skipping
```

### Verification

To verify the imported keys:

```bash
node scripts/verify-block-keys.js
```

This will show:
- Total keys per block
- Available vs assigned keys
- Department-wise breakdown
- Sample keys from each block

## Key Features

### 1. Block-wise Organization
- Keys are organized by building blocks (A, B, C, D, PG, E)
- Each block contains labs from specific departments
- Room numbers follow block-specific naming conventions (e.g., A101, B205, C301)

### 2. Department Distribution
- **A Block**: Computer Science (25 keys) + Information Technology (25 keys)
- **B Block**: Electronics (25 keys) + Information Technology (25 keys)
- **C Block**: Mechanical (25 keys) + Civil (25 keys)
- **D Block**: Chemical (17 keys) + Physics (17 keys) + Chemistry (16 keys)
- **PG Block**: Computer Science (17 keys) + Electronics (17 keys) + Mechanical (16 keys)
- **E Block**: Mathematics (17 keys) + Physics (17 keys) + Chemistry (16 keys)

### 3. Lab Types by Department

#### Computer Science Labs
- Programming Lab, Software Engineering Lab, Database Lab, Network Lab
- AI/ML Lab, Cybersecurity Lab, Web Development Lab, Mobile App Lab
- Data Structures Lab, Operating Systems Lab, Computer Graphics Lab, IoT Lab

#### Information Technology Labs
- IT Lab, Network Administration Lab, System Administration Lab
- Cloud Computing Lab, DevOps Lab, IT Security Lab
- Enterprise Systems Lab, Digital Forensics Lab

#### Electronics Labs
- Digital Electronics Lab, Analog Electronics Lab, Microprocessor Lab
- VLSI Lab, Communication Systems Lab, Signal Processing Lab
- Embedded Systems Lab, PCB Design Lab

#### Other Departments
- Mechanical: Manufacturing, CAD/CAM, Thermal Engineering, Robotics, etc.
- Civil: Structural Engineering, Geotechnical, Transportation, etc.
- Chemical: Process Engineering, Unit Operations, Safety Engineering, etc.
- Physics: Optics, Quantum Physics, Nuclear Physics, Laser Lab, etc.
- Chemistry: Organic, Inorganic, Physical, Analytical Chemistry, etc.
- Mathematics: Statistics, Computational Mathematics, Operations Research, etc.

## Key Assignment Features

### 1. Faculty Assignment
- Security Incharge can assign keys to registered faculty members
- Faculty selection from dropdown list of registered users
- Assignment tracking with timestamps and duration

### 2. Key Properties
- **Approval Requirements**: Some keys require approval (every 3rd key)
- **Assignment Duration**: Varies between 24, 48, and 72 hours
- **Key Status**: Available, Assigned, Maintenance, Lost
- **Key Types**: Lab, Office, Storage, Equipment

### 3. Faculty Profile Access
- View assigned faculty member's profile
- Access faculty contact information
- Track assignment history

## Database Schema Enhancements

### New Indexes for Block Management
```javascript
// Indexes for efficient block-wise queries
KeySchema.index({ 'location.building': 1 });
KeySchema.index({ 'location.building': 1, department: 1 });
```

### New Static Methods
```javascript
// Get all keys for a specific block
Key.findByBlock('A Block')

// Get available keys for a block
Key.getAvailableKeysByBlock('A Block')

// Get summary of all blocks
Key.getBlockSummary()

// Get department summary for a specific block
Key.getDepartmentSummaryByBlock('A Block')
```

## Security Features

### 1. Access Control
- Only Security Incharge can import keys
- Faculty can only view their assigned keys
- Assignment approval workflow for sensitive labs

### 2. Audit Trail
- All key assignments are logged
- Transaction history maintained
- Assignment duration tracking

### 3. Key Status Management
- Real-time status updates (Available/Assigned/Maintenance/Lost)
- Overdue key tracking
- Automatic status changes based on return dates

## Usage Examples

### For Security Incharge

1. **Import all block keys**:
   ```bash
   npm run import:keys
   ```

2. **Check import status**:
   ```bash
   node scripts/verify-block-keys.js
   ```

3. **Import specific blocks only**:
   ```bash
   npm run import:keys -- --blocks=A,B
   ```

### For System Administrators

1. **Preview import without changes**:
   ```bash
   npm run import:keys -- --dry-run
   ```

2. **Clear and re-import all keys**:
   ```bash
   npm run import:keys -- --clear
   ```

## File Structure

```
key-management/
├── data/
│   └── block-keys-seed.js          # Seed data for all 300 block keys
├── scripts/
│   ├── import-block-keys.js        # Main import script
│   └── verify-block-keys.js        # Verification script
├── models/
│   └── Key.js                      # Enhanced Key model with block methods
└── docs/
    └── BLOCK_KEY_MANAGEMENT.md     # This documentation
```

## Support

For any issues with the block key management system:

1. Check the verification script output
2. Review the import logs for errors
3. Ensure all environment variables are properly set
4. Contact the system administrator for database issues

## Next Steps

1. **Faculty Assignment Interface**: Implement web interface for key assignments
2. **Mobile App Integration**: QR code scanning for key collection/return
3. **Notification System**: Email/SMS alerts for overdue keys
4. **Reporting Dashboard**: Analytics and usage reports for Security Incharge
