import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string;
  category: 'visa' | 'identification' | 'contract' | 'payslip' | 'tax' | 'certification' | 'other';
  description?: string;
  tags?: string[];
  isSignatureRequired: boolean;
  signatureStatus?: 'pending' | 'signed' | 'declined';
  signedBy?: mongoose.Types.ObjectId;
  signedAt?: Date;
  signatureData?: string; // Base64 signature image
  expiryDate?: Date;
  isPublic: boolean;
  sharedWith?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    filePath: { type: String, required: true },
    category: {
      type: String,
      enum: ['visa', 'identification', 'contract', 'payslip', 'tax', 'certification', 'other'],
      default: 'other',
    },
    description: { type: String },
    tags: [{ type: String }],
    isSignatureRequired: { type: Boolean, default: false },
    signatureStatus: {
      type: String,
      enum: ['pending', 'signed', 'declined'],
    },
    signedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    signedAt: { type: Date },
    signatureData: { type: String },
    expiryDate: { type: Date },
    isPublic: { type: Boolean, default: false },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Indexes
DocumentSchema.index({ tenantId: 1, userId: 1 });
DocumentSchema.index({ tenantId: 1, category: 1 });
DocumentSchema.index({ tenantId: 1, signatureStatus: 1 });

export default mongoose.model<IDocument>('Document', DocumentSchema);
