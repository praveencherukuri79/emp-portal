import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export class ApiUtil {
  /**
   * Handle HTTP errors and return user-friendly messages
   */
  static handleError(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      return `Network error: ${error.error.message}`;
    }

    // Server-side error
    switch (error.status) {
      case 0:
        return 'Unable to connect to server. Please check your internet connection.';
      case 400:
        return error.error?.message || 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return error.error?.message || 'Conflict with existing data.';
      case 422:
        return error.error?.message || 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return error.error?.message || `Unexpected error occurred (${error.status})`;
    }
  }

  /**
   * Show success message
   */
  static showSuccess(snackBar: MatSnackBar, message: string): void {
    snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Show error message
   */
  static showError(snackBar: MatSnackBar, message: string): void {
    snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Show info message
   */
  static showInfo(snackBar: MatSnackBar, message: string): void {
    snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Create request options with headers
   */
  static createRequestOptions(additionalHeaders: Record<string, string> = {}): any {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...additionalHeaders
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return { headers };
  }

  /**
   * Create FormData for file uploads
   */
  static createFormData(data: Record<string, any>): FormData {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item instanceof File) {
            formData.append(`${key}[${index}]`, item);
          } else {
            formData.append(`${key}[${index}]`, String(item));
          }
        });
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    return formData;
  }

  /**
   * Build query string from object
   */
  static buildQueryString(params: Record<string, any>): string {
    const filtered = Object.keys(params)
      .filter(key => params[key] !== null && params[key] !== undefined && params[key] !== '')
      .reduce((obj, key) => {
        obj[key] = params[key];
        return obj;
      }, {} as Record<string, any>);

    return new URLSearchParams(filtered).toString();
  }

  /**
   * Extract validation errors from API response
   */
  static extractValidationErrors(error: HttpErrorResponse): Record<string, string> {
    if (error.error?.errors) {
      const result: Record<string, string> = {};
      Object.keys(error.error.errors).forEach(field => {
        const fieldErrors = error.error.errors[field];
        result[field] = Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
      });
      return result;
    }
    return {};
  }
}