import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  tenantId: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'employer' | 'admin' | 'supervisor' | 'hr' | 'employee' | 'prospect';
  avatar?: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  employeeInfo?: {
    employeeId?: string;
    department?: string;
    designation?: string;
    joiningDate?: Date;
    reportingTo?: mongoose.Types.ObjectId;
    employmentType?: 'full-time' | 'part-time' | 'contract' | 'intern';
    salary?: number;
  };
  visaInfo?: {
    type?: string;
    number?: string;
    expiryDate?: Date;
    status?: 'active' | 'expired' | 'pending';
  };
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  otp?: string;
  otpExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['employer', 'admin', 'supervisor', 'hr', 'employee', 'prospect'],
      default: 'employee',
    },
    avatar: { type: String },
    phone: { type: String },
    dateOfBirth: { type: Date },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    employeeInfo: {
      employeeId: String,
      department: String,
      designation: String,
      joiningDate: Date,
      reportingTo: { type: Schema.Types.ObjectId, ref: 'User' },
      employmentType: { type: String, enum: ['full-time', 'part-time', 'contract', 'intern'] },
      salary: Number,
    },
    visaInfo: {
      type: String,
      number: String,
      expiryDate: Date,
      status: { type: String, enum: ['active', 'expired', 'pending'] },
    },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    refreshToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });
UserSchema.index({ tenantId: 1, role: 1 });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password as string);
};

export default mongoose.model<IUser>('User', UserSchema);
