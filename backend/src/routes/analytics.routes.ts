import { Router, Request, Response } from 'express';
import { authenticate, authorizeMinRole } from '../middlewares/auth.middleware';
import { UserRole } from '../types/enums';
import analyticsService from '../services/analytics.service';

const router = Router();
router.use(authenticate);

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const overview = await analyticsService.getDashboardOverview(req.user!.tenantId, req.user!.userId);
    res.json(overview);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching dashboard overview', error: error.message });
  }
});

router.get('/timesheet', authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate as string) : new Date();
    const analytics = await analyticsService.getTimesheetAnalytics(req.user!.tenantId, start, end, userId as string);
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching timesheet analytics', error: error.message });
  }
});

router.get('/leave', authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate as string) : new Date();
    const analytics = await analyticsService.getLeaveAnalytics(req.user!.tenantId, start, end, userId as string);
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching leave analytics', error: error.message });
  }
});

router.get('/employees', authorizeMinRole(UserRole.HR), async (req: Request, res: Response) => {
  try {
    const analytics = await analyticsService.getEmployeeAnalytics(req.user!.tenantId);
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching employee analytics', error: error.message });
  }
});

router.get('/documents', authorizeMinRole(UserRole.HR), async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;
    const analytics = await analyticsService.getDocumentAnalytics(req.user!.tenantId, userId);
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching document analytics', error: error.message });
  }
});

router.get('/productivity', authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const metrics = await analyticsService.getProductivityMetrics(req.user!.tenantId, start, end);
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching productivity metrics', error: error.message });
  }
});

export default router;