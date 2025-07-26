import mongoose from 'mongoose';

const KeySharingSchema = new mongoose.Schema({
  keyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Key',
    required: true
  },
  sharedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedDate: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  duration: {
    type: String,
    required: true // e.g., "4 hours", "2 days"
  },
  message: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked', 'cancelled'],
    default: 'active'
  },
  // Usage tracking
  accessCount: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date
  },
  // Revocation details
  revokedAt: {
    type: Date
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  revocationReason: {
    type: String
  },
  // Cancellation details
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String
  },
  // Notification tracking
  notificationsSent: {
    type: Number,
    default: 0
  },
  lastNotificationSent: {
    type: Date
  },
  // Access permissions
  permissions: {
    canCollect: {
      type: Boolean,
      default: true
    },
    canReturn: {
      type: Boolean,
      default: true
    },
    canDelegate: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
KeySharingSchema.index({ sharedBy: 1, status: 1 });
KeySharingSchema.index({ sharedWith: 1, status: 1 });
KeySharingSchema.index({ keyId: 1, status: 1 });
KeySharingSchema.index({ expiresAt: 1, status: 1 });

// Virtual for checking if expired
KeySharingSchema.virtual('isExpired').get(function() {
  return this.status === 'active' && new Date() > this.expiresAt;
});

// Virtual for time remaining
KeySharingSchema.virtual('timeRemaining').get(function() {
  if (this.status !== 'active') return null;
  
  const now = new Date();
  const remaining = this.expiresAt - now;
  
  if (remaining <= 0) return 'Expired';
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
});

// Virtual for sharing duration in hours
KeySharingSchema.virtual('durationInHours').get(function() {
  const diffTime = this.expiresAt - this.sharedDate;
  return Math.ceil(diffTime / (1000 * 60 * 60));
});

// Methods
KeySharingSchema.methods.recordAccess = function() {
  this.accessCount += 1;
  this.lastAccessed = new Date();
  return this.save();
};

KeySharingSchema.methods.revoke = function(revokedBy, reason = '') {
  this.status = 'revoked';
  this.revokedAt = new Date();
  this.revokedBy = revokedBy;
  this.revocationReason = reason;
  return this.save();
};

KeySharingSchema.methods.cancel = function(cancelledBy, reason = '') {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelledBy = cancelledBy;
  this.cancellationReason = reason;
  return this.save();
};

KeySharingSchema.methods.extend = function(additionalHours) {
  if (this.status !== 'active') {
    throw new Error('Cannot extend inactive sharing');
  }
  
  const newExpiryTime = new Date(this.expiresAt.getTime() + (additionalHours * 60 * 60 * 1000));
  this.expiresAt = newExpiryTime;
  
  // Update duration string
  const totalHours = this.durationInHours + additionalHours;
  this.duration = `${totalHours} hours`;
  
  return this.save();
};

KeySharingSchema.methods.sendNotification = async function(type = 'reminder') {
  this.notificationsSent += 1;
  this.lastNotificationSent = new Date();
  await this.save();
  
  // Here you would integrate with your notification service
  console.log(`Notification sent for sharing ${this._id}: ${type}`);
};

// Static methods
KeySharingSchema.statics.findActive = function() {
  return this.find({
    status: 'active',
    expiresAt: { $gt: new Date() }
  }).populate('keyId sharedBy sharedWith');
};

KeySharingSchema.statics.findExpired = function() {
  return this.find({
    status: 'active',
    expiresAt: { $lte: new Date() }
  }).populate('keyId sharedBy sharedWith');
};

KeySharingSchema.statics.findByUser = function(userId, type = 'all') {
  let query = {};
  
  switch (type) {
    case 'shared_by':
      query.sharedBy = userId;
      break;
    case 'shared_with':
      query.sharedWith = userId;
      break;
    default:
      query.$or = [
        { sharedBy: userId },
        { sharedWith: userId }
      ];
  }
  
  return this.find(query)
    .populate('keyId', 'name labName labNumber')
    .populate('sharedBy', 'name email')
    .populate('sharedWith', 'name email')
    .sort({ sharedDate: -1 });
};

KeySharingSchema.statics.getKeyShares = function(keyId) {
  return this.find({ keyId, status: 'active' })
    .populate('sharedBy', 'name email')
    .populate('sharedWith', 'name email')
    .sort({ sharedDate: -1 });
};

KeySharingSchema.statics.getSharingStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        sharedDate: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$sharedDate" } },
          status: "$status"
        },
        count: { $sum: 1 },
        totalAccessCount: { $sum: "$accessCount" }
      }
    },
    {
      $group: {
        _id: "$_id.date",
        statuses: {
          $push: {
            status: "$_id.status",
            count: "$count",
            totalAccess: "$totalAccessCount"
          }
        },
        totalShares: { $sum: "$count" }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

// Pre-save middleware
KeySharingSchema.pre('save', function(next) {
  // Auto-update status to expired if past expiry date
  if (this.status === 'active' && new Date() > this.expiresAt) {
    this.status = 'expired';
  }
  next();
});

// Post-save middleware
KeySharingSchema.post('save', async function(doc) {
  // Log sharing activity
  if (doc.isNew) {
    const KeyTransaction = mongoose.model('KeyTransaction');
    await KeyTransaction.create({
      type: 'shared',
      keyId: doc.keyId,
      facultyId: doc.sharedBy,
      sharedWith: doc.sharedWith,
      sharedDuration: doc.duration,
      sharingMessage: doc.message,
      details: `Key shared for ${doc.duration}`
    });
  }
});

// Cleanup expired shares (run periodically)
KeySharingSchema.statics.cleanupExpired = async function() {
  const expiredShares = await this.find({
    status: 'active',
    expiresAt: { $lte: new Date() }
  });
  
  for (const share of expiredShares) {
    share.status = 'expired';
    await share.save();
  }
  
  return expiredShares.length;
};

export default mongoose.models.KeySharing || mongoose.model('KeySharing', KeySharingSchema);
