/**
 * Notification Service
 * Business logic for notification operations
 */

import Notification from '../models/notification.model';

class NotificationService {
  /**
   * Get all notifications for a user
   */
  async getUserNotifications(userId: string, tenantId: string, filters?: any) {
    const query: any = { userId, tenantId };

    if (filters?.read !== undefined) {
      query.isRead = filters.read === 'true';
    }

    if (filters?.type) {
      query.category = filters.type;
    }

    const limit = filters?.limit ? parseInt(filters.limit) : 50;

    return Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get single notification by ID
   */
  async getNotificationById(id: string, userId: string, tenantId: string) {
    return Notification.findOne({ _id: id, userId, tenantId }).exec();
  }

  /**
   * Create notification
   */
  async createNotification(data: any) {
    return Notification.create(data);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string, userId: string, tenantId: string) {
    const notification = await Notification.findOne({ _id: id, userId, tenantId });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    await notification.save();

    return notification;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string, tenantId: string) {
    await Notification.updateMany(
      { userId, tenantId, isRead: false },
      {
        $set: {
          isRead: true
        }
      }
    );

    return { message: 'All notifications marked as read' };
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string, userId: string, tenantId: string) {
    const notification = await Notification.findOne({ _id: id, userId, tenantId });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await notification.deleteOne();
    return { message: 'Notification deleted successfully' };
  }

  /**
   * Delete all read notifications
   */
  async deleteReadNotifications(userId: string, tenantId: string) {
    await Notification.deleteMany({ userId, tenantId, isRead: true });
    return { message: 'All read notifications deleted' };
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string, tenantId: string) {
    const count = await Notification.countDocuments({
      userId,
      tenantId,
      isRead: false
    });

    return { count };
  }

  /**
   * Create bulk notifications
   */
  async createBulkNotifications(notifications: any[]) {
    return Notification.insertMany(notifications);
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId: string, tenantId: string) {
    const stats = await Notification.aggregate([
      { $match: { userId, tenantId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          },
          byCategory: {
            $push: {
              k: '$category',
              v: 1
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          unread: 1,
          read: { $subtract: ['$total', '$unread'] },
          byCategory: { $arrayToObject: '$byCategory' }
        }
      }
    ]);

    return stats[0] || {
      total: 0,
      unread: 0,
      read: 0,
      byCategory: {}
    };
  }

  /**
   * Clean old notifications (older than 90 days)
   */
  async cleanOldNotifications(tenantId: string) {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await Notification.deleteMany({
      tenantId,
      isRead: true,
      createdAt: { $lt: ninetyDaysAgo }
    });

    return {
      message: 'Old notifications cleaned',
      deletedCount: result.deletedCount
    };
  }
}

export default new NotificationService();
