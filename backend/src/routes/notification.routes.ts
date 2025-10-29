import { Router, Request, Response } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import notificationService from '../services/notification.service';

const router = Router();
router.use(authenticate);

router.get('/unread/count', async (req: Request, res: Response) => {
  try {
    const result = await notificationService.getUnreadCount(req.user!.userId, req.user!.tenantId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching unread count', error: error.message });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await notificationService.getNotificationStats(req.user!.userId, req.user!.tenantId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user!.userId, req.user!.tenantId, req.query);
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const notification = await notificationService.getNotificationById(req.params.id, req.user!.userId, req.user!.tenantId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching notification', error: error.message });
  }
});

router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user!.userId, req.user!.tenantId);
    res.json(notification);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/read-all', async (req: Request, res: Response) => {
  try {
    const result = await notificationService.markAllAsRead(req.user!.userId, req.user!.tenantId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Error marking all as read', error: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await notificationService.deleteNotification(req.params.id, req.user!.userId, req.user!.tenantId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;