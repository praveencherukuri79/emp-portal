import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TeamService, TeamMember } from '../../services/team.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../../shared/models/enums';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [];
  baseColumns = ['avatar', 'name', 'email', 'role', 'status', 'lastActive', 'actions'];
  dataSource = new MatTableDataSource<TeamMember>();
  selection = new SelectionModel<TeamMember>(true, []);
  
  loading = true;
  error: string | null = null;
  searchTerm = '';
  roleFilter = '';
  statusFilter = '';
  
  roles = [
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'HR', label: 'HR' },
    { value: 'SUPERVISOR', label: 'Supervisor' },
    { value: 'ADMIN', label: 'Admin' }
  ];
  
  statuses = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'SUSPENDED', label: 'Suspended' }
  ];

  currentUserRole: UserRole = UserRole.EMPLOYEE;

  // Helper method to convert role string to UserRole enum
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

  constructor(
    private teamService: TeamService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserRole = user ? this.stringToUserRole(user.role) : UserRole.EMPLOYEE;
    
    // Set up display columns based on user role
    this.displayedColumns = [...this.baseColumns];
    if (this.currentUserRole >= UserRole.SUPERVISOR) {
      this.displayedColumns.unshift('select');
    }
    
    this.loadTeamMembers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom filter predicate
    this.dataSource.filterPredicate = (data: TeamMember, filter: string) => {
      const searchData = `${data.fullName} ${data.email} ${data.role}`.toLowerCase();
      return searchData.includes(filter.toLowerCase());
    };
  }

  loadTeamMembers(): void {
    this.loading = true;
    this.error = null;
    
    this.teamService.getTeamMembers().subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.loading = false;
        this.applyFilters();
      },
      error: (error) => {
        this.error = 'Failed to load team members. Please try again.';
        this.loading = false;
        console.error('Error loading team members:', error);
      }
    });
  }

  applySearch(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    this.applyRoleAndStatusFilters();
  }

  applyFilters(): void {
    let filteredData = this.dataSource.data;
    
    // Apply role filter
    if (this.roleFilter) {
      filteredData = filteredData.filter(member => member.role === this.roleFilter);
    }
    
    // Apply status filter
    if (this.statusFilter) {
      filteredData = filteredData.filter(member => member.status === this.statusFilter);
    }
    
    // Apply search filter if exists
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter(member => 
        member.fullName.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower) ||
        member.role.toLowerCase().includes(searchLower)
      );
    }
    
    // Create new data source to trigger table update
    this.dataSource.data = filteredData;
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyRoleAndStatusFilters(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.roleFilter = '';
    this.statusFilter = '';
    this.dataSource.filter = '';
    this.applyFilters();
  }

  // Selection methods
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() 
      ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  // Bulk actions
  canPerformBulkAction(): boolean {
    return this.selection.selected.length > 0 && 
           this.currentUserRole >= UserRole.SUPERVISOR;
  }

  bulkActivate(): void {
    if (!this.canPerformBulkAction()) return;
    
    const userIds = this.selection.selected.map(member => member._id);
    this.performBulkAction('activate', userIds, 'activated');
  }

  bulkDeactivate(): void {
    if (!this.canPerformBulkAction()) return;
    
    const userIds = this.selection.selected.map(member => member._id);
    this.performBulkAction('deactivate', userIds, 'deactivated');
  }

  bulkDelete(): void {
    if (!this.canPerformBulkAction()) return;
    
    // Show confirmation dialog
    const confirmMessage = `Are you sure you want to delete ${this.selection.selected.length} selected members? This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      const userIds = this.selection.selected.map(member => member._id);
      this.performBulkAction('delete', userIds, 'deleted');
    }
  }

  private performBulkAction(action: string, userIds: string[], actionPastTense: string): void {
    this.teamService.performBulkActions(action, userIds).subscribe({
      next: (result) => {
        this.snackBar.open(
          `Successfully ${actionPastTense} ${result.processedCount} members`, 
          'Close', 
          { duration: 3000 }
        );
        this.selection.clear();
        this.loadTeamMembers();
      },
      error: (error) => {
        this.snackBar.open(
          `Failed to ${action} selected members`, 
          'Close', 
          { duration: 5000 }
        );
        console.error(`Error performing bulk ${action}:`, error);
      }
    });
  }

  // Individual actions
  canEditMember(member: TeamMember): boolean {
    const memberRole = this.stringToUserRole(member.role);
    return this.currentUserRole >= UserRole.SUPERVISOR && 
           (this.currentUserRole > memberRole || this.currentUserRole >= UserRole.ADMIN);
  }

  viewMember(member: TeamMember): void {
    this.router.navigate(['/team/member', member._id]);
  }

  editMember(member: TeamMember): void {
    if (!this.canEditMember(member)) return;
    this.router.navigate(['/team/member', member._id, 'edit']);
  }

  toggleMemberStatus(member: TeamMember): void {
    if (!this.canEditMember(member)) return;
    
    const newStatus = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? 'activate' : 'deactivate';
    
    this.teamService.performBulkActions(action, [member._id]).subscribe({
      next: () => {
        this.snackBar.open(
          `Member ${newStatus.toLowerCase()}`, 
          'Close', 
          { duration: 3000 }
        );
        this.loadTeamMembers();
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

  deleteMember(member: TeamMember): void {
    if (!this.canEditMember(member)) return;
    
    const confirmMessage = `Are you sure you want to delete ${member.fullName}? This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      this.teamService.performBulkActions('delete', [member._id]).subscribe({
        next: () => {
          this.snackBar.open(
            'Member deleted successfully', 
            'Close', 
            { duration: 3000 }
          );
          this.loadTeamMembers();
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

  // Utility methods
  getRoleLabel(role: string): string {
    const roleObj = this.roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'primary';
      case 'INACTIVE': return 'warn';
      case 'SUSPENDED': return 'accent';
      default: return '';
    }
  }

  getInitials(member: TeamMember): string {
    const name = member.fullName || `${member.firstName} ${member.lastName}`;
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  refresh(): void {
    this.selection.clear();
    this.loadTeamMembers();
  }
}