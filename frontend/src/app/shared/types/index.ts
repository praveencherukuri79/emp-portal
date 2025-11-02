// User-related types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  department?: string;
  position?: string;
  phoneNumber?: string;
  startDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Timesheet-related types
export interface TimesheetEntry {
  id: string;
  userId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  breakDuration?: number; // minutes
  projectId?: string;
  projectName?: string;
  description?: string;
  taskDescription?: string; // backend field name
  hours?: number; // hours-only entries
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  totalHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimesheetSummary {
  weekStartDate: string;
  weekEndDate: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  entries: TimesheetEntry[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

// Leave-related types
export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approverComments?: string;
  documents?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  userId: string;
  year: number;
  annual: {
    total: number;
    used: number;
    pending: number;
    remaining: number;
  };
  sick: {
    total: number;
    used: number;
    remaining: number;
  };
  personal: {
    total: number;
    used: number;
    remaining: number;
  };
}

// Document-related types
export interface Document {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  category: 'contract' | 'certificate' | 'policy' | 'timesheet' | 'leave' | 'personal' | 'other';
  description?: string;
  tags: string[];
  isPrivate: boolean;
  downloadCount: number;
  uploadedAt: string;
  updatedAt: string;
}

// Notification-related types
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  expiresAt?: string;
}

// Project-related types
export interface Project {
  id: string;
  name: string;
  description?: string;
  clientName?: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  startDate: string;
  endDate?: string;
  budget?: number;
  isActive: boolean;
  createdAt: string;
}

// Analytics-related types
export interface DashboardStats {
  hoursWorked: number;
  pendingTimesheets: number;
  leaveBalance: number;
  pendingLeaves: number;
  unreadNotifications: number;
}

export interface ActivityItem {
  id: string;
  type: 'timesheet' | 'leave' | 'document' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  actionUrl?: string;
}

// Form-related types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'textarea' | 'select' | 'checkbox' | 'file';
  required: boolean;
  placeholder?: string;
  options?: { value: any; label: string }[];
  validation?: any[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Common types
export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}