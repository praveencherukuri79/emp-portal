import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { DashboardService } from '@shared/services/dashboard.service';
import { DialogService } from '@shared/services/dialog.service';
import { TimesheetService } from '@core/services/timesheet.service';
import { UserRole } from '@shared/models/enums';
import { stringToUserRole } from '@shared/utils/role.utils';
import { LeaveService } from '@core/services/leave.service';
import { DocumentService } from '@core/services/document.service';
import { DashboardStats, ActivityItem, User } from '@shared/types';
import { DateUtil } from '@shared/utils/date.util';
import { LogTimeDialogComponent } from '@shared/components/log-time-dialog/log-time-dialog.component';
import { LeaveRequestDialogComponent } from '@shared/components/leave-request-dialog/leave-request-dialog.component';
import { DocumentUploadDialogComponent } from '@shared/components/document-upload-dialog/document-upload-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Services
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private dashboardService = inject(DashboardService);
  private dialogService = inject(DialogService);
  private timesheetService = inject(TimesheetService);
  private leaveService = inject(LeaveService);
  private documentService = inject(DocumentService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  // Component state
  currentUser: User | null = null;
  currentUserRole: UserRole = UserRole.EMPLOYEE;
  dashboardStats: DashboardStats | null = null;
  recentActivity: ActivityItem[] = [];
  upcomingDeadlines: ActivityItem[] = [];
  pendingApprovals: ActivityItem[] = [];
  loading = true;

  // Theme
  currentTheme = this.themeService.currentTheme;
  isDark = this.themeService.isDark;

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserData(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.currentUserRole = user ? stringToUserRole(user.role) : UserRole.EMPLOYEE;
        console.log('🎯 Dashboard - Current user role:', this.currentUserRole);
      });
  }

  private loadDashboardData(): void {
    this.loading = true;
    
    this.dashboardService.getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardStats = data.stats;
          this.recentActivity = data.activity;
          this.upcomingDeadlines = data.deadlines;
          this.pendingApprovals = data.approvals;
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load dashboard data:', error);
          this.loading = false;
        }
      });
  }

  refreshDashboard(): void {
    this.dashboardService.refresh();
    this.loadDashboardData();
  }

  changeTheme(theme: 'light' | 'dark' | 'corporate'): void {
    this.themeService.setTheme(theme);
  }

  openLogTimeDialog(): void {
    const dialogRef = this.dialog.open(LogTimeDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Dialog already submitted to backend, just refresh
        this.refreshDashboard();
      }
    });
  }

  openLeaveRequestDialog(): void {
    const dialogRef = this.dialog.open(LeaveRequestDialogComponent, {
      width: '650px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Dialog already submitted to backend, just refresh
        this.refreshDashboard();
      }
    });
  }

  openDocumentUploadDialog(): void {
    const dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Dialog already submitted to backend, just refresh
        this.refreshDashboard();
      }
    });
  }

  navigateToTimesheet(): void {
    this.router.navigate(['/timesheets']);
  }

  navigateToLeave(): void {
    this.router.navigate(['/leaves']);
  }

  navigateToDocuments(): void {
    this.router.navigate(['/documents']);
  }

  navigateToNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  onActivityClick(activity: ActivityItem): void {
    if (activity.actionUrl) {
      this.router.navigate([activity.actionUrl]);
    }
  }

  formatRelativeTime(timestamp: string): string {
    return DateUtil.getRelativeTime(timestamp);
  }

  formatDisplayTime(timestamp: string): string {
    return DateUtil.formatDisplay(timestamp);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  logout(): void {
    this.dialogService.confirm({
      title: 'Confirm Logout',
      message: 'Are you sure you want to log out?',
      confirmText: 'Logout',
      cancelText: 'Cancel'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  // Role-based content helpers
  isEmployer(): boolean {
    return this.currentUserRole >= UserRole.SUPERVISOR;
  }

  isEmployee(): boolean {
    return this.currentUserRole < UserRole.SUPERVISOR;
  }

  // Navigation methods for employer actions
  navigateToTeamManagement(): void {
    this.router.navigate(['/team']);
  }

  navigateToUserManagement(): void {
    this.router.navigate(['/users']);
  }

  navigateToReports(): void {
    this.router.navigate(['/reports']);
  }

  navigateToApprovals(): void {
    this.router.navigate(['/approvals']);
  }
}