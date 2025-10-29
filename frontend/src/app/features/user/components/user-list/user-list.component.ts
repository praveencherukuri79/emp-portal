import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../../shared/models/enums';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['select', 'avatar', 'name', 'email', 'role', 'department', 'status', 'lastLogin', 'actions'];
  dataSource = new MatTableDataSource<User>();
  selection = new SelectionModel<User>(true, []);
  
  loading = true;
  error: string | null = null;
  searchTerm = '';
  roleFilter = '';
  statusFilter = '';
  departmentFilter = '';
  
  currentUser: any = null;
  currentUserRole: UserRole = UserRole.EMPLOYEE;
  
  roles: Array<{ value: string; label: string; level: number }> = [];
  departments: Array<{ value: string; label: string }> = [];
  statuses = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.currentUserRole = this.currentUser ? this.stringToUserRole(this.currentUser.role) : UserRole.EMPLOYEE;
    
    // Get available roles based on current user's level
    this.roles = this.userService.getAvailableRoles()
      .filter(role => role.level < this.getRoleLevel(this.currentUser?.role || 'employee'));
    
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom filter predicate
    this.dataSource.filterPredicate = (data: User, filter: string) => {
      const searchData = `${data.firstName} ${data.lastName} ${data.email} ${data.role}`.toLowerCase();
      return searchData.includes(filter.toLowerCase());
    };
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

  getRoleLevel(role: string): number {
    return this.userService.getRoleLevel(role);
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.extractDepartments(users);
        this.loading = false;
        this.applyFilters();
      },
      error: (error) => {
        this.error = 'Failed to load users. Please try again.';
        this.loading = false;
        console.error('Error loading users:', error);
      }
    });
  }

  private extractDepartments(users: User[]): void {
    const departmentSet = new Set<string>();
    users.forEach(user => {
      if (user.employeeInfo?.department) {
        departmentSet.add(user.employeeInfo.department);
      }
    });
    this.departments = Array.from(departmentSet).map(dept => ({
      value: dept,
      label: dept
    }));
  }

  applySearch(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    this.applyAdditionalFilters();
  }

  applyFilters(): void {
    this.applyAdditionalFilters();
  }

  private applyAdditionalFilters(): void {
    let filteredData = [...this.dataSource.data];
    
    // Apply role filter
    if (this.roleFilter) {
      filteredData = filteredData.filter(user => user.role === this.roleFilter);
    }
    
    // Apply status filter
    if (this.statusFilter) {
      const isActive = this.statusFilter === 'true';
      filteredData = filteredData.filter(user => user.isActive === isActive);
    }
    
    // Apply department filter
    if (this.departmentFilter) {
      filteredData = filteredData.filter(user => 
        user.employeeInfo?.department === this.departmentFilter
      );
    }
    
    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower) ||
        (user.employeeInfo?.department && user.employeeInfo.department.toLowerCase().includes(searchLower))
      );
    }
    
    // Update data source
    this.dataSource.data = filteredData;
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.roleFilter = '';
    this.statusFilter = '';
    this.departmentFilter = '';
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

  // Permission checks
  canCreateUser(): boolean {
    return this.currentUserRole >= UserRole.ADMIN;
  }

  canEditUser(user: User): boolean {
    if (this.currentUserRole >= UserRole.ADMIN) {
      const userLevel = this.getRoleLevel(user.role);
      const currentLevel = this.getRoleLevel(this.currentUser?.role || 'employee');
      return currentLevel > userLevel;
    }
    return false;
  }

  canDeleteUser(user: User): boolean {
    return this.canEditUser(user) && user._id !== this.currentUser?.userId;
  }

  canPerformBulkAction(): boolean {
    return this.selection.selected.length > 0 && this.currentUserRole >= UserRole.ADMIN;
  }

  // CRUD Operations
  createUser(): void {
    if (!this.canCreateUser()) return;
    this.router.navigate(['/users/new']);
  }

  viewUser(user: User): void {
    this.router.navigate(['/users', user._id]);
  }

  editUser(user: User): void {
    if (!this.canEditUser(user)) return;
    this.router.navigate(['/users', user._id, 'edit']);
  }

  deleteUser(user: User): void {
    if (!this.canDeleteUser(user)) return;
    
    const confirmMessage = `Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      this.userService.deleteUser(user._id).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete user', 'Close', { duration: 5000 });
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  // Bulk operations
  bulkActivate(): void {
    if (!this.canPerformBulkAction()) return;
    
    const userIds = this.selection.selected.map(user => user._id);
    this.userService.bulkUpdateUsers(userIds, { isActive: true }).subscribe({
      next: (result) => {
        this.snackBar.open(
          `Successfully activated ${result.updatedCount} users`, 
          'Close', 
          { duration: 3000 }
        );
        this.selection.clear();
        this.loadUsers();
      },
      error: (error) => {
        this.snackBar.open('Failed to activate selected users', 'Close', { duration: 5000 });
        console.error('Error activating users:', error);
      }
    });
  }

  bulkDeactivate(): void {
    if (!this.canPerformBulkAction()) return;
    
    const userIds = this.selection.selected.map(user => user._id);
    this.userService.bulkUpdateUsers(userIds, { isActive: false }).subscribe({
      next: (result) => {
        this.snackBar.open(
          `Successfully deactivated ${result.updatedCount} users`, 
          'Close', 
          { duration: 3000 }
        );
        this.selection.clear();
        this.loadUsers();
      },
      error: (error) => {
        this.snackBar.open('Failed to deactivate selected users', 'Close', { duration: 5000 });
        console.error('Error deactivating users:', error);
      }
    });
  }

  bulkDelete(): void {
    if (!this.canPerformBulkAction()) return;
    
    const confirmMessage = `Are you sure you want to delete ${this.selection.selected.length} selected users? This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      const userIds = this.selection.selected
        .filter(user => this.canDeleteUser(user))
        .map(user => user._id);
      
      if (userIds.length === 0) {
        this.snackBar.open('No users can be deleted from selection', 'Close', { duration: 3000 });
        return;
      }
      
      this.userService.bulkDeleteUsers(userIds).subscribe({
        next: (result) => {
          this.snackBar.open(
            `Successfully deleted ${result.deletedCount} users`, 
            'Close', 
            { duration: 3000 }
          );
          this.selection.clear();
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete selected users', 'Close', { duration: 5000 });
          console.error('Error deleting users:', error);
        }
      });
    }
  }

  // Utility methods
  getRoleLabel(role: string): string {
    const roleObj = this.roles.find(r => r.value === role) || 
                   this.userService.getAvailableRoles().find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'primary' : 'warn';
  }

  getInitials(user: User): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  refresh(): void {
    this.selection.clear();
    this.loadUsers();
  }
}