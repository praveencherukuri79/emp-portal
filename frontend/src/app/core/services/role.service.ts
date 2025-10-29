import { Injectable } from '@angular/core';
import { UserRole } from '@shared/models/enums';
import { User } from '@shared/types';
import { stringToUserRole, getRoleLevel, getRoleDisplayName } from '@shared/utils/role.utils';

// Role hierarchy: higher number = more permissions
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.PROSPECT]: 0,
  [UserRole.EMPLOYEE]: 1,
  [UserRole.HR]: 2,
  [UserRole.SUPERVISOR]: 3,
  [UserRole.ADMIN]: 4,
  [UserRole.EMPLOYER]: 5
};

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  /**
   * Check if user has one of the specified roles
   */
  hasRole(user: User | null, ...roles: UserRole[]): boolean {
    if (!user) return false;
    const userRole = stringToUserRole(user.role);
    return roles.includes(userRole);
  }

  /**
   * Check if user has minimum role level (hierarchical)
   */
  hasMinRole(user: User | null, minRole: UserRole): boolean {
    if (!user) return false;
    const userRole = stringToUserRole(user.role);
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const minLevel = ROLE_HIERARCHY[minRole] || 0;
    return userLevel >= minLevel;
  }

  /**
   * Check if user can manage another user (based on role hierarchy)
   */
  canManage(user: User | null, targetRole: UserRole): boolean {
    if (!user) return false;
    const userRole = stringToUserRole(user.role);
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
    return userLevel > targetLevel;
  }

  /**
   * Check if user can approve/reject (Supervisor and above)
   */
  canApprove(user: User | null): boolean {
    return this.hasMinRole(user, UserRole.SUPERVISOR);
  }

  /**
   * Check if user can access HR features
   */
  canAccessHR(user: User | null): boolean {
    return this.hasMinRole(user, UserRole.HR);
  }

  /**
   * Check if user can access admin features
   */
  canAccessAdmin(user: User | null): boolean {
    return this.hasMinRole(user, UserRole.ADMIN);
  }

  /**
   * Check if user is employer
   */
  isEmployer(user: User | null): boolean {
    return this.hasRole(user, UserRole.EMPLOYER);
  }

  /**
   * Check if user is employee or lower
   */
  isEmployee(user: User | null): boolean {
    if (!user) return false;
    const userRole = stringToUserRole(user.role);
    const level = ROLE_HIERARCHY[userRole] || 0;
    return level <= ROLE_HIERARCHY[UserRole.EMPLOYEE];
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(role: UserRole): string {
    const roleNames: Record<UserRole, string> = {
      [UserRole.PROSPECT]: 'Prospect',
      [UserRole.EMPLOYEE]: 'Employee',
      [UserRole.HR]: 'HR',
      [UserRole.SUPERVISOR]: 'Supervisor',
      [UserRole.ADMIN]: 'Administrator',
      [UserRole.EMPLOYER]: 'Employer'
    };
    return roleNames[role] || 'Unknown';
  }

  /**
   * Get all roles
   */
  getAllRoles(): UserRole[] {
    return [
      UserRole.PROSPECT,
      UserRole.EMPLOYEE,
      UserRole.HR,
      UserRole.SUPERVISOR,
      UserRole.ADMIN,
      UserRole.EMPLOYER
    ];
  }

  /**
   * Get roles that current user can assign
   */
  getAssignableRoles(user: User | null): UserRole[] {
    if (!user) return [];
    const userRole = stringToUserRole(user.role);
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    
    return this.getAllRoles().filter(role => {
      const roleLevel = ROLE_HIERARCHY[role] || 0;
      return roleLevel < userLevel; // Can only assign lower roles
    });
  }

  /**
   * Get role level (for comparison)
   */
  getRoleLevel(role: UserRole): number {
    return ROLE_HIERARCHY[role] || 0;
  }
}
