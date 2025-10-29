/**
 * Timesheet Service
 * Business logic for timesheet operations
 */

import mongoose from 'mongoose';
import Timesheet from '../models/timesheet.model';
import Notification from '../models/notification.model';

export class TimesheetService {
  /**
   * Get timesheets for a user
   */
  async getUserTimesheets(userId: string, tenantId: string, filters?: any) {
    const query: any = { userId, tenantId };

    if (filters?.startDate && filters?.endDate) {
      query.date = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    return await Timesheet.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ date: -1 });
  }

  /**
   * Get all timesheets (admin/manager)
   */
  async getAllTimesheets(tenantId: string, filters?: any) {
    const query: any = { tenantId };

    if (filters?.startDate && filters?.endDate) {
      query.date = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.userId) {
      query.userId = filters.userId;
    }

    return await Timesheet.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ date: -1 });
  }

  /**
   * Get timesheet by ID
   */
  async getTimesheetById(id: string, tenantId: string) {
    const timesheet = await Timesheet.findOne({ _id: id, tenantId })
      .populate('userId', 'firstName lastName email');

    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    return timesheet;
  }

  /**
   * Create timesheet entry
   */
  async createTimesheet(data: any, userId: string, tenantId: string) {
    const timesheet = new Timesheet({
      ...data,
      userId,
      tenantId,
      status: 'draft'
    });

    await timesheet.save();
    return timesheet;
  }

  /**
   * Create multiple timesheet entries (batch)
   */
  async createBatchTimesheets(entries: any[], userId: string, tenantId: string) {
    const timesheets = entries.map(entry => ({
      ...entry,
      userId,
      tenantId,
      status: 'draft'
    }));

    return await Timesheet.insertMany(timesheets);
  }

  /**
   * Update timesheet
   */
  async updateTimesheet(id: string, userId: string, tenantId: string, updates: any) {
    const timesheet = await Timesheet.findOne({ _id: id, userId, tenantId });

    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    // Only allow updates if status is draft or rejected
    if (timesheet.status !== 'draft' && timesheet.status !== 'rejected') {
      throw new Error('Cannot update submitted or approved timesheets');
    }

    Object.assign(timesheet, updates);
    await timesheet.save();

    return timesheet;
  }

  /**
   * Delete timesheet
   */
  async deleteTimesheet(id: string, userId: string, tenantId: string) {
    const timesheet = await Timesheet.findOne({ _id: id, userId, tenantId });

    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    // Only allow deletion if status is draft or rejected
    if (timesheet.status !== 'draft' && timesheet.status !== 'rejected') {
      throw new Error('Cannot delete submitted or approved timesheets');
    }

    await timesheet.deleteOne();
    return { message: 'Timesheet deleted successfully' };
  }

  /**
   * Submit timesheet for approval
   */
  async submitTimesheet(id: string, userId: string, tenantId: string) {
    const timesheet = await Timesheet.findOne({ _id: id, userId, tenantId });

    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    if (timesheet.status !== 'draft' && timesheet.status !== 'rejected') {
      throw new Error('Timesheet already submitted');
    }

    timesheet.status = 'submitted';
    await timesheet.save();

    // Create notification for supervisors
    await this.createNotificationForSupervisors(
      tenantId,
      userId,
      'Timesheet Submitted',
      `A timesheet has been submitted for approval`
    );

    return timesheet;
  }

  /**
   * Get pending timesheets for approval
   */
  async getPendingTimesheets(tenantId: string) {
    return await Timesheet.find({ tenantId, status: 'submitted' })
      .populate('userId', 'firstName lastName email')
      .sort({ submittedAt: -1 });
  }

  /**
   * Approve timesheet
   */
  async approveTimesheet(id: string, approverId: string, tenantId: string) {
    const timesheet = await Timesheet.findOne({ _id: id, tenantId });

    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    if (timesheet.status !== 'submitted') {
      throw new Error('Timesheet not submitted for approval');
    }

    timesheet.status = 'approved';
    timesheet.approvedBy = new mongoose.Types.ObjectId(approverId) as any;
    timesheet.approvedAt = new Date();
    await timesheet.save();

    // Create notification for user
    await Notification.create({
      userId: timesheet.userId,
      tenantId,
      type: 'timesheet',
      title: 'Timesheet Approved',
      message: 'Your timesheet has been approved',
      relatedId: id
    });

    return timesheet;
  }

  /**
   * Reject timesheet
   */
  async rejectTimesheet(id: string, approverId: string, tenantId: string, reason: string) {
    const timesheet = await Timesheet.findOne({ _id: id, tenantId });

    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    if (timesheet.status !== 'submitted') {
      throw new Error('Timesheet not submitted for approval');
    }

    timesheet.status = 'rejected';
    timesheet.rejectionReason = reason;
    await timesheet.save();

    // Create notification for user
    await Notification.create({
      userId: timesheet.userId,
      tenantId,
      type: 'timesheet',
      title: 'Timesheet Rejected',
      message: `Your timesheet was rejected: ${reason}`,
      relatedId: id
    });

    return timesheet;
  }

  /**
   * Get timesheet summary for a period
   */
  async getTimesheetSummary(userId: string, tenantId: string, startDate: Date, endDate: Date) {
    const timesheets = await Timesheet.find({
      userId,
      tenantId,
      date: { $gte: startDate, $lte: endDate }
    });

    const totalHours = timesheets.reduce((sum, ts) => sum + ts.hours, 0);
    const billableHours = timesheets.filter(ts => ts.billable).reduce((sum, ts) => sum + ts.hours, 0);

    return {
      totalHours,
      billableHours,
      nonBillableHours: totalHours - billableHours,
      totalEntries: timesheets.length,
      byStatus: {
        draft: timesheets.filter(ts => ts.status === 'draft').length,
        submitted: timesheets.filter(ts => ts.status === 'submitted').length,
        approved: timesheets.filter(ts => ts.status === 'approved').length,
        rejected: timesheets.filter(ts => ts.status === 'rejected').length
      }
    };
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

  /**
   * Bulk submit timesheets for a date range
   */
  async bulkSubmitTimesheets(userId: string, tenantId: string, startDate: Date, endDate: Date) {
    const timesheets = await Timesheet.find({
      userId,
      tenantId,
      date: { $gte: startDate, $lte: endDate },
      status: 'draft'
    });

    if (timesheets.length === 0) {
      throw new Error('No draft timesheets found in the specified date range');
    }

    await Timesheet.updateMany(
      {
        userId,
        tenantId,
        date: { $gte: startDate, $lte: endDate },
        status: 'draft'
      },
      {
        $set: { status: 'submitted', submittedAt: new Date() }
      }
    );

    await this.createNotificationForSupervisors(
      tenantId,
      userId,
      'Timesheets Submitted',
      `${timesheets.length} timesheets have been submitted for approval`
    );

    return {
      message: 'Timesheets submitted successfully',
      count: timesheets.length,
      startDate,
      endDate
    };
  }
}

export default new TimesheetService();
