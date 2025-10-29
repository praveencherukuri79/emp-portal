import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { RoleService } from '@core/services/role.service';
import { ThemeService } from '@core/services/theme.service';
import { User } from '@shared/types';
import { UserRole } from '@shared/models/enums';
import { stringToUserRole } from '@shared/utils/role.utils';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: UserRole[];
  minRole?: UserRole;
}

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Services
  private authService = inject(AuthService);
  private roleService = inject(RoleService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  // State
  currentUser: User | null = null;
  sidenavOpened = true;
  isDark$ = this.themeService.isDark;

  // Navigation items - role-based
  navItems: NavItem[] = [];

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.updateNavigation();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateNavigation(): void {
    if (!this.currentUser) {
      this.navItems = [];
      return;
    }

    const userRole = stringToUserRole(this.currentUser.role);
    console.log('🔍 DEBUG - Current user:', this.currentUser);
    console.log('🔍 DEBUG - User role string:', this.currentUser.role);
    console.log('🔍 DEBUG - Parsed role enum:', userRole);
    console.log('🔍 DEBUG - UserRole.SUPERVISOR:', UserRole.SUPERVISOR);
    console.log('🔍 DEBUG - Role check (userRole >= UserRole.SUPERVISOR):', userRole >= UserRole.SUPERVISOR);
    
    // Define navigation based on user role
    if (userRole >= UserRole.SUPERVISOR) {
      // EMPLOYER PORTAL NAVIGATION (Supervisor, Admin, Employer)
      const employerItems: NavItem[] = [
        {
          label: 'Dashboard',
          icon: 'dashboard',
          route: '/dashboard'
        },
        {
          label: 'Team Management',
          icon: 'groups',
          route: '/team'
        },
        {
          label: 'User Management',
          icon: 'people',
          route: '/users',
          minRole: UserRole.ADMIN
        },
        {
          label: 'Reports & Analytics',
          icon: 'analytics',
          route: '/reports'
        },
        {
          label: 'Approvals',
          icon: 'check_circle',
          route: '/approvals'
        },
        // HR Portal - Coming Soon
        // {
        //   label: 'HR Portal',
        //   icon: 'business_center',
        //   route: '/hr',
        //   minRole: UserRole.HR
        // },
        {
          label: 'Settings',
          icon: 'settings',
          route: '/settings'
        }
      ];
      
      // Filter employer items based on user role
      this.navItems = employerItems.filter(item => {
        if (item.minRole) {
          return this.roleService.hasMinRole(this.currentUser, item.minRole);
        }
        return true;
      });
      
    } else {
      // EMPLOYEE PORTAL NAVIGATION (Employee, HR)  
      const employeeItems: NavItem[] = [
        {
          label: 'Dashboard',
          icon: 'dashboard',
          route: '/dashboard'
        },
        {
          label: 'My Timesheets',
          icon: 'schedule',
          route: '/timesheets'
        },
        {
          label: 'My Leaves',
          icon: 'event_available',
          route: '/leaves'
        },
        {
          label: 'My Documents',
          icon: 'folder_open',
          route: '/documents'
        },
        // HR Services - Coming Soon
        // {
        //   label: 'HR Services',
        //   icon: 'support_agent',
        //   route: '/hr-services',
        //   roles: [UserRole.HR]
        // },
        {
          label: 'Settings',
          icon: 'settings',
          route: '/settings'
        }
      ];
      
      // Filter employee items based on user role
      this.navItems = employeeItems.filter(item => {
        if (item.roles && item.roles.length > 0) {
          return this.roleService.hasRole(this.currentUser, ...item.roles);
        }
        return true;
      });
    }
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getUserInitials(): string {
    if (!this.currentUser) return '?';
    const first = this.currentUser.firstName?.charAt(0) || '';
    const last = this.currentUser.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'User';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  getRoleBadgeClass(): string {
    if (!this.currentUser) return '';
    const role = stringToUserRole(this.currentUser.role);
    
    const classMap: Record<UserRole, string> = {
      [UserRole.EMPLOYER]: 'role-employer',
      [UserRole.ADMIN]: 'role-admin',
      [UserRole.SUPERVISOR]: 'role-supervisor',
      [UserRole.HR]: 'role-hr',
      [UserRole.EMPLOYEE]: 'role-employee',
      [UserRole.PROSPECT]: 'role-prospect'
    };
    
    return classMap[role] || '';
  }

  getRoleDisplayName(): string {
    if (!this.currentUser) return '';
    const role = stringToUserRole(this.currentUser.role);
    return this.roleService.getRoleDisplayName(role);
  }
}
