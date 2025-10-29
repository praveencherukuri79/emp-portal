/**
 * User Service
 * Business logic for user management operations
 */

import User from '../models/user.model';
import { UserRole } from '../types/enums';
import bcrypt from 'bcryptjs';

export class UserService {
  /**
   * Get all users for a tenant
   */
  async getAllUsers(tenantId: string) {
    return await User.find({ tenantId })
      .select('-password -refreshToken -resetPasswordToken -otp')
      .sort({ firstName: 1, lastName: 1 });
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string, tenantId: string) {
    const user = await User.findOne({ _id: userId, tenantId })
      .select('-password -refreshToken -resetPasswordToken -otp');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string, tenantId: string) {
    const user = await User.findOne({ _id: userId, tenantId })
      .select('-password -refreshToken -resetPasswordToken -otp');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  /**
   * Create new user
   */
  async createUser(userData: any, tenantId: string, createdBy: string) {
    // Check if email already exists
    const existingUser = await User.findOne({ 
      email: userData.email.toLowerCase(), 
      tenantId 
    });
    
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = new User({
      ...userData,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      tenantId,
      createdBy,
      isActive: true
    });

    await user.save();

    // Return user without sensitive fields
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.refreshToken;
    delete userObject.resetPasswordToken;
    delete userObject.otp;

    return userObject;
  }

  /**
   * Update user
   */
  async updateUser(userId: string, tenantId: string, updates: any) {
    // Don't allow updating password through this method
    delete updates.password;
    delete updates.refreshToken;
    delete updates.resetPasswordToken;
    delete updates.otp;

    const user = await User.findOneAndUpdate(
      { _id: userId, tenantId },
      { $set: updates },
      { new: true }
    ).select('-password -refreshToken -resetPasswordToken -otp');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, tenantId: string, profileData: any) {
    const allowedUpdates = [
      'firstName', 'lastName', 'phoneNumber', 'department', 
      'position', 'avatar', 'bio'
    ];

    const updates: any = {};
    for (const key of allowedUpdates) {
      if (profileData[key] !== undefined) {
        updates[key] = profileData[key];
      }
    }

    return await this.updateUser(userId, tenantId, updates);
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, tenantId: string, currentPassword: string, newPassword: string) {
    const user = await User.findOne({ _id: userId, tenantId });
    
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: 'Password changed successfully' };
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId: string, tenantId: string) {
    const user = await User.findOneAndUpdate(
      { _id: userId, tenantId },
      { $set: { isActive: false } },
      { new: true }
    ).select('-password -refreshToken -resetPasswordToken -otp');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Activate user
   */
  async activateUser(userId: string, tenantId: string) {
    const user = await User.findOneAndUpdate(
      { _id: userId, tenantId },
      { $set: { isActive: true } },
      { new: true }
    ).select('-password -refreshToken -resetPasswordToken -otp');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string, tenantId: string) {
    const user = await User.findOneAndUpdate(
      { _id: userId, tenantId },
      { $set: { isActive: false, deletedAt: new Date() } },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return { message: 'User deleted successfully' };
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole, tenantId: string) {
    return await User.find({ role, tenantId, isActive: true })
      .select('-password -refreshToken -resetPasswordToken -otp')
      .sort({ firstName: 1, lastName: 1 });
  }

  /**
   * Search users
   */
  async searchUsers(query: string, tenantId: string) {
    const searchRegex = new RegExp(query, 'i');
    
    return await User.find({
      tenantId,
      isActive: true,
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { department: searchRegex }
      ]
    })
    .select('-password -refreshToken -resetPasswordToken -otp')
    .limit(50);
  }

  /**
   * Get user statistics
   */
  async getUserStats(tenantId: string) {
    const [total, active, byRole] = await Promise.all([
      User.countDocuments({ tenantId }),
      User.countDocuments({ tenantId, isActive: true }),
      User.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ])
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byRole: byRole.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(userIds: string[], updates: any, tenantId: string) {
    const result = await User.updateMany(
      { _id: { $in: userIds }, tenantId },
      { $set: updates }
    );

    return {
      message: 'Users updated successfully',
      updatedCount: result.modifiedCount
    };
  }

  /**
   * Bulk delete users (soft delete)
   */
  async bulkDeleteUsers(userIds: string[], tenantId: string) {
    const result = await User.updateMany(
      { _id: { $in: userIds }, tenantId },
      { $set: { isActive: false, deletedAt: new Date() } }
    );

    return {
      message: 'Users deleted successfully',
      deletedCount: result.modifiedCount
    };
  }
}

export default new UserService();
