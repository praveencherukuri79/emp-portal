/**
 * Shared enums used across the application
 */

export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  PERSONAL = 'personal',
  UNPAID = 'unpaid',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity'
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum TimesheetStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum DocumentCategory {
  CONTRACT = 'contract',
  CERTIFICATION = 'certification',
  ID = 'id',
  TAX = 'tax',
  OTHER = 'other'
}

export enum UserRole {
  PROSPECT = 0,
  EMPLOYEE = 1,
  HR = 2,
  SUPERVISOR = 3,
  ADMIN = 4,
  EMPLOYER = 5
}

export const UserRoleNames = {
  [UserRole.PROSPECT]: 'prospect',
  [UserRole.EMPLOYEE]: 'employee',
  [UserRole.HR]: 'hr',
  [UserRole.SUPERVISOR]: 'supervisor',
  [UserRole.ADMIN]: 'admin',
  [UserRole.EMPLOYER]: 'employer'
};
