import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamService, TeamMember, MemberActivity } from '../../services/team.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../../shared/models/enums';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss']
})
export class MemberDetailComponent implements OnInit {
  member: TeamMember | null = null;
  memberActivity: MemberActivity | null = null;
  loading = true;
  error: string | null = null;
  activeTab = 'profile';
  currentUserRole: UserRole = UserRole.EMPLOYEE;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserRole = user ? this.stringToUserRole(user.role) : UserRole.EMPLOYEE;
    
    this.route.paramMap.subscribe(params => {
      const memberId = params.get('id');
      if (memberId) {
        this.loadMemberDetails(memberId);
        this.loadMemberActivity(memberId);
      }
    });
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

  loadMemberDetails(memberId: string): void {
    // For now, we'll get member from team list
    // In a real app, you'd have a separate endpoint for individual member details
    this.teamService.getTeamMembers().subscribe({
      next: (response) => {
        this.member = response.data.find(m => m._id === memberId) || null;
        if (!this.member) {
          this.error = 'Member not found';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load member details';
        this.loading = false;
        console.error('Error loading member:', error);
      }
    });
  }

  loadMemberActivity(memberId: string): void {
    this.teamService.getMemberActivity(memberId).subscribe({
      next: (response) => {
        this.memberActivity = response.data;
      },
      error: (error) => {
        console.error('Error loading member activity:', error);
        // Don't show error for activity, it's secondary information
      }
    });
  }

  canEditMember(): boolean {
    if (!this.member) return false;
    const memberRole = this.stringToUserRole(this.member.role);
    return this.currentUserRole >= UserRole.SUPERVISOR && 
           (this.currentUserRole > memberRole || this.currentUserRole >= UserRole.ADMIN);
  }

  editMember(): void {
    if (this.member && this.canEditMember()) {
      this.router.navigate(['/team/member', this.member._id, 'edit']);
    }
  }

  toggleMemberStatus(): void {
    if (!this.member || !this.canEditMember()) return;
    
    const newStatus = this.member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? 'activate' : 'deactivate';
    
    this.teamService.performBulkActions(action, [this.member._id]).subscribe({
      next: () => {
        this.snackBar.open(
          `Member ${newStatus.toLowerCase()}`, 
          'Close', 
          { duration: 3000 }
        );
        if (this.member) {
          this.member.status = newStatus as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
        }
      },
      error: (error) => {
        this.snackBar.open(
          `Failed to ${action} member`, 
          'Close', 
          { duration: 5000 }
        );
        console.error(`Error toggling member status:`, error);
      }
    });
  }

  deleteMember(): void {
    if (!this.member || !this.canEditMember()) return;
    
    const confirmMessage = `Are you sure you want to delete ${this.member.fullName}? This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      this.teamService.performBulkActions('delete', [this.member._id]).subscribe({
        next: () => {
          this.snackBar.open(
            'Member deleted successfully', 
            'Close', 
            { duration: 3000 }
          );
          this.router.navigate(['/team']);
        },
        error: (error) => {
          this.snackBar.open(
            'Failed to delete member', 
            'Close', 
            { duration: 5000 }
          );
          console.error('Error deleting member:', error);
        }
      });
    }
  }

  getInitials(): string {
    if (!this.member) return '';
    const name = this.member.fullName || `${this.member.firstName} ${this.member.lastName}`;
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getRoleLabel(role: string): string {
    const roles = {
      'EMPLOYEE': 'Employee',
      'HR': 'HR',
      'SUPERVISOR': 'Supervisor',
      'ADMIN': 'Admin',
      'EMPLOYER': 'Employer'
    };
    return roles[role as keyof typeof roles] || role;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'primary';
      case 'INACTIVE': return 'warn';
      case 'SUSPENDED': return 'accent';
      default: return '';
    }
  }

  getTimesheetStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved': return 'primary';
      case 'pending': return 'warn';
      case 'rejected': return 'accent';
      case 'draft': return '';
      default: return '';
    }
  }

  getLeaveStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved': return 'primary';
      case 'pending': return 'warn';
      case 'rejected': return 'accent';
      default: return '';
    }
  }

  navigateToTimesheetDetail(timesheetId: string): void {
    // Navigate to timesheet detail page
    this.router.navigate(['/timesheets', timesheetId]);
  }

  navigateToLeaveDetail(leaveId: string): void {
    // Navigate to leave detail page
    this.router.navigate(['/leaves', leaveId]);
  }

  goBack(): void {
    this.router.navigate(['/team']);
  }

  onTabChange(index: number): void {
    this.activeTab = index === 0 ? 'profile' : 'activity';
  }

  refresh(): void {
    if (this.member) {
      this.loading = true;
      this.error = null;
      this.loadMemberDetails(this.member._id);
      this.loadMemberActivity(this.member._id);
    }
  }
}