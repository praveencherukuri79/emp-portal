/**
 * Employee Interface
 * Data models for employee management
 */

import { BaseEntity, Address, ContactInfo } from './core.interface';

/**
 * Employee status
 */
export type EmployeeStatus = 'active' | 'inactive' | 'onLeave' | 'terminated';

/**
 * Employment type
 */
export type EmploymentType = 'fullTime' | 'partTime' | 'contract' | 'intern';

/**
 * Employee interface
 */
export interface Employee extends BaseEntity {
  // Personal information
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  mobile?: string;
  dateOfBirth?: Date;
  avatar?: string;
  
  // Employment details
  employeeId: string;
  department: string;
  position: string;
  status: EmployeeStatus;
  employmentType: EmploymentType;
  hireDate: Date;
  terminationDate?: Date;
  
  // Contact information
  address?: Address;
  emergencyContact?: EmergencyContact;
  
  // Work details
  manager?: string;
  managerId?: string;
  reportingTo?: string;
  workLocation?: string;
  workSchedule?: WorkSchedule;
  
  // Compensation
  salary?: number;
  currency?: string;
  paymentFrequency?: 'hourly' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
  
  // Benefits
  benefits?: string[];
  
  // Leave balances
  leaveBalance?: LeaveBalance;
  
  // Skills & certifications
  skills?: string[];
  certifications?: Certification[];
  
  // Performance
  performanceRating?: number;
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  
  // Notes
  notes?: string;
  
  // Metadata
  tenantId?: string;
}

/**
 * Emergency contact
 */
export interface EmergencyContact extends ContactInfo {
  name: string;
  relationship: string;
}

/**
 * Work schedule
 */
export interface WorkSchedule {
  monday: WorkDay;
  tuesday: WorkDay;
  wednesday: WorkDay;
  thursday: WorkDay;
  friday: WorkDay;
  saturday: WorkDay;
  sunday: WorkDay;
}

/**
 * Work day
 */
export interface WorkDay {
  isWorkingDay: boolean;
  startTime?: string;
  endTime?: string;
  breakDuration?: number; // in minutes
}

/**
 * Leave balance
 */
export interface LeaveBalance {
  annual: number;
  sick: number;
  personal: number;
  unpaid: number;
  [key: string]: number;
}

/**
 * Certification
 */
export interface Certification {
  name: string;
  issuedBy: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  url?: string;
}

/**
 * Employee filter options
 */
export interface EmployeeFilterOptions {
  status?: EmployeeStatus[];
  department?: string[];
  position?: string[];
  employmentType?: EmploymentType[];
  searchQuery?: string;
}

/**
 * Employee sort options
 */
export type EmployeeSortField = 'firstName' | 'lastName' | 'email' | 'department' | 'position' | 'hireDate' | 'status';

/**
 * Employee create DTO
 */
export type CreateEmployeeDto = Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'fullName'>;

/**
 * Employee update DTO
 */
export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;

/**
 * Employee statistics
 */
export interface EmployeeStatistics {
  total: number;
  active: number;
  inactive: number;
  onLeave: number;
  terminated: number;
  byDepartment: Record<string, number>;
  byPosition: Record<string, number>;
  byEmploymentType: Record<string, number>;
  averageTenure: number; // in months
  newHiresThisMonth: number;
  terminationsThisMonth: number;
}
