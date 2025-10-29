/**
 * Shared enums used across backend
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
  EMPLOYER = 'employer',
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  HR = 'hr',
  EMPLOYEE = 'employee',
  PROSPECT = 'prospect'
}
