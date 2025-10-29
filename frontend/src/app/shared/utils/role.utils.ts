/**
 * Utility functions for working with user roles
 */

import { UserRole } from '../models/enums';

/**
 * Converts a string role to UserRole enum
 */
export function stringToUserRole(roleString: string): UserRole {
  switch (roleString.toLowerCase()) {
    case 'employer':
      return UserRole.EMPLOYER;
    case 'admin':
      return UserRole.ADMIN;
    case 'supervisor':
      return UserRole.SUPERVISOR;
    case 'hr':
      return UserRole.HR;
    case 'employee':
      return UserRole.EMPLOYEE;
    case 'prospect':
      return UserRole.PROSPECT;
    default:
      return UserRole.EMPLOYEE; // Default fallback
  }
}

/**
 * Converts UserRole enum to string
 */
export function userRoleToString(role: UserRole): string {
  switch (role) {
    case UserRole.EMPLOYER:
      return 'employer';
    case UserRole.ADMIN:
      return 'admin';
    case UserRole.SUPERVISOR:
      return 'supervisor';
    case UserRole.HR:
      return 'hr';
    case UserRole.EMPLOYEE:
      return 'employee';
    case UserRole.PROSPECT:
      return 'prospect';
    default:
      return 'employee';
  }
}

/**
 * Gets the role level for comparison
 */
export function getRoleLevel(role: UserRole | string): number {
  if (typeof role === 'string') {
    role = stringToUserRole(role);
  }
  return role;
}

/**
 * Gets display name for a role
 */
export function getRoleDisplayName(role: UserRole | string): string {
  if (typeof role === 'string') {
    role = stringToUserRole(role);
  }
  
  switch (role) {
    case UserRole.EMPLOYER:
      return 'Employer';
    case UserRole.ADMIN:
      return 'Administrator';
    case UserRole.SUPERVISOR:
      return 'Supervisor';
    case UserRole.HR:
      return 'HR Manager';
    case UserRole.EMPLOYEE:
      return 'Employee';
    case UserRole.PROSPECT:
      return 'Prospect';
    default:
      return 'Employee';
  }
}