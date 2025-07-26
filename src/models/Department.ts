import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  _id: string;
  name: string;
  code: string;
  hodId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    uppercase: true
  },
  hodId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
DepartmentSchema.index({ name: 1 });
DepartmentSchema.index({ code: 1 });
DepartmentSchema.index({ isActive: 1 });

const Department = mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);

export default Department;
