import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['faculty', 'hod', 'security', 'security_head', 'admin'],
    default: 'faculty'
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  googleId: {
    type: String,
    default: null
  },
  password: {
    type: String,
    default: null
  },
  profileImage: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  passwordResetRequired: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
// Note: email and employeeId indexes are automatically created due to unique: true
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to update the updatedAt field
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance methods
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.__v;
  return user;
};

userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByEmployeeId = function(employeeId) {
  return this.findOne({ employeeId });
};

userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

userSchema.statics.findByDepartment = function(department) {
  return this.find({ department, isActive: true });
};

userSchema.statics.findByGoogleId = function(googleId) {
  return this.findOne({ googleId });
};

// Virtual for full name (if needed)
userSchema.virtual('displayName').get(function() {
  return this.name;
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
