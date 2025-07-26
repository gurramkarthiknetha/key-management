import mongoose from 'mongoose';

const KeyAssignmentSchema = new mongoose.Schema({
  keyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Key',
    required: true
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnedDate: {
    type: Date
  },
  accessType: {
    type: String,
    enum: ['permanent', 'temporary', 'shared'],
    default: 'temporary'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'returned', 'overdue', 'cancelled'],
    default: 'pending'
  },
  requestReason: {
    type: String,
    trim: true
  },
  returnReason: {
    type: String,
    trim: true
  },
  // QR Code tracking
  qrCodeGenerated: {
    type: Boolean,
    default: false
  },
  qrCodeGeneratedAt: {
    type: Date
  },
  qrCodeUsedAt: {
    type: Date
  },
  // Collection/Return tracking
  collectedAt: {
    type: Date
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Security personnel
  },
  returnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Security personnel
  },
  // Usage tracking
  lastUsed: {
    type: Date
  },
  usageCount: {
    type: Number,
    default: 0
  },
  actualDuration: {
    type: Number // in hours
  },
  // Notifications
  remindersSent: {
    type: Number,
    default: 0
  },
  lastReminderSent: {
    type: Date
  },
  // Approval workflow
  approvalRequired: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
KeyAssignmentSchema.index({ facultyId: 1, status: 1 });
KeyAssignmentSchema.index({ keyId: 1, status: 1 });
KeyAssignmentSchema.index({ dueDate: 1, status: 1 });
KeyAssignmentSchema.index({ status: 1, assignedDate: -1 });

// Virtual for checking if overdue
KeyAssignmentSchema.virtual('isOverdue').get(function() {
  return this.status === 'active' && new Date() > this.dueDate;
});

// Virtual for days overdue
KeyAssignmentSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  const diffTime = new Date() - this.dueDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for assignment duration
KeyAssignmentSchema.virtual('plannedDuration').get(function() {
  const diffTime = this.dueDate - this.assignedDate;
  return Math.ceil(diffTime / (1000 * 60 * 60)); // in hours
});

// Methods
KeyAssignmentSchema.methods.markAsCollected = function(securityPersonnelId) {
  this.status = 'active';
  this.collectedAt = new Date();
  this.collectedBy = securityPersonnelId;
  this.qrCodeUsedAt = new Date();
  return this.save();
};

KeyAssignmentSchema.methods.markAsReturned = function(securityPersonnelId, returnReason = '') {
  this.status = 'returned';
  this.returnedDate = new Date();
  this.returnedBy = securityPersonnelId;
  this.returnReason = returnReason;
  
  // Calculate actual duration
  if (this.collectedAt) {
    const diffTime = this.returnedDate - this.collectedAt;
    this.actualDuration = Math.ceil(diffTime / (1000 * 60 * 60));
  }
  
  return this.save();
};

KeyAssignmentSchema.methods.generateQRCode = function() {
  this.qrCodeGenerated = true;
  this.qrCodeGeneratedAt = new Date();
  return this.save();
};

KeyAssignmentSchema.methods.sendReminder = async function() {
  this.remindersSent += 1;
  this.lastReminderSent = new Date();
  await this.save();
  
  // Here you would integrate with your email service
  // emailService.sendOverdueReminder(...)
};

// Static methods
KeyAssignmentSchema.statics.findOverdue = function() {
  return this.find({
    status: 'active',
    dueDate: { $lt: new Date() }
  }).populate('keyId facultyId');
};

KeyAssignmentSchema.statics.findByFaculty = function(facultyId, status = null) {
  const query = { facultyId };
  if (status) query.status = status;
  return this.find(query).populate('keyId');
};

KeyAssignmentSchema.statics.getDepartmentStats = function(department) {
  return this.aggregate([
    {
      $lookup: {
        from: 'keys',
        localField: 'keyId',
        foreignField: '_id',
        as: 'key'
      }
    },
    {
      $match: {
        'key.department': department
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDuration: { $avg: '$actualDuration' }
      }
    }
  ]);
};

// Pre-save middleware
KeyAssignmentSchema.pre('save', function(next) {
  // Auto-update status to overdue if past due date
  if (this.status === 'active' && new Date() > this.dueDate) {
    this.status = 'overdue';
  }
  next();
});

// Post-save middleware
KeyAssignmentSchema.post('save', async function(doc) {
  // Update key's current status
  const Key = mongoose.model('Key');
  const key = await Key.findById(doc.keyId);
  
  if (key) {
    if (doc.status === 'active' || doc.status === 'overdue') {
      key.currentStatus = 'assigned';
    } else if (doc.status === 'returned' || doc.status === 'cancelled') {
      key.currentStatus = 'available';
    }
    await key.save();
  }
});

export default mongoose.models.KeyAssignment || mongoose.model('KeyAssignment', KeyAssignmentSchema);
