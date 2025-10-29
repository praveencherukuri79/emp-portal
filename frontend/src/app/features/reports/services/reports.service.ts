import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TimesheetReport {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: Date;
  project: string;
  description: string;
  hours: number;
  status: string;
  submittedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface LeaveReport {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  status: string;
  reason: string;
  submittedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface AttendanceReport {
  userId: string;
  userName: string;
  userEmail: string;
  totalDays: number;
  workingDays: number;
  attendancePercentage: number;
  totalHours: number;
  averageHoursPerDay: number;
  lateArrivals: number;
  earlyDepartures: number;
}

export interface AnalyticsData {
  totalEmployees: number;
  activeProjects: number;
  totalTimesheets: number;
  totalLeaves: number;
  pendingApprovals: {
    timesheets: number;
    leaves: number;
  };
  thisMonth: {
    totalHours: number;
    averageHoursPerEmployee: number;
    topPerformer: {
      name: string;
      hours: number;
    };
    productivity: {
      current: number;
      previous: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  trends: {
    timesheetSubmissions: Array<{
      date: string;
      count: number;
    }>;
    leaveRequests: Array<{
      date: string;
      count: number;
    }>;
    projectHours: Array<{
      project: string;
      hours: number;
      percentage: number;
    }>;
  };
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  project?: string;
  status?: string;
  department?: string;
  leaveType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) { }

  // Timesheet Reports
  getTimesheetReports(filters?: ReportFilters): Observable<{ success: boolean; data: TimesheetReport[]; summary: any }> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<{ success: boolean; data: TimesheetReport[]; summary: any }>(`${this.apiUrl}/timesheets`, { params });
  }

  // Leave Reports
  getLeaveReports(filters?: ReportFilters): Observable<{ success: boolean; data: LeaveReport[]; summary: any }> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<{ success: boolean; data: LeaveReport[]; summary: any }>(`${this.apiUrl}/leaves`, { params });
  }

  // Attendance Reports
  getAttendanceReports(filters?: ReportFilters): Observable<{ success: boolean; data: AttendanceReport[] }> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<{ success: boolean; data: AttendanceReport[] }>(`${this.apiUrl}/attendance`, { params });
  }

  // Analytics Dashboard
  getAnalytics(): Observable<{ success: boolean; data: AnalyticsData }> {
    return this.http.get<{ success: boolean; data: AnalyticsData }>(`${environment.apiUrl}/analytics/dashboard`);
  }

  // Export Functions
  exportTimesheetReport(filters?: ReportFilters, format: 'csv' | 'pdf' = 'csv'): Observable<Blob> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params = params.set(key, value.toString());
        }
      });
    }
    params = params.set('format', format);
    
    return this.http.get(`${this.apiUrl}/timesheets/export`, { 
      params, 
      responseType: 'blob' 
    });
  }

  exportLeaveReport(filters?: ReportFilters, format: 'csv' | 'pdf' = 'csv'): Observable<Blob> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params = params.set(key, value.toString());
        }
      });
    }
    params = params.set('format', format);
    
    return this.http.get(`${this.apiUrl}/leaves/export`, { 
      params, 
      responseType: 'blob' 
    });
  }

  exportAttendanceReport(filters?: ReportFilters, format: 'csv' | 'pdf' = 'csv'): Observable<Blob> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params = params.set(key, value.toString());
        }
      });
    }
    params = params.set('format', format);
    
    return this.http.get(`${this.apiUrl}/attendance/export`, { 
      params, 
      responseType: 'blob' 
    });
  }

  // Utility Methods
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  getLeaveTypes(): Array<{ value: string; label: string }> {
    return [
      { value: 'annual', label: 'Annual Leave' },
      { value: 'sick', label: 'Sick Leave' },
      { value: 'personal', label: 'Personal Leave' },
      { value: 'unpaid', label: 'Unpaid Leave' },
      { value: 'maternity', label: 'Maternity Leave' },
      { value: 'paternity', label: 'Paternity Leave' }
    ];
  }

  getStatusOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'draft', label: 'Draft' }
    ];
  }

  // Date utilities for reports
  getDateRange(period: 'today' | 'week' | 'month' | 'quarter' | 'year'): { startDate: string; endDate: string } {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    let startDate: string;

    switch (period) {
      case 'today':
        startDate = endDate;
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        startDate = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = monthStart.toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
        startDate = quarterStart.toISOString().split('T')[0];
        break;
      case 'year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        startDate = yearStart.toISOString().split('T')[0];
        break;
      default:
        startDate = endDate;
    }

    return { startDate, endDate };
  }
}