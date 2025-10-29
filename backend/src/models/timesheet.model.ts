import mongoose, { Document, Schema } from 'mongoose';

export interface ITimesheet extends Document {
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  projectName?: string;
  taskDescription: string;
  hours: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  billable: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TimesheetSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    projectName: { type: String, trim: true },
    taskDescription: { type: String, required: true, trim: true },
    hours: { type: Number, required: true, min: 0, max: 24 },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'draft',
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    billable: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true }
);

// Indexes
TimesheetSchema.index({ tenantId: 1, userId: 1, date: 1 });
TimesheetSchema.index({ tenantId: 1, status: 1 });

export default mongoose.model<ITimesheet>('Timesheet', TimesheetSchema);
