import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  employeeInfo?: {
    employeeId?: string;
    department?: string;
    designation?: string;
    joiningDate?: Date;
    reportingTo?: string;
    employmentType?: 'full-time' | 'part-time' | 'contract' | 'intern';
    salary?: number;
  };
  visaInfo?: {
    type?: string;
    number?: string;
    expiryDate?: Date;
    status?: 'active' | 'expired' | 'pending';
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  phone?: string;
  employeeInfo?: {
    department?: string;
    designation?: string;
    joiningDate?: Date;
    employmentType?: 'full-time' | 'part-time' | 'contract' | 'intern';
  };
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  role?: string;
  isActive?: boolean;
  employeeInfo?: {
    employeeId?: string;
    department?: string;
    designation?: string;
    joiningDate?: Date;
    reportingTo?: string;
    employmentType?: 'full-time' | 'part-time' | 'contract' | 'intern';
    salary?: number;
  };
  visaInfo?: {
    type?: string;
    number?: string;
    expiryDate?: Date;
    status?: 'active' | 'expired' | 'pending';
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  // Get all users (Supervisor+)
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // Get current user profile
  getCurrentUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me/profile`);
  }

  // Get user by ID (Supervisor+)
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Create new user (Admin+)
  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  // Update user (Admin+ or own profile)
  updateUser(id: string, userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
  }

  // Delete user (Admin+)
  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // Bulk operations (Admin+)
  bulkUpdateUsers(userIds: string[], updates: Partial<UpdateUserRequest>): Observable<{ message: string; updatedCount: number }> {
    return this.http.post<{ message: string; updatedCount: number }>(`${this.apiUrl}/bulk-update`, {
      userIds,
      updates
    });
  }

  // Bulk delete users (Admin+)
  bulkDeleteUsers(userIds: string[]): Observable<{ message: string; deletedCount: number }> {
    return this.http.post<{ message: string; deletedCount: number }>(`${this.apiUrl}/bulk-delete`, {
      userIds
    });
  }

  // Helper methods for role management
  getAvailableRoles(): Array<{ value: string; label: string; level: number }> {
    return [
      { value: 'prospect', label: 'Prospect', level: 0 },
      { value: 'employee', label: 'Employee', level: 1 },
      { value: 'hr', label: 'HR', level: 2 },
      { value: 'supervisor', label: 'Supervisor', level: 3 },
      { value: 'admin', label: 'Admin', level: 4 },
      { value: 'employer', label: 'Employer', level: 5 }
    ];
  }

  getRoleLevel(role: string): number {
    const roleMap: Record<string, number> = {
      'prospect': 0,
      'employee': 1,
      'hr': 2,
      'supervisor': 3,
      'admin': 4,
      'employer': 5
    };
    return roleMap[role.toLowerCase()] || 0;
  }

  canAssignRole(currentUserRole: string, targetRole: string): boolean {
    const currentLevel = this.getRoleLevel(currentUserRole);
    const targetLevel = this.getRoleLevel(targetRole);
    return currentLevel > targetLevel;
  }

  getEmploymentTypes(): Array<{ value: string; label: string }> {
    return [
      { value: 'full-time', label: 'Full-time' },
      { value: 'part-time', label: 'Part-time' },
      { value: 'contract', label: 'Contract' },
      { value: 'intern', label: 'Intern' }
    ];
  }

  getVisaStatuses(): Array<{ value: string; label: string }> {
    return [
      { value: 'active', label: 'Active' },
      { value: 'expired', label: 'Expired' },
      { value: 'pending', label: 'Pending' }
    ];
  }
}