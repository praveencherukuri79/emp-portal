/**
 * Core Interfaces
 * Base interfaces used throughout the application
 */

/**
 * Base entity with common fields
 */
export interface BaseEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  timestamp: Date;
  statusCode?: number;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: Pagination;
  message?: string;
  timestamp: Date;
}

/**
 * Pagination metadata
 */
export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Loading state
 */
export interface LoadingState {
  loading: boolean;
  message?: string;
  progress?: number;
}

/**
 * Error state
 */
export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
  details?: any;
}

/**
 * Navigation item
 */
export interface NavigationItem {
  id: string;
  label: string;
  route?: string;
  icon?: string;
  badge?: string | number;
  badgeColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  disabled?: boolean;
  children?: NavigationItem[];
  permission?: string;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  route?: string;
  icon?: string;
  active?: boolean;
}

/**
 * Tab item
 */
export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
  content?: any;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in';
  value: any;
}

/**
 * Search configuration
 */
export interface SearchConfig {
  query: string;
  fields?: string[];
  caseSensitive?: boolean;
}

/**
 * File upload metadata
 */
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

/**
 * Toast notification
 */
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number;
  action?: ToastAction;
}

/**
 * Toast action
 */
export interface ToastAction {
  label: string;
  callback: () => void;
}

/**
 * Modal configuration
 */
export interface ModalConfig {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';
  showCancel?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  mode: 'auto' | 'light' | 'dark' | 'corporate';
  variant: 'light' | 'dark' | 'corporate';
  systemPreference: 'light' | 'dark';
  reducedMotion: boolean;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: ThemeConfig;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: NotificationPreferences;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  categories: Record<string, boolean>;
}

/**
 * Audit log entry
 */
export interface AuditLog extends BaseEntity {
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, { old: any; new: any }>;
  ipAddress?: string;
  userAgent?: string;
  userId: string;
  userName: string;
}

/**
 * Key-value pair
 */
export interface KeyValue<T = string> {
  key: string;
  value: T;
  label?: string;
}

/**
 * Dropdown option
 */
export interface DropdownOption<T = any> {
  value: T;
  label: string;
  icon?: string;
  disabled?: boolean;
  group?: string;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

/**
 * Date range
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Time period
 */
export type TimePeriod = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'custom';

/**
 * Address
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Contact information
 */
export interface ContactInfo {
  email?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  website?: string;
}

/**
 * Generic result type
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Optional fields helper
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Required fields helper
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
