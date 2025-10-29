import { Router, Request, Response } from 'express';
import { authenticate, authorizeMinRole } from '../middlewares/auth.middleware';
import { UserRole } from '../types/enums';
import timesheetService from '../services/timesheet.service';

const router = Router();
router.use(authenticate);

router.get('/pending', authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const pending = await timesheetService.getPendingTimesheets(req.user!.tenantId);
    res.json(pending);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching pending timesheets', error: error.message });
  }
});

router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date();
    const summary = await timesheetService.getTimesheetSummary(req.user!.userId, req.user!.tenantId, start, end);
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
});

// Get week summary
router.get('/week-summary', async (req: Request, res: Response) => {
  try {
    const { startDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date();
    const endDate = new Date(start);
    endDate.setDate(start.getDate() + 6);
    const summary = await timesheetService.getTimesheetSummary(req.user!.userId, req.user!.tenantId, start, endDate);
    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching week summary', error: error.message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const timesheets = await timesheetService.getUserTimesheets(req.user!.userId, req.user!.tenantId, req.query);
    res.json(timesheets);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching timesheets', error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const timesheet = await timesheetService.getTimesheetById(req.params.id, req.user!.tenantId);
    if (!timesheet) {
      return res.status(404).json({ message: 'Timesheet not found' });
    }
    res.json(timesheet);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching timesheet', error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const timesheet = await timesheetService.createTimesheet(req.body, req.user!.userId, req.user!.tenantId);
    res.status(201).json(timesheet);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating timesheet', error: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const timesheet = await timesheetService.updateTimesheet(req.params.id, req.body, req.user!.userId, req.user!.tenantId);
    res.json(timesheet);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await timesheetService.deleteTimesheet(req.params.id, req.user!.userId, req.user!.tenantId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Submit specific timesheet by ID
router.post('/:id/submit', async (req: Request, res: Response) => {
  try {
    const timesheet = await timesheetService.submitTimesheet(req.params.id, req.user!.userId, req.user!.tenantId);
    res.json(timesheet);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Submit timesheets for date range (bulk submit)
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }
    const result = await timesheetService.bulkSubmitTimesheets(
      req.user!.userId,
      req.user!.tenantId,
      new Date(startDate),
      new Date(endDate)
    );
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Approve timesheet
router.patch('/:id/approve', authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const timesheet = await timesheetService.approveTimesheet(req.params.id, req.user!.userId, req.user!.tenantId);
    res.json(timesheet);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Reject timesheet
router.patch('/:id/reject', authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const reason = req.body.reason;
    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    const timesheet = await timesheetService.rejectTimesheet(req.params.id, req.user!.userId, req.user!.tenantId, reason);
    res.json(timesheet);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;