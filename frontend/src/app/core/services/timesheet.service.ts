/**
 * Consolidated Timesheet Service
 * Manages all timesheet-related operations including entries, approvals, and summaries
 * @author emp-portal
 * @version 2.0.0
 */

import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '@env/environment';
import { TimesheetEntry, TimesheetSummary, Project, ApiResponse } from '@shared/types';
import { DateUtil } from '@shared/utils/date.util';

/**
 * Batch request for creating multiple timesheet entries
 */
export interface TimesheetBatchRequest {
  project: string;
  entries: {
    date: Date | string;
    hours: number;
    billable: boolean;
  }[];
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  private readonly apiUrl = `${environment.apiUrl}/timesheets`;
  
  // Reactive state
  private refreshSubject = new BehaviorSubject<void>(undefined);
  public refresh$ = this.refreshSubject.asObservable();
  
  // Loading state signal
  loading = signal(false);

  constructor(private http: HttpClient) {}

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  /**
   * Get all timesheet entries (optionally filtered by date range)
   */
  getTimesheets(params?: { startDate?: string; endDate?: string }): Observable<TimesheetEntry[]> {
    let httpParams = new HttpParams();
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);

    return this.http.get<TimesheetEntry[]>(this.apiUrl, { params: httpParams }).pipe(
      catchError(this.handleError<TimesheetEntry[]>('getTimesheets', []))
    );
  }

  /**
   * Get specific timesheet entry by ID
   */
  getTimesheet(id: string): Observable<TimesheetEntry> {
    return this.http.get<TimesheetEntry>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError<TimesheetEntry>('getTimesheet'))
    );
  }

  /**
   * Get timesheet entries for a specific date range
   */
  getTimesheetEntries(startDate: string, endDate: string): Observable<TimesheetEntry[]> {
    const params = { startDate, endDate };
    return this.http.get<ApiResponse<TimesheetEntry[]>>(this.apiUrl, { params }).pipe(
      map(response => response.data || response as any || []),
      catchError(this.handleError<TimesheetEntry[]>('getTimesheetEntries', []))
    );
  }

  /**
   * Create single timesheet entry
   */
  createEntry(entry: Partial<TimesheetEntry>): Observable<TimesheetEntry> {
    this.loading.set(true);
    return this.http.post<ApiResponse<TimesheetEntry>>(this.apiUrl, entry).pipe(
      map(response => response.data || response as any),
      tap(() => {
        this.loading.set(false);
        this.triggerRefresh();
      }),
      catchError((error) => {
        this.loading.set(false);
        return this.handleError<TimesheetEntry>('createEntry')(error);
      })
    );
  }

  /**
   * Create multiple timesheet entries (batch)
   */
  createTimesheet(data: TimesheetBatchRequest): Observable<TimesheetEntry[]> {
    this.loading.set(true);
    return this.http.post<TimesheetEntry[]>(this.apiUrl, data).pipe(
      tap(() => {
        this.loading.set(false);
        this.triggerRefresh();
      }),
      catchError((error) => {
        this.loading.set(false);
        return this.handleError<TimesheetEntry[]>('createTimesheet', [])(error);
      })
    );
  }

  /**
   * Update existing timesheet entry
   */
  updateTimesheet(id: string, data: Partial<TimesheetEntry>): Observable<TimesheetEntry> {
    this.loading.set(true);
    return this.http.put<TimesheetEntry>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => {
        this.loading.set(false);
        this.triggerRefresh();
      }),
      catchError((error) => {
        this.loading.set(false);
        return this.handleError<TimesheetEntry>('updateTimesheet')(error);
      })
    );
  }

  /**
   * Update existing timesheet entry (alias for updateTimesheet)
   */
  updateEntry(id: string, entry: Partial<TimesheetEntry>): Observable<TimesheetEntry> {
    return this.updateTimesheet(id, entry);
  }

  /**
   * Delete timesheet entry
   */
  deleteTimesheet(id: string): Observable<void> {
    this.loading.set(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.loading.set(false);
        this.triggerRefresh();
      }),
      catchError((error) => {
        this.loading.set(false);
        return this.handleError<void>('deleteTimesheet')(error);
      })
    );
  }

  /**
   * Delete timesheet entry (alias for deleteTimesheet)
   */
  deleteEntry(id: string): Observable<void> {
    return this.deleteTimesheet(id);
  }

  // ============================================================================
  // Approval Operations
  // ============================================================================

  /**
   * Get pending timesheets for approval
   */
  getPendingTimesheets(): Observable<TimesheetEntry[]> {
    return this.http.get<TimesheetEntry[]>(`${this.apiUrl}/pending`).pipe(
      catchError(this.handleError<TimesheetEntry[]>('getPendingTimesheets', []))
    );
  }

  /**
   * Approve timesheet
   */
  approveTimesheet(id: string): Observable<TimesheetEntry> {
    return this.http.patch<TimesheetEntry>(`${this.apiUrl}/${id}/approve`, {}).pipe(
      tap(() => this.triggerRefresh()),
      catchError(this.handleError<TimesheetEntry>('approveTimesheet'))
    );
  }

  /**
   * Reject timesheet with reason
   */
  rejectTimesheet(id: string, reason: string): Observable<TimesheetEntry> {
    return this.http.patch<TimesheetEntry>(`${this.apiUrl}/${id}/reject`, { 
      rejectionReason: reason 
    }).pipe(
      tap(() => this.triggerRefresh()),
      catchError(this.handleError<TimesheetEntry>('rejectTimesheet'))
    );
  }

  /**
   * Submit timesheet for approval
   */
  submitTimesheet(startDate: string, endDate: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/submit`, { startDate, endDate }).pipe(
      tap(() => this.triggerRefresh()),
      catchError(this.handleError<void>('submitTimesheet'))
    );
  }

  // ============================================================================
  // Summary & Analytics
  // ============================================================================

  /**
   * Get current week timesheet summary
   */
  getCurrentWeekSummary(): Observable<TimesheetSummary> {
    const { start, end } = DateUtil.getCurrentWeekRange();
    return this.http.get<ApiResponse<TimesheetSummary>>(`${this.apiUrl}/week-summary`, {
      params: {
        startDate: DateUtil.formatForInput(start),
        endDate: DateUtil.formatForInput(end)
      }
    }).pipe(
      map(response => response.data || response as any),
      catchError(this.handleError<TimesheetSummary>('getCurrentWeekSummary'))
    );
  }

  /**
   * Calculate total hours for entries
   */
  calculateTotalHours(entries: TimesheetEntry[]): number {
    return entries.reduce((total, entry) => {
      if (entry.totalHours) {
        return total + entry.totalHours;
      } else if (entry.startTime && entry.endTime) {
        const hours = DateUtil.calculateHours(entry.startTime, entry.endTime);
        const breakHours = (entry.breakDuration || 0) / 60;
        return total + Math.max(0, hours - breakHours);
      }
      return total;
    }, 0);
  }

  // ============================================================================
  // Projects
  // ============================================================================

  /**
   * Get available projects
   */
  getProjects(): Observable<Project[]> {
    return this.http.get<ApiResponse<Project[]>>(`${environment.apiUrl}/projects`).pipe(
      map(response => response.data || response as any || []),
      catchError(this.handleError<Project[]>('getProjects', []))
    );
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Trigger refresh for components listening
   */
  triggerRefresh(): void {
    this.refreshSubject.next();
  }

  /**
   * Handle HTTP errors
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Log to remote logging service in production
      if (environment.production) {
        // TODO: Send to logging service
      }

      // Return default result to keep app running
      if (result !== undefined) {
        return of(result as T);
      }
      
      return throwError(() => error);
    };
  }
}
