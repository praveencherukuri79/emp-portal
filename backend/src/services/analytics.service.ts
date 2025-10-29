/**
 * Analytics Service
 * Business logic for analytics and reporting operations
 */

import Timesheet from '../models/timesheet.model';
import Leave from '../models/leave.model';
import User from '../models/user.model';
import Document from '../models/document.model';

class AnalyticsService {
  /**
   * Get timesheet analytics for a period
   */
  async getTimesheetAnalytics(tenantId: string, startDate: Date, endDate: Date, userId?: string) {
    const query: any = {
      tenantId,
      date: { $gte: startDate, $lte: endDate }
    };

    if (userId) {
      query.userId = userId;
    }

    const timesheets = await Timesheet.find(query)
      .populate('userId', 'firstName lastName department')
      .exec();

    // Calculate aggregations
    const totalHours = timesheets.reduce((sum, ts) => sum + ts.hours, 0);
    const billableHours = timesheets.filter(ts => ts.billable).reduce((sum, ts) => sum + ts.hours, 0);
    
    // Group by status
    const byStatus = {
      draft: timesheets.filter(ts => ts.status === 'draft').length,
      submitted: timesheets.filter(ts => ts.status === 'submitted').length,
      approved: timesheets.filter(ts => ts.status === 'approved').length,
      rejected: timesheets.filter(ts => ts.status === 'rejected').length
    };

    // Group by project
    const projectMap = new Map<string, number>();
    timesheets.forEach(ts => {
      const project = (ts as any).project || 'Unassigned';
      projectMap.set(project, (projectMap.get(project) || 0) + ts.hours);
    });

    const byProject = Array.from(projectMap.entries()).map(([project, hours]) => ({
      project,
      hours
    }));

    // Group by user (if not filtered by user)
    let byUser: any[] = [];
    if (!userId) {
      const userMap = new Map<string, { name: string; hours: number; department: string }>();
      timesheets.forEach(ts => {
        const user = ts.userId as any;
        const key = user._id.toString();
        const existing = userMap.get(key);
        if (existing) {
          existing.hours += ts.hours;
        } else {
          userMap.set(key, {
            name: `${user.firstName} ${user.lastName}`,
            department: user.department || 'N/A',
            hours: ts.hours
          });
        }
      });
      byUser = Array.from(userMap.values());
    }

    return {
      totalHours,
      billableHours,
      nonBillableHours: totalHours - billableHours,
      totalEntries: timesheets.length,
      byStatus,
      byProject,
      byUser,
      utilizationRate: totalHours > 0 ? (billableHours / totalHours) * 100 : 0
    };
  }

  /**
   * Get leave analytics
   */
  async getLeaveAnalytics(tenantId: string, startDate: Date, endDate: Date, userId?: string) {
    const query: any = {
      tenantId,
      startDate: { $gte: startDate, $lte: endDate }
    };

    if (userId) {
      query.userId = userId;
    }

    const leaves = await Leave.find(query)
      .populate('userId', 'firstName lastName department')
      .exec();

    // Calculate total days
    const totalDays = leaves.reduce((sum, leave) => {
      const days = this.calculateDays(leave.startDate, leave.endDate);
      return sum + days;
    }, 0);

    // Group by type
    const byType = {
      sick: 0,
      annual: 0,
      personal: 0,
      unpaid: 0,
      maternity: 0,
      paternity: 0
    };

    leaves.forEach(leave => {
      const days = this.calculateDays(leave.startDate, leave.endDate);
      if (leave.leaveType === 'sick') byType.sick += days;
      else if (leave.leaveType === 'annual') byType.annual += days;
      else if (leave.leaveType === 'personal') byType.personal += days;
      else if (leave.leaveType === 'unpaid') byType.unpaid += days;
      else if (leave.leaveType === 'maternity') byType.maternity += days;
      else if (leave.leaveType === 'paternity') byType.paternity += days;
    });

    // Group by status
    const byStatus = {
      pending: leaves.filter(l => l.status === 'pending').length,
      approved: leaves.filter(l => l.status === 'approved').length,
      rejected: leaves.filter(l => l.status === 'rejected').length,
      cancelled: leaves.filter(l => l.status === 'cancelled').length
    };

    // Group by department
    let byDepartment: any[] = [];
    if (!userId) {
      const deptMap = new Map<string, number>();
      leaves.forEach(leave => {
        const user = leave.userId as any;
        const dept = user.department || 'N/A';
        const days = this.calculateDays(leave.startDate, leave.endDate);
        deptMap.set(dept, (deptMap.get(dept) || 0) + days);
      });
      byDepartment = Array.from(deptMap.entries()).map(([department, days]) => ({
        department,
        days
      }));
    }

    return {
      totalDays,
      totalRequests: leaves.length,
      byType,
      byStatus,
      byDepartment,
      approvalRate: leaves.length > 0 
        ? (byStatus.approved / leaves.length) * 100 
        : 0
    };
  }

  /**
   * Get employee analytics
   */
  async getEmployeeAnalytics(tenantId: string) {
    const users = await User.find({ tenantId }).exec();

    const byRole = {
      prospect: users.filter(u => u.role === 'prospect').length,
      employee: users.filter(u => u.role === 'employee').length,
      hr: users.filter(u => u.role === 'hr').length,
      supervisor: users.filter(u => u.role === 'supervisor').length,
      admin: users.filter(u => u.role === 'admin').length,
      employer: users.filter(u => u.role === 'employer').length
    };

    const byDepartment = new Map<string, number>();
    users.forEach(user => {
      const dept = user.employeeInfo?.department || 'N/A';
      byDepartment.set(dept, (byDepartment.get(dept) || 0) + 1);
    });

    const byStatus = {
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length
    };

    return {
      totalEmployees: users.length,
      byRole,
      byDepartment: Array.from(byDepartment.entries()).map(([department, count]) => ({
        department,
        count
      })),
      byStatus
    };
  }

  /**
   * Get document analytics
   */
  async getDocumentAnalytics(tenantId: string, userId?: string) {
    const query: any = { tenantId };
    if (userId) {
      query.userId = userId;
    }

    const documents = await Document.find(query).exec();

    const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);

    const byCategory = new Map<string, number>();
    documents.forEach(doc => {
      byCategory.set(doc.category, (byCategory.get(doc.category) || 0) + 1);
    });

    const bySignatureStatus = {
      pending: documents.filter(d => d.signatureStatus === 'pending').length,
      signed: documents.filter(d => d.signatureStatus === 'signed').length,
      declined: documents.filter(d => d.signatureStatus === 'declined').length,
      noSignature: documents.filter(d => !d.isSignatureRequired).length
    };

    return {
      totalDocuments: documents.length,
      totalSize: totalSize,
      averageSize: documents.length > 0 ? totalSize / documents.length : 0,
      byCategory: Array.from(byCategory.entries()).map(([category, count]) => ({
        category,
        count
      })),
      bySignatureStatus
    };
  }

  /**
   * Get dashboard overview
   */
  async getDashboardOverview(tenantId: string, userId?: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [timesheetStats, leaveStats, documentStats] = await Promise.all([
      this.getTimesheetAnalytics(tenantId, startOfMonth, endOfMonth, userId),
      this.getLeaveAnalytics(tenantId, startOfMonth, endOfMonth, userId),
      this.getDocumentAnalytics(tenantId, userId)
    ]);

    return {
      period: {
        start: startOfMonth,
        end: endOfMonth
      },
      timesheets: {
        totalHours: timesheetStats.totalHours,
        billableHours: timesheetStats.billableHours,
        pendingApprovals: timesheetStats.byStatus.submitted
      },
      leaves: {
        totalDays: leaveStats.totalDays,
        pendingRequests: leaveStats.byStatus.pending
      },
      documents: {
        total: documentStats.totalDocuments,
        pending: documentStats.bySignatureStatus.pending
      }
    };
  }

  /**
   * Get productivity metrics
   */
  async getProductivityMetrics(tenantId: string, startDate: Date, endDate: Date) {
    const timesheetStats = await this.getTimesheetAnalytics(tenantId, startDate, endDate);
    const leaveStats = await this.getLeaveAnalytics(tenantId, startDate, endDate);
    const employeeStats = await this.getEmployeeAnalytics(tenantId);

    // Calculate working days in period
    const workingDays = this.calculateWorkingDays(startDate, endDate);
    const expectedHours = employeeStats.byStatus.active * workingDays * 8; // 8 hours per day

    return {
      period: {
        start: startDate,
        end: endDate,
        workingDays
      },
      timeTracking: {
        totalHours: timesheetStats.totalHours,
        expectedHours,
        utilizationRate: expectedHours > 0 
          ? (timesheetStats.totalHours / expectedHours) * 100 
          : 0,
        billableRate: timesheetStats.utilizationRate
      },
      leaves: {
        totalDays: leaveStats.totalDays,
        averagePerEmployee: employeeStats.totalEmployees > 0 
          ? leaveStats.totalDays / employeeStats.totalEmployees 
          : 0
      },
      employees: {
        active: employeeStats.byStatus.active,
        inactive: employeeStats.byStatus.inactive
      }
    };
  }

  /**
   * Calculate working days between two dates
   */
  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }

  /**
   * Calculate number of days between two dates
   */
  private calculateDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  }
}

export default new AnalyticsService();
