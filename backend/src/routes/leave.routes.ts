import { Router, Request, Response } from 'express';
import { authenticate, authorizeMinRole } from '../middlewares/auth.middleware';
import { UserRole } from '../types/enums';
import leaveService from '../services/leave.service';

const router = Router();
router.use(authenticate);

router.get('/pending', authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const pending = await leaveService.getPendingApprovals(req.user!.tenantId);
    res.json(pending);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching pending leaves', error: error.message });
  }
});

router.get('/balance', async (req: Request, res: Response) => {
  try {
    const balance = await leaveService.getLeaveBalance(req.user!.userId, req.user!.tenantId);
    res.json(balance);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching leave balance', error: error.message });
  }
});

// Get leave balance for specific user
router.get('/balance/:userId', async (req: Request, res: Response) => {
  try {
    const balance = await leaveService.getLeaveBalance(req.params.userId, req.user!.tenantId);
    res.json(balance);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching leave balance', error: error.message });
  }
});

router.get('/calendar', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date(start.getFullYear(), start.getMonth() + 1, 0);
    const calendar = await leaveService.getTeamLeaveCalendar(req.user!.tenantId, start, end);
    res.json(calendar);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching leave calendar', error: error.message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const leaves = await leaveService.getUserLeaves(req.user!.userId, req.user!.tenantId, req.query);
    res.json(leaves);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching leaves', error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const leave = await leaveService.getLeaveById(req.params.id, req.user!.tenantId);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    res.json(leave);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching leave', error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const leave = await leaveService.createLeave(req.body, req.user!.userId, req.user!.tenantId);
    res.status(201).json(leave);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Approve leave
router.patch('/:id/approve', authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const leave = await leaveService.approveLeave(req.params.id, req.user!.userId, req.user!.tenantId);
    res.json(leave);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Reject leave
router.patch('/:id/reject', authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    const leave = await leaveService.rejectLeave(req.params.id, req.user!.userId, req.user!.tenantId, reason);
    res.json(leave);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const leave = await leaveService.updateLeave(req.params.id, req.body, req.user!.userId, req.user!.tenantId);
    res.json(leave);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await leaveService.cancelLeave(req.params.id, req.user!.userId, req.user!.tenantId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;