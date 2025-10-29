/**
 * Messages System
 * Centralized static text content for all UI components
 * Type-safe message management with helper functions
 */

// ============================================================================
// Message Interfaces
// ============================================================================

export interface MessageLabels {
  app: {
    name: string;
    title: string;
    description: string;
  };
  header: {
    logoText: string;
    navigation: {
      home: string;
      employees: string;
      documents: string;
      timesheets: string;
      leaves: string;
      settings: string;
    };
    actions: {
      newRequest: string;
      notifications: string;
      profile: string;
      logout: string;
    };
  };
  auth: {
    login: {
      title: string;
      subtitle: string;
      emailLabel: string;
      emailPlaceholder: string;
      passwordLabel: string;
      passwordPlaceholder: string;
      rememberMe: string;
      forgotPassword: string;
      submit: string;
      submitting: string;
      noAccount: string;
      signUp: string;
    };
    register: {
      title: string;
      subtitle: string;
      firstNameLabel: string;
      lastNameLabel: string;
      emailLabel: string;
      passwordLabel: string;
      confirmPasswordLabel: string;
      submit: string;
      submitting: string;
      hasAccount: string;
      signIn: string;
    };
    forgotPassword: {
      title: string;
      subtitle: string;
      emailLabel: string;
      submit: string;
      submitting: string;
      backToLogin: string;
    };
    resetPassword: {
      title: string;
      subtitle: string;
      passwordLabel: string;
      confirmPasswordLabel: string;
      submit: string;
      submitting: string;
    };
  };
  dashboard: {
    welcome: string;
    welcomeBack: string;
    overview: string;
    stats: {
      totalEmployees: string;
      activeEmployees: string;
      pendingLeaves: string;
      pendingTimesheets: string;
      totalDocuments: string;
      recentDocuments: string;
    };
    quickActions: {
      title: string;
      newEmployee: string;
      uploadDocument: string;
      submitTimesheet: string;
      requestLeave: string;
      viewReports: string;
    };
    recentActivity: {
      title: string;
      viewAll: string;
      noActivity: string;
    };
  };
  employees: {
    title: string;
    addEmployee: string;
    searchPlaceholder: string;
    filterByDepartment: string;
    filterByStatus: string;
    table: {
      name: string;
      email: string;
      department: string;
      position: string;
      status: string;
      hireDate: string;
      actions: string;
    };
    status: {
      active: string;
      inactive: string;
      onLeave: string;
    };
    actions: {
      view: string;
      edit: string;
      delete: string;
      activate: string;
      deactivate: string;
    };
    form: {
      title: string;
      editTitle: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      department: string;
      position: string;
      hireDate: string;
      save: string;
      cancel: string;
      saving: string;
    };
  };
  documents: {
    title: string;
    uploadDocument: string;
    searchPlaceholder: string;
    filterByType: string;
    table: {
      name: string;
      type: string;
      size: string;
      uploadedBy: string;
      uploadDate: string;
      actions: string;
    };
    actions: {
      download: string;
      view: string;
      delete: string;
      share: string;
    };
    upload: {
      title: string;
      dragDrop: string;
      orBrowse: string;
      maxSize: string;
      allowedTypes: string;
      uploading: string;
      uploadSuccess: string;
      uploadFailed: string;
    };
  };
  timesheets: {
    title: string;
    submitTimesheet: string;
    viewHistory: string;
    table: {
      date: string;
      project: string;
      hours: string;
      description: string;
      status: string;
      actions: string;
    };
    status: {
      draft: string;
      submitted: string;
      approved: string;
      rejected: string;
    };
    form: {
      title: string;
      date: string;
      project: string;
      hours: string;
      description: string;
      submit: string;
      saveDraft: string;
      cancel: string;
    };
  };
  leaves: {
    title: string;
    requestLeave: string;
    balance: string;
    table: {
      type: string;
      startDate: string;
      endDate: string;
      days: string;
      reason: string;
      status: string;
      actions: string;
    };
    types: {
      annual: string;
      sick: string;
      personal: string;
      unpaid: string;
    };
    status: {
      pending: string;
      approved: string;
      rejected: string;
      cancelled: string;
    };
    form: {
      title: string;
      type: string;
      startDate: string;
      endDate: string;
      reason: string;
      submit: string;
      cancel: string;
      submitting: string;
    };
  };
  settings: {
    title: string;
    tabs: {
      profile: string;
      preferences: string;
      security: string;
      notifications: string;
    };
    theme: {
      title: string;
      light: string;
      dark: string;
      corporate: string;
      auto: string;
    };
    profileSettings: {
      avatar: string;
      changeAvatar: string;
      name: string;
      email: string;
      phone: string;
      bio: string;
      save: string;
      saving: string;
    };
    securitySettings: {
      changePassword: string;
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
      twoFactor: string;
      enable: string;
      disable: string;
    };
  };
  common: {
    loading: string;
    loadingMore: string;
    saving: string;
    saved: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    view: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    search: string;
    filter: string;
    sort: string;
    actions: string;
    noData: string;
    noResults: string;
    confirm: string;
    confirmDelete: string;
    areYouSure: string;
    yes: string;
    no: string;
    ok: string;
    retry: string;
    refresh: string;
  };
  errors: {
    required: string;
    invalidEmail: string;
    invalidPhone: string;
    passwordTooShort: string;
    passwordMismatch: string;
    networkError: string;
    serverError: string;
    unauthorized: string;
    forbidden: string;
    notFound: string;
    validationFailed: string;
    uploadFailed: string;
    downloadFailed: string;
  };
  validation: {
    required: (field: string) => string;
    minLength: (field: string, min: number) => string;
    maxLength: (field: string, max: number) => string;
    email: string;
    phone: string;
    url: string;
    number: string;
    date: string;
  };
}

// ============================================================================
// Message Content
// ============================================================================

export const messageLabels: MessageLabels = {
  app: {
    name: 'Employee Portal',
    title: 'Employee & Employer Management Portal',
    description: 'Comprehensive platform for managing employees, documents, timesheets, and leave requests'
  },
  
  header: {
    logoText: 'Employee Portal',
    navigation: {
      home: 'Dashboard',
      employees: 'Employees',
      documents: 'Documents',
      timesheets: 'Timesheets',
      leaves: 'Leave Management',
      settings: 'Settings'
    },
    actions: {
      newRequest: 'New Request',
      notifications: 'Notifications',
      profile: 'My Profile',
      logout: 'Logout'
    }
  },
  
  auth: {
    login: {
      title: 'Welcome Back',
      subtitle: 'Sign in to your account to continue',
      emailLabel: 'Email Address',
      emailPlaceholder: 'Enter your email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot Password?',
      submit: 'Sign In',
      submitting: 'Signing in...',
      noAccount: "Don't have an account?",
      signUp: 'Sign Up'
    },
    register: {
      title: 'Create Account',
      subtitle: 'Join our platform today',
      firstNameLabel: 'First Name',
      lastNameLabel: 'Last Name',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      confirmPasswordLabel: 'Confirm Password',
      submit: 'Create Account',
      submitting: 'Creating account...',
      hasAccount: 'Already have an account?',
      signIn: 'Sign In'
    },
    forgotPassword: {
      title: 'Forgot Password',
      subtitle: 'Enter your email to receive reset instructions',
      emailLabel: 'Email Address',
      submit: 'Send Reset Link',
      submitting: 'Sending...',
      backToLogin: 'Back to Login'
    },
    resetPassword: {
      title: 'Reset Password',
      subtitle: 'Create a new password for your account',
      passwordLabel: 'New Password',
      confirmPasswordLabel: 'Confirm New Password',
      submit: 'Reset Password',
      submitting: 'Resetting...'
    }
  },
  
  dashboard: {
    welcome: 'Welcome',
    welcomeBack: 'Welcome back',
    overview: 'Overview',
    stats: {
      totalEmployees: 'Total Employees',
      activeEmployees: 'Active Employees',
      pendingLeaves: 'Pending Leave Requests',
      pendingTimesheets: 'Pending Timesheets',
      totalDocuments: 'Total Documents',
      recentDocuments: 'Recent Documents'
    },
    quickActions: {
      title: 'Quick Actions',
      newEmployee: 'Add Employee',
      uploadDocument: 'Upload Document',
      submitTimesheet: 'Submit Timesheet',
      requestLeave: 'Request Leave',
      viewReports: 'View Reports'
    },
    recentActivity: {
      title: 'Recent Activity',
      viewAll: 'View All',
      noActivity: 'No recent activity'
    }
  },
  
  employees: {
    title: 'Employees',
    addEmployee: 'Add Employee',
    searchPlaceholder: 'Search employees...',
    filterByDepartment: 'Filter by Department',
    filterByStatus: 'Filter by Status',
    table: {
      name: 'Name',
      email: 'Email',
      department: 'Department',
      position: 'Position',
      status: 'Status',
      hireDate: 'Hire Date',
      actions: 'Actions'
    },
    status: {
      active: 'Active',
      inactive: 'Inactive',
      onLeave: 'On Leave'
    },
    actions: {
      view: 'View Details',
      edit: 'Edit',
      delete: 'Delete',
      activate: 'Activate',
      deactivate: 'Deactivate'
    },
    form: {
      title: 'Add New Employee',
      editTitle: 'Edit Employee',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      phone: 'Phone Number',
      department: 'Department',
      position: 'Position',
      hireDate: 'Hire Date',
      save: 'Save Employee',
      cancel: 'Cancel',
      saving: 'Saving...'
    }
  },
  
  documents: {
    title: 'Documents',
    uploadDocument: 'Upload Document',
    searchPlaceholder: 'Search documents...',
    filterByType: 'Filter by Type',
    table: {
      name: 'Document Name',
      type: 'Type',
      size: 'Size',
      uploadedBy: 'Uploaded By',
      uploadDate: 'Upload Date',
      actions: 'Actions'
    },
    actions: {
      download: 'Download',
      view: 'View',
      delete: 'Delete',
      share: 'Share'
    },
    upload: {
      title: 'Upload Document',
      dragDrop: 'Drag and drop files here',
      orBrowse: 'or browse',
      maxSize: 'Max size: 10MB',
      allowedTypes: 'Allowed: PDF, DOC, DOCX, XLS, XLSX',
      uploading: 'Uploading...',
      uploadSuccess: 'Upload successful',
      uploadFailed: 'Upload failed'
    }
  },
  
  timesheets: {
    title: 'Timesheets',
    submitTimesheet: 'Submit Timesheet',
    viewHistory: 'View History',
    table: {
      date: 'Date',
      project: 'Project',
      hours: 'Hours',
      description: 'Description',
      status: 'Status',
      actions: 'Actions'
    },
    status: {
      draft: 'Draft',
      submitted: 'Submitted',
      approved: 'Approved',
      rejected: 'Rejected'
    },
    form: {
      title: 'Submit Timesheet',
      date: 'Date',
      project: 'Project',
      hours: 'Hours Worked',
      description: 'Description',
      submit: 'Submit Timesheet',
      saveDraft: 'Save as Draft',
      cancel: 'Cancel'
    }
  },
  
  leaves: {
    title: 'Leave Management',
    requestLeave: 'Request Leave',
    balance: 'Leave Balance',
    table: {
      type: 'Leave Type',
      startDate: 'Start Date',
      endDate: 'End Date',
      days: 'Days',
      reason: 'Reason',
      status: 'Status',
      actions: 'Actions'
    },
    types: {
      annual: 'Annual Leave',
      sick: 'Sick Leave',
      personal: 'Personal Leave',
      unpaid: 'Unpaid Leave'
    },
    status: {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      cancelled: 'Cancelled'
    },
    form: {
      title: 'Request Leave',
      type: 'Leave Type',
      startDate: 'Start Date',
      endDate: 'End Date',
      reason: 'Reason',
      submit: 'Submit Request',
      cancel: 'Cancel',
      submitting: 'Submitting...'
    }
  },
  
  settings: {
    title: 'Settings',
    tabs: {
      profile: 'Profile',
      preferences: 'Preferences',
      security: 'Security',
      notifications: 'Notifications'
    },
    theme: {
      title: 'Theme',
      light: 'Light',
      dark: 'Dark',
      corporate: 'Corporate',
      auto: 'Auto'
    },
    profileSettings: {
      avatar: 'Profile Picture',
      changeAvatar: 'Change Avatar',
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      bio: 'Bio',
      save: 'Save Changes',
      saving: 'Saving...'
    },
    securitySettings: {
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      twoFactor: 'Two-Factor Authentication',
      enable: 'Enable',
      disable: 'Disable'
    }
  },
  
  common: {
    loading: 'Loading...',
    loadingMore: 'Loading more...',
    saving: 'Saving...',
    saved: 'Saved successfully',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    actions: 'Actions',
    noData: 'No data available',
    noResults: 'No results found',
    confirm: 'Confirm',
    confirmDelete: 'Are you sure you want to delete this item?',
    areYouSure: 'Are you sure?',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    retry: 'Retry',
    refresh: 'Refresh'
  },
  
  errors: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    invalidPhone: 'Please enter a valid phone number',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordMismatch: 'Passwords do not match',
    networkError: 'Network error. Please check your connection',
    serverError: 'Server error. Please try again later',
    unauthorized: 'Unauthorized. Please login again',
    forbidden: 'You do not have permission to perform this action',
    notFound: 'Resource not found',
    validationFailed: 'Validation failed. Please check your inputs',
    uploadFailed: 'Upload failed. Please try again',
    downloadFailed: 'Download failed. Please try again'
  },
  
  validation: {
    required: (field: string) => `${field} is required`,
    minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
    maxLength: (field: string, max: number) => `${field} must not exceed ${max} characters`,
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    url: 'Please enter a valid URL',
    number: 'Please enter a valid number',
    date: 'Please enter a valid date'
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a message by dot-notation path
 * @param path - Dot-notation path to message (e.g., 'auth.login.title')
 * @returns The message string or the path if not found
 */
export function getMessage(path: string): string {
  const keys = path.split('.');
  let value: any = messageLabels;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      console.warn(`Message not found for path: ${path}`);
      return path;
    }
  }
  
  return typeof value === 'string' ? value : path;
}

/**
 * Get multiple messages as an object
 * @param paths - Array of dot-notation paths
 * @returns Object with paths as keys and messages as values
 */
export function getMessages(paths: string[]): Record<string, string> {
  const messages: Record<string, string> = {};
  
  for (const path of paths) {
    messages[path] = getMessage(path);
  }
  
  return messages;
}

/**
 * Get all messages for a specific section
 * @param section - Section key (e.g., 'auth', 'dashboard')
 * @returns The section object or empty object if not found
 */
export function getSection<K extends keyof MessageLabels>(section: K): MessageLabels[K] {
  return messageLabels[section];
}

// ============================================================================
// Type Exports for Convenience
// ============================================================================

export type AppMessages = MessageLabels['app'];
export type HeaderMessages = MessageLabels['header'];
export type AuthMessages = MessageLabels['auth'];
export type DashboardMessages = MessageLabels['dashboard'];
export type EmployeesMessages = MessageLabels['employees'];
export type DocumentsMessages = MessageLabels['documents'];
export type TimesheetsMessages = MessageLabels['timesheets'];
export type LeavesMessages = MessageLabels['leaves'];
export type SettingsMessages = MessageLabels['settings'];
export type CommonMessages = MessageLabels['common'];
export type ErrorMessages = MessageLabels['errors'];
export type ValidationMessages = MessageLabels['validation'];

// ============================================================================
// Convenience Export
// ============================================================================

/**
 * Convenient alias for messageLabels
 * Use: import { messages } from './messages';
 */
export const messages = messageLabels;
