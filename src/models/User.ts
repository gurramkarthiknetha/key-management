import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  FACULTY = 'faculty',
  SECURITY = 'security',
  SECURITY_INCHARGE = 'security_incharge',
  HOD = 'hod'
}

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  employeeId?: string;
  password?: string; // Optional for Google OAuth users
  role: UserRole;
  department: string;
  isActive: boolean;
  googleId?: string; // For Google OAuth users
  profileImage?: string;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  employeeId: {
    type: String,
    sparse: true, // Allows multiple null values but unique non-null values
    trim: true,
    default: null
  },
  password: {
    type: String,
    // Not required because Google OAuth users won't have passwords
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  googleId: {
    type: String,
    sparse: true // For Google OAuth users
  },
  profileImage: {
    type: String
  },
  qrCode: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ employeeId: 1 });
UserSchema.index({ googleId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ department: 1 });

// Ensure either password or googleId is present
UserSchema.pre('save', function(next) {
  if (!this.password && !this.googleId) {
    next(new Error('User must have either a password or Google ID'));
  } else {
    next();
  }
});

// Create the model
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
