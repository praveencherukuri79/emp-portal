import { Router, Request, Response } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { UserRole } from '../types/enums';
import analyticsService from '../services/analytics.service';
import notificationService from '../services/notification.service';
import Timesheet from '../models/timesheet.model';
import Leave from '../models/leave.model';

const router = Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics for logged-in user
 * @access  Private
 */
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const tenantId = req.user?.tenantId!;

    // Use analytics service for dashboard overview
    const overview = await analyticsService.getDashboardOverview(tenantId, userId);

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard statistics' 
    });
  }
});

/**
 * @route   GET /api/dashboard/activity
 * @desc    Get recent activity for logged-in user
 * @access  Private
 */
router.get('/activity', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get recent timesheets
    const recentTimesheets = await Timesheet.find({
      userId,
      tenantId
    })
      .sort({ date: -1 })
      .limit(Math.floor(limit / 2));

    // Get recent leaves
    const recentLeaves = await Leave.find({
      userId,
      tenantId
    })
      .sort({ createdAt: -1 })
      .limit(Math.floor(limit / 2));

    // Combine and format activities
    const activities = [
      ...recentTimesheets.map(ts => ({
        id: ts._id.toString(),
        type: 'timesheet',
        title: `Timesheet submitted`,
        description: `${ts.hours} hours logged${ts.projectName ? ` for ${ts.projectName}` : ''}`,
        timestamp: ts.date,
        status: ts.status,
        icon: 'schedule'
      })),
      ...recentLeaves.map(leave => ({
        id: leave._id.toString(),
        type: 'leave',
        title: `Leave request`,
        description: `${leave.leaveType} leave from ${leave.startDate.toLocaleDateString()} to ${leave.endDate.toLocaleDateString()}`,
        timestamp: leave.createdAt,
        status: leave.status,
        icon: 'event_busy'
      }))
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Dashboard activity error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch recent activity' 
    });
  }
});

/**
 * @route   GET /api/dashboard/deadlines
 * @desc    Get upcoming deadlines for logged-in user
 * @access  Private
 */
router.get('/deadlines', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get pending timesheets that need submission
    const pendingTimesheets = await Timesheet.find({
      userId,
      tenantId,
      status: 'draft',
      date: { $lte: nextWeek }
    })
      .sort({ date: 1 })
      .limit(5);

    // Get upcoming leaves
    const upcomingLeaves = await Leave.find({
      userId,
      tenantId,
      startDate: { $gte: now, $lte: nextWeek }
    })
      .sort({ startDate: 1 })
      .limit(5);

    const deadlines = [
      ...pendingTimesheets.map(ts => ({
        id: ts._id.toString(),
        type: 'timesheet',
        title: 'Timesheet submission due',
        description: `Submit timesheet for ${ts.date.toLocaleDateString()}`,
        dueDate: ts.date,
        priority: 'high',
        icon: 'schedule'
      })),
      ...upcomingLeaves.map(leave => ({
        id: leave._id.toString(),
        type: 'leave',
        title: 'Upcoming leave',
        description: `${leave.leaveType} from ${leave.startDate.toLocaleDateString()}`,
        dueDate: leave.startDate,
        priority: 'medium',
        icon: 'event_busy'
      }))
    ].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    res.json({
      success: true,
      data: deadlines
    });
  } catch (error) {
    console.error('Dashboard deadlines error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch upcoming deadlines' 
    });
  }
});

/**
 * @route   GET /api/dashboard/pending-approvals
 * @desc    Get pending approvals (for managers)
 * @access  Private
 */
router.get('/pending-approvals', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tenantId = req.user?.tenantId;
    const userRole = req.user?.role;

    // Only employers/admins/supervisors can see pending approvals
    if (userRole !== UserRole.EMPLOYER && userRole !== UserRole.ADMIN && userRole !== UserRole.SUPERVISOR) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Get pending timesheets
    const pendingTimesheets = await Timesheet.find({
      tenantId,
      status: 'submitted'
    })
      .sort({ date: -1 })
      .limit(5)
      .populate('userId', 'firstName lastName email');

    // Get pending leaves
    const pendingLeaves = await Leave.find({
      tenantId,
      status: 'pending'
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'firstName lastName email');

    const approvals = [
      ...pendingTimesheets.map(ts => ({
        id: ts._id.toString(),
        type: 'timesheet',
        title: 'Timesheet approval needed',
        description: `${(ts.userId as any)?.firstName} ${(ts.userId as any)?.lastName} - ${ts.hours} hours`,
        timestamp: ts.date,
        priority: 'high',
        icon: 'schedule',
        userId: (ts.userId as any)?._id
      })),
      ...pendingLeaves.map(leave => ({
        id: leave._id.toString(),
        type: 'leave',
        title: 'Leave approval needed',
        description: `${(leave.userId as any)?.firstName} ${(leave.userId as any)?.lastName} - ${leave.leaveType}`,
        timestamp: leave.createdAt,
        priority: 'high',
        icon: 'event_busy',
        userId: (leave.userId as any)?._id
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      success: true,
      data: approvals
    });
  } catch (error) {
    console.error('Dashboard pending approvals error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pending approvals' 
    });
  }
});

export default router;

