import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  domain: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  settings: {
    features: {
      timesheets: boolean;
      documents: boolean;
      leaves: boolean;
      analytics: boolean;
      eSignature: boolean;
    };
    workingHours: {
      hoursPerDay: number;
      daysPerWeek: number;
    };
    leavePolicy: {
      annualLeave: number;
      sickLeave: number;
      personalLeave: number;
    };
  };
  subscription: {
    plan: 'free' | 'basic' | 'professional' | 'enterprise';
    maxUsers: number;
    expiresAt?: Date;
  };
  contactInfo: {
    email: string;
    phone?: string;
    address?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    domain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo: { type: String },
    primaryColor: { type: String, default: '#1976d2' },
    secondaryColor: { type: String, default: '#dc004e' },
    accentColor: { type: String, default: '#9c27b0' },
    settings: {
      features: {
        timesheets: { type: Boolean, default: true },
        documents: { type: Boolean, default: true },
        leaves: { type: Boolean, default: true },
        analytics: { type: Boolean, default: true },
        eSignature: { type: Boolean, default: false },
      },
      workingHours: {
        hoursPerDay: { type: Number, default: 8 },
        daysPerWeek: { type: Number, default: 5 },
      },
      leavePolicy: {
        annualLeave: { type: Number, default: 20 },
        sickLeave: { type: Number, default: 10 },
        personalLeave: { type: Number, default: 5 },
      },
    },
    subscription: {
      plan: { type: String, enum: ['free', 'basic', 'professional', 'enterprise'], default: 'free' },
      maxUsers: { type: Number, default: 10 },
      expiresAt: { type: Date },
    },
    contactInfo: {
      email: { type: String, required: true },
      phone: { type: String },
      address: { type: String },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes
TenantSchema.index({ domain: 1 });

export default mongoose.model<ITenant>('Tenant', TenantSchema);
