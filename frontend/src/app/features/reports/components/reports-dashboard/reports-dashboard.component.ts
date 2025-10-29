import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ReportsService, AnalyticsData } from '../../services/reports.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../../shared/models/enums';

@Component({
  selector: 'app-reports-dashboard',
  templateUrl: './reports-dashboard.component.html',
  styleUrls: ['./reports-dashboard.component.scss']
})
export class ReportsDashboardComponent implements OnInit {
  analytics: AnalyticsData | null = null;
  loading = true;
  error: string | null = null;
  
  currentUserRole: UserRole = UserRole.EMPLOYEE;
  
  // Chart data
  timesheetTrendData: any[] = [];
  leaveTrendData: any[] = [];
  projectHoursData: any[] = [];
  
  // Chart options
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      }
    }
  };

  constructor(
    private reportsService: ReportsService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserRole = user ? this.stringToUserRole(user.role) : UserRole.EMPLOYEE;
    
    if (this.currentUserRole >= UserRole.SUPERVISOR) {
      this.loadAnalytics();
    } else {
      this.error = 'You do not have permission to view reports';
      this.loading = false;
    }
  }

  private stringToUserRole(roleString: string): UserRole {
    switch (roleString.toLowerCase()) {
      case 'employer': return UserRole.EMPLOYER;
      case 'admin': return UserRole.ADMIN;
      case 'supervisor': return UserRole.SUPERVISOR;
      case 'hr': return UserRole.HR;
      case 'employee': return UserRole.EMPLOYEE;
      case 'prospect': return UserRole.PROSPECT;
      default: return UserRole.EMPLOYEE;
    }
  }

  loadAnalytics(): void {
    this.loading = true;
    this.error = null;
    
    this.reportsService.getAnalytics().subscribe({
      next: (response) => {
        this.analytics = response.data;
        this.prepareChartData();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load analytics data';
        this.loading = false;
        console.error('Error loading analytics:', error);
      }
    });
  }

  private prepareChartData(): void {
    if (!this.analytics) return;

    // Timesheet trend chart data
    this.timesheetTrendData = [{
      data: this.analytics.trends.timesheetSubmissions.map(item => item.count),
      label: 'Timesheet Submissions',
      borderColor: '#2196f3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      fill: true
    }];

    // Leave trend chart data
    this.leaveTrendData = [{
      data: this.analytics.trends.leaveRequests.map(item => item.count),
      label: 'Leave Requests',
      borderColor: '#ff9800',
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
      fill: true
    }];

    // Project hours doughnut chart data
    this.projectHoursData = [{
      data: this.analytics.trends.projectHours.map(item => item.hours),
      backgroundColor: [
        '#2196f3', '#4caf50', '#ff9800', '#f44336', 
        '#9c27b0', '#00bcd4', '#ffeb3b', '#795548'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }];
  }

  // Navigation methods
  navigateToTimesheetReports(): void {
    this.router.navigate(['/reports/timesheets']);
  }

  navigateToLeaveReports(): void {
    this.router.navigate(['/reports/leaves']);
  }

  navigateToAttendanceReports(): void {
    this.router.navigate(['/reports/attendance']);
  }

  navigateToUserManagement(): void {
    this.router.navigate(['/users']);
  }

  navigateToTeamManagement(): void {
    this.router.navigate(['/team']);
  }

  // Export methods
  exportAnalyticsReport(): void {
    // This would generate a comprehensive analytics PDF
    this.snackBar.open('Analytics export feature coming soon', 'Close', { duration: 3000 });
  }

  // Utility methods
  getProductivityIcon(): string {
    if (!this.analytics) return 'trending_flat';
    
    switch (this.analytics.thisMonth.productivity.trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'trending_flat';
    }
  }

  getProductivityColor(): string {
    if (!this.analytics) return '';
    
    switch (this.analytics.thisMonth.productivity.trend) {
      case 'up': return 'success';
      case 'down': return 'warn';
      default: return 'primary';
    }
  }

  getProductivityChange(): number {
    if (!this.analytics) return 0;
    
    return this.analytics.thisMonth.productivity.current - this.analytics.thisMonth.productivity.previous;
  }

  formatHours(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }

  refresh(): void {
    this.loadAnalytics();
  }
}