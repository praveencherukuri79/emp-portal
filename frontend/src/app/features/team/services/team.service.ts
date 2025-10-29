import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
  joinDate?: Date;
  isActive: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLogin?: Date;
  avatar?: string;
  phone?: string;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingTimesheets: number;
  pendingLeaves: number;
  thisMonthTimesheets: number;
  thisMonthLeaves: number;
}

export interface MemberActivity {
  timesheets: Array<{
    _id: string;
    date: Date;
    hours: number;
    project: string;
    description: string;
    status: string;
  }>;
  leaves: Array<{
    _id: string;
    leaveType: string;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    status: string;
    reason: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = `${environment.apiUrl}/team`;

  constructor(private http: HttpClient) { }

  getTeamMembers(): Observable<{ success: boolean; data: TeamMember[] }> {
    return this.http.get<{ success: boolean; data: TeamMember[] }>(`${this.apiUrl}/members`);
  }

  getTeamStats(): Observable<{ success: boolean; data: TeamStats }> {
    return this.http.get<{ success: boolean; data: TeamStats }>(`${this.apiUrl}/stats`);
  }

  getMemberActivity(userId: string): Observable<{ success: boolean; data: MemberActivity }> {
    return this.http.get<{ success: boolean; data: MemberActivity }>(`${this.apiUrl}/${userId}/activity`);
  }

  performBulkActions(action: string, userIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-actions`, { action, userIds });
  }
}