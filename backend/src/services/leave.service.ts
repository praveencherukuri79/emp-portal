/**
 * Leave Service
 * Business logic for leave request operations
 */

import mongoose from 'mongoose';
import Leave from '../models/leave.model';
import Notification from '../models/notification.model';
import User from '../models/user.model';

class LeaveService {
  /**
   * Get all leave requests for a user
   */
  async getUserLeaves(userId: string, tenantId: string, filters?: any) {
    const query: any = { userId, tenantId };

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.type) {
      query.leaveType = filters.type;
    }

    if (filters?.startDate && filters?.endDate) {
      query.$or = [
        {
          startDate: { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) }
        },
        {
          endDate: { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) }
        }
      ];
    }

    return Leave.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * Get single leave request by ID
   */
  async getLeaveById(id: string, tenantId: string) {
    return Leave.findOne({ _id: id, tenantId })
      .populate('userId', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .exec();
  }

  /**
   * Create new leave request
   */
  async createLeave(data: any, userId: string, tenantId: string) {
    // Check for overlapping leave requests
    const overlapping = await Leave.findOne({
      userId,
      tenantId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        {
          startDate: { $lte: new Date(data.endDate) },
          endDate: { $gte: new Date(data.startDate) }
        }
      ]
    });

    if (overlapping) {
      throw new Error('You have an overlapping leave request for this period');
    }

    // Check leave balance
    const balance = await this.getLeaveBalance(userId, tenantId);
    const requestedDays = this.calculateDays(new Date(data.startDate), new Date(data.endDate));

    if (balance[data.leaveType] < requestedDays) {
      throw new Error(`Insufficient ${data.leaveType} leave balance. Available: ${balance[data.leaveType]} days`);
    }

    const leave = await Leave.create({
      ...data,
      userId,
      tenantId,
      status: 'pending'
    });

    // Create notification for supervisors
    await this.createNotificationForSupervisors(
      tenantId,
      userId,
      'New Leave Request',
      `A ${data.leaveType} leave request has been submitted`
    );

    return leave;
  }

  /**
   * Update leave request
   */
  async updateLeave(id: string, data: any, userId: string, tenantId: string) {
    const leave = await Leave.findOne({ _id: id, userId, tenantId });

    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status !== 'pending' && leave.status !== 'rejected') {
      throw new Error('Cannot update approved or cancelled leave requests');
    }

    Object.assign(leave, data);
    await leave.save();

    return leave;
  }

  /**
   * Cancel leave request
   */
  async cancelLeave(id: string, userId: string, tenantId: string) {
    const leave = await Leave.findOne({ _id: id, userId, tenantId });

    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status === 'cancelled') {
      throw new Error('Leave request already cancelled');
    }

    leave.status = 'cancelled';
    await leave.save();

    return leave;
  }

  /**
   * Approve leave request
   */
  async approveLeave(id: string, approverId: string, tenantId: string) {
    const leave = await Leave.findOne({ _id: id, tenantId });

    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status !== 'pending') {
      throw new Error('Leave request not pending approval');
    }

    leave.status = 'approved';
    leave.approvedBy = new mongoose.Types.ObjectId(approverId) as any;
    leave.approvedAt = new Date();
    await leave.save();

    // Create notification for user
    await Notification.create({
      userId: leave.userId,
      tenantId,
      type: 'leave',
      title: 'Leave Request Approved',
      message: 'Your leave request has been approved',
      relatedId: id
    });

    return leave;
  }

  /**
   * Reject leave request
   */
  async rejectLeave(id: string, approverId: string, tenantId: string, reason: string) {
    const leave = await Leave.findOne({ _id: id, tenantId });

    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status !== 'pending') {
      throw new Error('Leave request not pending approval');
    }

    leave.status = 'rejected';
    leave.rejectionReason = reason;
    await leave.save();

    // Create notification for user
    await Notification.create({
      userId: leave.userId,
      tenantId,
      type: 'leave',
      title: 'Leave Request Rejected',
      message: `Your leave request was rejected: ${reason}`,
      relatedId: id
    });

    return leave;
  }

  /**
   * Get leave balance for a user
   */
  async getLeaveBalance(userId: string, tenantId: string) {
    const user = await User.findOne({ _id: userId, tenantId });

    if (!user) {
      throw new Error('User not found');
    }

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    // Get all approved leaves for current year
    const approvedLeaves = await Leave.find({
      userId,
      tenantId,
      status: 'approved',
      startDate: { $gte: yearStart, $lte: yearEnd }
    });

    // Calculate used days by type
    const used = {
      sick: 0,
      annual: 0,
      personal: 0,
      unpaid: 0
    };

    approvedLeaves.forEach(leave => {
      const days = this.calculateDays(leave.startDate, leave.endDate);
      if (leave.leaveType === 'sick') used.sick += days;
      else if (leave.leaveType === 'annual') used.annual += days;
      else if (leave.leaveType === 'personal') used.personal += days;
      else if (leave.leaveType === 'unpaid') used.unpaid += days;
    });

    // Default annual allowances (could be stored in user profile)
    const allowances = {
      sick: 10,
      annual: 15,
      personal: 5,
      unpaid: 0 // Unlimited
    };

    return {
      sick: allowances.sick - used.sick,
      annual: allowances.annual - used.annual,
      personal: allowances.personal - used.personal,
      unpaid: allowances.unpaid
    };
  }

  /**
   * Get pending approvals for supervisor/admin
   */
  async getPendingApprovals(tenantId: string) {
    return Leave.find({
      tenantId,
      status: 'pending'
    })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get team leave calendar
   */
  async getTeamLeaveCalendar(tenantId: string, startDate: Date, endDate: Date) {
    return Leave.find({
      tenantId,
      status: 'approved',
      $or: [
        {
          startDate: { $gte: startDate, $lte: endDate }
        },
        {
          endDate: { $gte: startDate, $lte: endDate }
        }
      ]
    })
      .populate('userId', 'firstName lastName email')
      .sort({ startDate: 1 })
      .exec();
  }

  /**
   * Calculate number of days between two dates
   */
  private calculateDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  }

  /**
   * Create notification for supervisors
   */
  private async createNotificationForSupervisors(
    tenantId: string,
    userId: string,
    title: string,
    message: string
  ) {
    // This would query for supervisors/managers and create notifications
    // For now, simplified version
    return;
  }
}

export default new LeaveService();
