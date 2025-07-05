import mongoose, { Schema, Document } from 'mongoose';
import { Notification as INotification, NotificationType, NotificationStatus } from '@/types';

export interface NotificationDocument extends INotification, Document {}

const NotificationSchema = new Schema<NotificationDocument>({
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: [true, 'Notification type is required']
  },
  recipient: {
    type: String,
    required: [true, 'Recipient is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  data: {
    type: Schema.Types.Mixed,
    default: null
  },
  status: {
    type: String,
    enum: Object.values(NotificationStatus),
    default: NotificationStatus.PENDING
  },
  sentAt: {
    type: Date,
    default: null
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  nextRetryAt: {
    type: Date,
    default: null
  },
  errorMessage: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  templateId: {
    type: String,
    trim: true
  },
  metadata: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    keyId: {
      type: Schema.Types.ObjectId,
      ref: 'Key'
    },
    logId: {
      type: Schema.Types.ObjectId,
      ref: 'KeyLog'
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department'
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ recipient: 1 });
NotificationSchema.index({ status: 1 });
NotificationSchema.index({ sentAt: 1 });
NotificationSchema.index({ priority: 1 });
NotificationSchema.index({ nextRetryAt: 1 });

// Compound indexes
NotificationSchema.index({ status: 1, nextRetryAt: 1 });
NotificationSchema.index({ type: 1, status: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });

// Virtual to check if notification can be retried
NotificationSchema.virtual('canRetry').get(function() {
  return this.status === NotificationStatus.FAILED && 
         this.attempts < this.maxAttempts &&
         (!this.nextRetryAt || new Date() >= this.nextRetryAt);
});

// Virtual to format sent date
NotificationSchema.virtual('formattedSentAt').get(function() {
  return this.sentAt ? this.sentAt.toLocaleString() : 'Not sent';
});

// Static method to get pending notifications
NotificationSchema.statics.getPendingNotifications = function(type?: NotificationType) {
  const query: any = { status: NotificationStatus.PENDING };
  if (type) {
    query.type = type;
  }
  return this.find(query).sort({ priority: -1, createdAt: 1 });
};

// Static method to get failed notifications that can be retried
NotificationSchema.statics.getRetryableNotifications = function() {
  return this.find({
    status: NotificationStatus.FAILED,
    $expr: { $lt: ['$attempts', '$maxAttempts'] },
    $or: [
      { nextRetryAt: { $exists: false } },
      { nextRetryAt: null },
      { nextRetryAt: { $lte: new Date() } }
    ]
  }).sort({ priority: -1, createdAt: 1 });
};

// Instance method to mark as sent
NotificationSchema.methods.markAsSent = function() {
  this.status = NotificationStatus.SENT;
  this.sentAt = new Date();
  return this.save();
};

// Instance method to mark as failed
NotificationSchema.methods.markAsFailed = function(errorMessage: string, retryDelay: number = 300000) {
  this.status = NotificationStatus.FAILED;
  this.attempts += 1;
  this.errorMessage = errorMessage;
  
  if (this.attempts < this.maxAttempts) {
    this.nextRetryAt = new Date(Date.now() + retryDelay);
  }
  
  return this.save();
};

export default mongoose.models.Notification || mongoose.model<NotificationDocument>('Notification', NotificationSchema);
