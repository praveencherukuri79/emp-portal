import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './core/components/layout/layout.component';
import { UserRole } from './shared/models/enums';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Common Dashboard (role-specific content)
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      
      // ========================================
      // EMPLOYEE FEATURES 
      // ========================================
      {
        path: 'timesheets',
        loadChildren: () => import('./features/timesheets/timesheets.module').then(m => m.TimesheetsModule),
        data: { roles: [UserRole.EMPLOYEE, UserRole.HR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.EMPLOYER] }
      },
      {
        path: 'leaves',
        loadChildren: () => import('./features/leaves/leaves.module').then(m => m.LeavesModule),
        data: { roles: [UserRole.EMPLOYEE, UserRole.HR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.EMPLOYER] }
      },
      {
        path: 'documents',
        loadChildren: () => import('./features/documents/documents.module').then(m => m.DocumentsModule),
        data: { roles: [UserRole.EMPLOYEE, UserRole.HR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.EMPLOYER] }
      },
      
      // ========================================
      // EMPLOYER FEATURES (Supervisor+)
      // ========================================
      {
        path: 'team',
        loadChildren: () => import('./features/team/team.module').then(m => m.TeamModule),
        canActivate: [RoleGuard],
        data: { minRole: UserRole.SUPERVISOR }
      },
      {
        path: 'users',
        loadChildren: () => import('./features/user/user.module').then(m => m.UserModule),
        canActivate: [RoleGuard],
        data: { minRole: UserRole.ADMIN }
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule),
        canActivate: [RoleGuard],
        data: { minRole: UserRole.SUPERVISOR }
      },
      {
        path: 'approvals',
        loadChildren: () => import('./features/approvals/approvals.module').then(m => m.ApprovalsModule),
        canActivate: [RoleGuard],
        data: { minRole: UserRole.SUPERVISOR }
      },
      
      // ========================================
      // HR FEATURES (Placeholder - to be implemented)
      // ========================================
      // {
      //   path: 'hr',
      //   loadChildren: () => import('./features/hr/hr.module').then(m => m.HrModule),
      //   canActivate: [RoleGuard],
      //   data: { minRole: UserRole.HR }
      // },
      // {
      //   path: 'hr-services',
      //   loadChildren: () => import('./features/hr-services/hr-services.module').then(m => m.HrServicesModule),
      //   canActivate: [RoleGuard],
      //   data: { roles: [UserRole.HR] }
      // },
      
      // ========================================
      // COMMON FEATURES
      // ========================================
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }