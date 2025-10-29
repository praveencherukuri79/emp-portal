import mongoose, { Document, Schema } from 'mongoose';

export interface ILeave extends Document {
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  leaveType: 'annual' | 'sick' | 'personal' | 'unpaid' | 'maternity' | 'paternity';
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    leaveType: {
      type: String,
      enum: ['annual', 'sick', 'personal', 'unpaid', 'maternity', 'paternity'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true, min: 0.5 },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

// Indexes
LeaveSchema.index({ tenantId: 1, userId: 1, startDate: 1 });
LeaveSchema.index({ tenantId: 1, status: 1 });

export default mongoose.model<ILeave>('Leave', LeaveSchema);
