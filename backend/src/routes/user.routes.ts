import { Router, Request, Response } from 'express';
import { authenticate, authorize, authorizeMinRole } from '../middlewares/auth.middleware';
import { UserRole } from '../types/enums';
import userService from '../services/user.service';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all users (Supervisor and above can view users)
router.get('/', authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers(req.user!.tenantId);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get current user profile
router.get('/me/profile', async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.user!.userId, req.user!.tenantId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Get user by ID (Supervisor and above)
router.get('/:id', authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id, req.user!.tenantId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Create user (Admin and above only)
router.post('/', authorizeMinRole(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    const user = await userService.createUser(req.body, req.user!.tenantId, req.user!.userId);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Update user (Admin and above, or own profile)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const isOwnProfile = userId === req.user!.userId;
    
    // Only admins can update other users
    if (!isOwnProfile) {
      const userLevel = getRoleLevel(req.user!.role);
      if (userLevel < getRoleLevel(UserRole.ADMIN)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
    }
    
    const user = await userService.updateProfile(userId, req.body, req.user!.tenantId);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Update user password
router.put('/:id/password', async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;
    const isOwnProfile = userId === req.user!.userId;
    
    if (!isOwnProfile && getRoleLevel(req.user!.role) < getRoleLevel(UserRole.ADMIN)) {
      return res.status(403).json({ message: 'Can only change own password' });
    }
    
    await userService.changePassword(userId, currentPassword, newPassword, req.user!.tenantId);
    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Deactivate user (Admin only)
router.put('/:id/deactivate', authorizeMinRole(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    const user = await userService.deactivateUser(req.params.id, req.user!.tenantId);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Error deactivating user', error: error.message });
  }
});

// Search users
router.get('/search/:query', authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const users = await userService.searchUsers(req.params.query, req.user!.tenantId);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Error searching users', error: error.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', authorizeMinRole(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    await userService.deleteUser(req.params.id, req.user!.tenantId);
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk update users (Admin only)
router.post('/bulk-update', authorizeMinRole(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    const { userIds, updates } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'userIds array is required' });
    }
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ message: 'updates object is required' });
    }
    const result = await userService.bulkUpdateUsers(userIds, updates, req.user!.tenantId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk delete users (Admin only)
router.post('/bulk-delete', authorizeMinRole(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    const { userIds } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'userIds array is required' });
    }
    const result = await userService.bulkDeleteUsers(userIds, req.user!.tenantId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Get user statistics (Admin only)
router.get('/stats/all', authorizeMinRole(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    const stats = await userService.getUserStats(req.user!.tenantId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

// Helper function to get role hierarchy level
function getRoleLevel(role: string): number {
  const hierarchy: Record<string, number> = {
    [UserRole.PROSPECT]: 0,
    [UserRole.EMPLOYEE]: 1,
    [UserRole.HR]: 2,
    [UserRole.SUPERVISOR]: 3,
    [UserRole.ADMIN]: 4,
    [UserRole.EMPLOYER]: 5
  };
  return hierarchy[role] || 0;
}

export default router;
