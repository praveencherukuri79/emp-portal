import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '@env/environment';
import { DashboardStats, ActivityItem, ApiResponse } from '@shared/types';
import { DateUtil } from '@shared/utils/date.util';
import { AppConfigService } from '@core/services/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = environment.apiUrl;
  private refreshSubject = new BehaviorSubject<void>(undefined);
  private config = inject(AppConfigService);
  
  constructor(private http: HttpClient) {}

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    if (this.config.useStubData) {
      return of(this.getStubStats());
    }
    
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/dashboard/stats`)
      .pipe(
        map(response => response.data || this.getDefaultStats()),
        catchError(() => [this.getDefaultStats()])
      );
  }

  /**
   * Get recent activity
   */
  getRecentActivity(limit: number = 10): Observable<ActivityItem[]> {
    if (this.config.useStubData) {
      return of(this.getStubActivity());
    }
    
    return this.http.get<ApiResponse<ActivityItem[]>>(`${this.apiUrl}/dashboard/activity`, {
      params: { limit: limit.toString() }
    })
      .pipe(
        map(response => response.data || []),
        catchError(() => [[]])
      );
  }

  /**
   * Get upcoming deadlines
   */
  getUpcomingDeadlines(): Observable<ActivityItem[]> {
    if (this.config.useStubData) {
      return of(this.getStubDeadlines());
    }
    
    return this.http.get<ApiResponse<ActivityItem[]>>(`${this.apiUrl}/dashboard/deadlines`)
      .pipe(
        map(response => response.data || []),
        catchError(() => [[]])
      );
  }

  /**
   * Get pending approvals (for managers)
   */
  getPendingApprovals(): Observable<ActivityItem[]> {
    if (this.config.useStubData) {
      return of([]);
    }
    
    return this.http.get<ApiResponse<ActivityItem[]>>(`${this.apiUrl}/dashboard/pending-approvals`)
      .pipe(
        map(response => response.data || []),
        catchError(() => [[]])
      );
  }

  /**
   * Get combined dashboard data
   */
  getDashboardData(): Observable<{
    stats: DashboardStats;
    activity: ActivityItem[];
    deadlines: ActivityItem[];
    approvals: ActivityItem[];
  }> {
    return combineLatest([
      this.getDashboardStats(),
      this.getRecentActivity(5),
      this.getUpcomingDeadlines(),
      this.getPendingApprovals()
    ]).pipe(
      map(([stats, activity, deadlines, approvals]) => ({
        stats,
        activity,
        deadlines,
        approvals
      }))
    );
  }

  /**
   * Refresh dashboard data
   */
  refresh(): void {
    this.refreshSubject.next();
  }

  /**
   * Get refresh observable
   */
  getRefreshObservable(): Observable<void> {
    return this.refreshSubject.asObservable();
  }

  private getDefaultStats(): DashboardStats {
    return {
      hoursWorked: 0,
      pendingTimesheets: 0,
      leaveBalance: 20,
      pendingLeaves: 0,
      unreadNotifications: 0
    };
  }

  // Stub data methods
  private getStubStats(): DashboardStats {
    return {
      hoursWorked: 152,
      pendingTimesheets: 2,
      leaveBalance: 18,
      pendingLeaves: 1,
      unreadNotifications: 5
    };
  }

  private getStubActivity(): ActivityItem[] {
    const now = new Date();
    return [
      {
        id: '1',
        type: 'timesheet',
        title: 'Timesheet Submitted',
        description: 'Weekly timesheet for Oct 21-27 submitted for approval',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      },
      {
        id: '2',
        type: 'leave',
        title: 'Leave Request Approved',
        description: 'Annual leave request for Dec 20-24 has been approved',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'approved'
      },
      {
        id: '3',
        type: 'document',
        title: 'Document Uploaded',
        description: 'Training certificate uploaded successfully',
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: '4',
        type: 'notification',
        title: 'Policy Update',
        description: 'New remote work policy has been published',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private getStubDeadlines(): ActivityItem[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      {
        id: 'd1',
        type: 'timesheet',
        title: 'Timesheet Submission Due',
        description: 'Submit your weekly timesheet for Oct 21-27',
        timestamp: tomorrow.toISOString(),
        status: 'pending'
      },
      {
        id: 'd2',
        type: 'leave',
        title: 'Upcoming Leave',
        description: 'Annual leave starts on ' + nextWeek.toLocaleDateString(),
        timestamp: nextWeek.toISOString()
      }
    ];
  }

  private getMockActivity(): ActivityItem[] {
    const now = new Date();
    return [
      {
        id: '1',
        type: 'timesheet',
        title: 'Timesheet Submitted',
        description: 'Weekly timesheet for Oct 21-27 submitted for approval',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        actionUrl: '/timesheets'
      },
      {
        id: '2',
        type: 'leave',
        title: 'Leave Request Approved',
        description: 'Annual leave request for Dec 20-24 has been approved',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
        actionUrl: '/leaves'
      },
      {
        id: '3',
        type: 'document',
        title: 'Document Uploaded',
        description: 'Training certificate uploaded successfully',
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'success',
        actionUrl: '/documents'
      },
      {
        id: '4',
        type: 'notification',
        title: 'Policy Update',
        description: 'New remote work policy has been published',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/notifications'
      }
    ];
  }

  private getMockDeadlines(): ActivityItem[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      {
        id: 'd1',
        type: 'timesheet',
        title: 'Timesheet Due Tomorrow',
        description: 'Submit your weekly timesheet by end of day',
        timestamp: tomorrow.toISOString(),
        actionUrl: '/timesheets'
      },
      {
        id: 'd2',
        type: 'leave',
        title: 'Annual Leave Planning',
        description: 'Plan your remaining annual leave days (5 days left)',
        timestamp: nextWeek.toISOString(),
        actionUrl: '/leaves'
      }
    ];
  }
}