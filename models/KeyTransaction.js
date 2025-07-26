import mongoose from 'mongoose';

const KeyTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['requested', 'approved', 'rejected', 'collected', 'returned', 'shared', 'share_revoked', 'overdue_reminder'],
    required: true
  },
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
  securityPersonnelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KeyAssignment'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  // QR Code related data
  qrCodeData: {
    type: String // Encrypted QR code data
  },
  qrCodeExpiry: {
    type: Date
  },
  // Sharing related fields
  sharedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sharedDuration: {
    type: String // e.g., "4 hours", "2 days"
  },
  sharingMessage: {
    type: String
  },
  // Location and device info
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    deviceType: String // mobile, tablet, desktop
  },
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Approval workflow
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalNotes: {
    type: String
  },
  // Error handling
  errorMessage: {
    type: String
  },
  retryCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
KeyTransactionSchema.index({ facultyId: 1, timestamp: -1 });
KeyTransactionSchema.index({ keyId: 1, timestamp: -1 });
KeyTransactionSchema.index({ type: 1, timestamp: -1 });
KeyTransactionSchema.index({ securityPersonnelId: 1, timestamp: -1 });
KeyTransactionSchema.index({ timestamp: -1 });

// Virtual for formatted timestamp
KeyTransactionSchema.virtual('formattedTimestamp').get(function() {
  return {
    date: this.timestamp.toLocaleDateString(),
    time: this.timestamp.toLocaleTimeString(),
    relative: getRelativeTime(this.timestamp)
  };
});

// Methods
KeyTransactionSchema.methods.markAsCompleted = function(details = '') {
  this.status = 'completed';
  if (details) this.details = details;
  return this.save();
};

KeyTransactionSchema.methods.markAsFailed = function(errorMessage) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  this.retryCount += 1;
  return this.save();
};

KeyTransactionSchema.methods.addMetadata = function(key, value) {
  if (!this.metadata) this.metadata = {};
  this.metadata[key] = value;
  return this.save();
};

// Static methods
KeyTransactionSchema.statics.getRecentActivity = function(limit = 50) {
  return this.find()
    .populate('keyId', 'name labName labNumber')
    .populate('facultyId', 'name email')
    .populate('securityPersonnelId', 'name')
    .sort({ timestamp: -1 })
    .limit(limit);
};

KeyTransactionSchema.statics.getFacultyHistory = function(facultyId, limit = 100) {
  return this.find({ facultyId })
    .populate('keyId', 'name labName labNumber')
    .populate('securityPersonnelId', 'name')
    .sort({ timestamp: -1 })
    .limit(limit);
};

KeyTransactionSchema.statics.getKeyHistory = function(keyId, limit = 100) {
  return this.find({ keyId })
    .populate('facultyId', 'name email')
    .populate('securityPersonnelId', 'name')
    .sort({ timestamp: -1 })
    .limit(limit);
};

KeyTransactionSchema.statics.getDepartmentActivity = function(department, startDate, endDate) {
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
        'key.department': department,
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        latestActivity: { $max: '$timestamp' }
      }
    }
  ]);
};

KeyTransactionSchema.statics.getUsageStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          type: "$type"
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: "$_id.date",
        activities: {
          $push: {
            type: "$_id.type",
            count: "$count"
          }
        },
        totalCount: { $sum: "$count" }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

// Pre-save middleware
KeyTransactionSchema.pre('save', function(next) {
  // Auto-generate details if not provided
  if (!this.details) {
    this.details = generateDefaultDetails(this.type);
  }
  next();
});

// Post-save middleware for notifications
KeyTransactionSchema.post('save', async function(doc) {
  // Send notifications for important events
  if (['overdue_reminder', 'shared', 'collected'].includes(doc.type)) {
    // Trigger notification system
    console.log(`Transaction logged: ${doc.type} for key ${doc.keyId}`);
  }
});

// Helper functions
function getRelativeTime(date) {
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
}

function generateDefaultDetails(type) {
  const defaultDetails = {
    requested: 'Key access requested',
    approved: 'Key request approved',
    rejected: 'Key request rejected',
    collected: 'Key collected from security desk',
    returned: 'Key returned to security desk',
    shared: 'Key access shared with another faculty',
    share_revoked: 'Key sharing access revoked',
    overdue_reminder: 'Overdue reminder sent'
  };
  
  return defaultDetails[type] || 'Key transaction';
}

export default mongoose.models.KeyTransaction || mongoose.model('KeyTransaction', KeyTransactionSchema);
