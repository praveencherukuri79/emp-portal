import { Router, Request, Response } from 'express';
import { authenticate, authorizeMinRole } from '../middlewares/auth.middleware';
import { UserRole } from '../types/enums';
import User from '../models/user.model';
import Timesheet from '../models/timesheet.model';
import Leave from '../models/leave.model';

const router = Router();

/**
 * @route   GET /api/team/members
 * @desc    Get team members (for Supervisor+)
 * @access  Private - Supervisor+
 */
router.get('/members', authenticate, authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    let query: any = { tenantId, isActive: true };

    // Supervisors see only employees and below
    if (userRole === UserRole.SUPERVISOR) {
      query.role = { $in: [UserRole.EMPLOYEE, UserRole.PROSPECT] };
    }
    // Admin+ can see all except higher roles
    else if (userRole === UserRole.ADMIN) {
      query.role = { $ne: UserRole.EMPLOYER };
    }
    // Employer sees all

    const members = await User.find(query)
      .select('firstName lastName email role department designation joinDate isActive lastLogin')
      .sort({ firstName: 1, lastName: 1 });

    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('Team members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team members'
    });
  }
});

/**
 * @route   GET /api/team/stats
 * @desc    Get team statistics (for Supervisor+)
 * @access  Private - Supervisor+
 */
router.get('/stats', authenticate, authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const userRole = req.user?.role;

    // Build base query based on role
    let userQuery: any = { tenantId, isActive: true };
    if (userRole === UserRole.SUPERVISOR) {
      userQuery.role = { $in: [UserRole.EMPLOYEE, UserRole.PROSPECT] };
    } else if (userRole === UserRole.ADMIN) {
      userQuery.role = { $ne: UserRole.EMPLOYER };
    }

    // Get team member count
    const totalMembers = await User.countDocuments(userQuery);
    const activeMembers = await User.countDocuments({ ...userQuery, lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });

    // Get pending items
    const pendingTimesheets = await Timesheet.countDocuments({ tenantId, status: 'submitted' });
    const pendingLeaves = await Leave.countDocuments({ tenantId, status: 'pending' });

    // Get this month's activity
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthTimesheets = await Timesheet.countDocuments({
      tenantId,
      createdAt: { $gte: startOfMonth }
    });

    const thisMonthLeaves = await Leave.countDocuments({
      tenantId,
      createdAt: { $gte: startOfMonth }
    });

    res.json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        pendingTimesheets,
        pendingLeaves,
        thisMonthTimesheets,
        thisMonthLeaves
      }
    });
  } catch (error) {
    console.error('Team stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team statistics'
    });
  }
});

/**
 * @route   GET /api/team/:userId/activity
 * @desc    Get team member activity (for Supervisor+)
 * @access  Private - Supervisor+
 */
router.get('/:userId/activity', authenticate, authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const tenantId = req.user?.tenantId;

    // Get recent timesheets
    const recentTimesheets = await Timesheet.find({ 
      userId, 
      tenantId 
    })
      .sort({ date: -1 })
      .limit(10)
      .select('date hours project description status');

    // Get recent leaves
    const recentLeaves = await Leave.find({ 
      userId, 
      tenantId 
    })
      .sort({ startDate: -1 })
      .limit(5)
      .select('leaveType startDate endDate totalDays status reason');

    res.json({
      success: true,
      data: {
        timesheets: recentTimesheets,
        leaves: recentLeaves
      }
    });
  } catch (error) {
    console.error('Team member activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch member activity'
    });
  }
});

/**
 * @route   POST /api/team/bulk-actions
 * @desc    Perform bulk actions on team members (Admin+)
 * @access  Private - Admin+
 */
router.post('/bulk-actions', authenticate, authorizeMinRole(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    const { action, userIds } = req.body;
    const tenantId = req.user?.tenantId;
    const currentUserRole = req.user?.role;

    if (!action || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: 'Action and userIds are required'
      });
    }

    // Prevent acting on higher-role users
    const targetUsers = await User.find({ _id: { $in: userIds }, tenantId });
    const hierarchyLevels = {
      [UserRole.PROSPECT]: 0,
      [UserRole.EMPLOYEE]: 1,
      [UserRole.HR]: 2,
      [UserRole.SUPERVISOR]: 3,
      [UserRole.ADMIN]: 4,
      [UserRole.EMPLOYER]: 5
    };

    const currentUserLevel = hierarchyLevels[currentUserRole as UserRole];
    const invalidTargets = targetUsers.filter(user => 
      hierarchyLevels[user.role as UserRole] >= currentUserLevel
    );

    if (invalidTargets.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'Cannot perform actions on users with equal or higher roles'
      });
    }

    let updateData: any = {};
    let result;

    switch (action) {
      case 'activate':
        updateData = { isActive: true };
        break;
      case 'deactivate':
        updateData = { isActive: false };
        break;
      case 'delete':
        result = await User.deleteMany({ _id: { $in: userIds }, tenantId });
        return res.json({
          success: true,
          message: `Deleted ${result.deletedCount} users`,
          data: { deletedCount: result.deletedCount }
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    result = await User.updateMany(
      { _id: { $in: userIds }, tenantId },
      updateData
    );

    res.json({
      success: true,
      message: `${action} completed for ${result.modifiedCount} users`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Bulk actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk actions'
    });
  }
});

export default router;