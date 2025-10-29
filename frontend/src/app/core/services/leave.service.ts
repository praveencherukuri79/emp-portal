/**
 * Consolidated Leave Service
 * Manages all leave-related operations including requests, approvals, and balance tracking
 * @author emp-portal
 * @version 2.0.0
 */

import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '@env/environment';
import { LeaveRequest, LeaveBalance } from '@shared/types';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private readonly apiUrl = `${environment.apiUrl}/leaves`;
  
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
   * Get all leave requests (optionally filtered)
   */
  getLeaves(params?: { status?: string; startDate?: string; endDate?: string }): Observable<LeaveRequest[]> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);

    return this.http.get<LeaveRequest[]>(this.apiUrl, { params: httpParams }).pipe(
      catchError(this.handleError<LeaveRequest[]>('getLeaves', []))
    );
  }

  /**
   * Get specific leave request by ID
   */
  getLeave(id: string): Observable<LeaveRequest> {
    return this.http.get<LeaveRequest>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError<LeaveRequest>('getLeave'))
    );
  }

  /**
   * Create new leave request
   */
  createLeaveRequest(data: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Observable<LeaveRequest> {
    this.loading.set(true);
    return this.http.post<LeaveRequest>(this.apiUrl, data).pipe(
      tap(() => {
        this.loading.set(false);
        this.triggerRefresh();
      }),
      catchError((error) => {
        this.loading.set(false);
        return this.handleError<LeaveRequest>('createLeaveRequest')(error);
      })
    );
  }

  /**
   * Create leave (alias for createLeaveRequest)
   */
  createLeave(data: any): Observable<LeaveRequest> {
    return this.createLeaveRequest(data);
  }

  /**
   * Update existing leave request
   */
  updateLeaveRequest(id: string, data: Partial<LeaveRequest>): Observable<LeaveRequest> {
    this.loading.set(true);
    return this.http.put<LeaveRequest>(`${this.apiUrl}/${id}`, data).pipe(
      tap(() => {
        this.loading.set(false);
        this.triggerRefresh();
      }),
      catchError((error) => {
        this.loading.set(false);
        return this.handleError<LeaveRequest>('updateLeaveRequest')(error);
      })
    );
  }

  /**
   * Update leave (alias for updateLeaveRequest)
   */
  updateLeave(id: string, data: Partial<LeaveRequest>): Observable<LeaveRequest> {
    return this.updateLeaveRequest(id, data);
  }

  /**
   * Cancel leave request (soft delete)
   */
  cancelLeaveRequest(id: string): Observable<void> {
    this.loading.set(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.loading.set(false);
        this.triggerRefresh();
      }),
      catchError((error) => {
        this.loading.set(false);
        return this.handleError<void>('cancelLeaveRequest')(error);
      })
    );
  }

  /**
   * Delete leave (alias for cancelLeaveRequest)
   */
  deleteLeave(id: string): Observable<void> {
    return this.cancelLeaveRequest(id);
  }

  // ============================================================================
  // Approval Operations
  // ============================================================================

  /**
   * Get pending leave requests for approval
   */
  getPendingLeaves(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/pending`).pipe(
      catchError(this.handleError<LeaveRequest[]>('getPendingLeaves', []))
    );
  }

  /**
   * Approve leave request
   */
  approveLeave(id: string): Observable<LeaveRequest> {
    return this.http.patch<LeaveRequest>(`${this.apiUrl}/${id}/approve`, {}).pipe(
      tap(() => this.triggerRefresh()),
      catchError(this.handleError<LeaveRequest>('approveLeave'))
    );
  }

  /**
   * Reject leave request with reason
   */
  rejectLeave(id: string, reason: string): Observable<LeaveRequest> {
    return this.http.patch<LeaveRequest>(`${this.apiUrl}/${id}/reject`, { 
      rejectionReason: reason 
    }).pipe(
      tap(() => this.triggerRefresh()),
      catchError(this.handleError<LeaveRequest>('rejectLeave'))
    );
  }

  // ============================================================================
  // Balance & Analytics
  // ============================================================================

  /**
   * Get leave balance for current user
   */
  getLeaveBalance(): Observable<LeaveBalance> {
    return this.http.get<LeaveBalance>(`${this.apiUrl}/balance`).pipe(
      catchError(this.handleError<LeaveBalance>('getLeaveBalance'))
    );
  }

  /**
   * Get leave balance for specific user (admin/manager only)
   */
  getUserLeaveBalance(userId: string): Observable<LeaveBalance> {
    return this.http.get<LeaveBalance>(`${this.apiUrl}/balance/${userId}`).pipe(
      catchError(this.handleError<LeaveBalance>('getUserLeaveBalance'))
    );
  }

  /**
   * Calculate days between two dates
   */
  calculateDays(startDate: string | Date, endDate: string | Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
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
