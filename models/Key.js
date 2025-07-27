import mongoose from 'mongoose';

const KeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  labName: {
    type: String,
    required: true,
    trim: true
  },
  labNumber: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Physics', 'Chemistry', 'Mathematics']
  },
  description: {
    type: String,
    trim: true
  },
  keyType: {
    type: String,
    enum: ['lab', 'office', 'storage', 'equipment'],
    default: 'lab'
  },
  location: {
    building: String,
    floor: String,
    room: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Security features
  requiresApproval: {
    type: Boolean,
    default: false
  },
  maxAssignmentDuration: {
    type: Number, // in hours
    default: 24
  },
  // Tracking
  totalAssignments: {
    type: Number,
    default: 0
  },
  currentStatus: {
    type: String,
    enum: ['available', 'assigned', 'maintenance', 'lost'],
    default: 'available'
  }
}, {
  timestamps: true
});

// Indexes for better performance
KeySchema.index({ department: 1, isActive: 1 });
KeySchema.index({ labNumber: 1 });
KeySchema.index({ currentStatus: 1 });
KeySchema.index({ 'location.building': 1 }); // Index for block-wise queries
KeySchema.index({ 'location.building': 1, department: 1 }); // Compound index for block + department queries

// Virtual for current assignment
KeySchema.virtual('currentAssignment', {
  ref: 'KeyAssignment',
  localField: '_id',
  foreignField: 'keyId',
  justOne: true,
  match: { status: { $in: ['active', 'overdue'] } }
});

// Methods
KeySchema.methods.isAvailable = function() {
  return this.currentStatus === 'available' && this.isActive;
};

KeySchema.methods.getUsageStats = async function() {
  const KeyAssignment = mongoose.model('KeyAssignment');
  const stats = await KeyAssignment.aggregate([
    { $match: { keyId: this._id } },
    {
      $group: {
        _id: null,
        totalAssignments: { $sum: 1 },
        averageDuration: { $avg: '$actualDuration' },
        overdueCount: {
          $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalAssignments: 0,
    averageDuration: 0,
    overdueCount: 0
  };
};

// Static methods
KeySchema.statics.findByDepartment = function(department) {
  return this.find({ department, isActive: true });
};

KeySchema.statics.getAvailableKeys = function(department = null) {
  const query = { currentStatus: 'available', isActive: true };
  if (department) query.department = department;
  return this.find(query);
};

// Block-wise management methods
KeySchema.statics.findByBlock = function(building) {
  return this.find({ 'location.building': building, isActive: true });
};

KeySchema.statics.getAvailableKeysByBlock = function(building) {
  return this.find({
    'location.building': building,
    currentStatus: 'available',
    isActive: true
  });
};

KeySchema.statics.getBlockSummary = async function() {
  const summary = await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$location.building',
        totalKeys: { $sum: 1 },
        availableKeys: {
          $sum: { $cond: [{ $eq: ['$currentStatus', 'available'] }, 1, 0] }
        },
        assignedKeys: {
          $sum: { $cond: [{ $eq: ['$currentStatus', 'assigned'] }, 1, 0] }
        },
        maintenanceKeys: {
          $sum: { $cond: [{ $eq: ['$currentStatus', 'maintenance'] }, 1, 0] }
        },
        departments: { $addToSet: '$department' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return summary;
};

KeySchema.statics.getDepartmentSummaryByBlock = async function(building) {
  const summary = await this.aggregate([
    { $match: { 'location.building': building, isActive: true } },
    {
      $group: {
        _id: '$department',
        totalKeys: { $sum: 1 },
        availableKeys: {
          $sum: { $cond: [{ $eq: ['$currentStatus', 'available'] }, 1, 0] }
        },
        assignedKeys: {
          $sum: { $cond: [{ $eq: ['$currentStatus', 'assigned'] }, 1, 0] }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return summary;
};

// Pre-save middleware
KeySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Post-save middleware to update total assignments
KeySchema.post('save', async function(doc) {
  if (doc.isNew) {
    // Log key creation
    console.log(`New key created: ${doc.name} for ${doc.department}`);
  }
});

export default mongoose.models.Key || mongoose.model('Key', KeySchema);
