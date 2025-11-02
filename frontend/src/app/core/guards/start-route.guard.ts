import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@shared/models/enums';
import { stringToUserRole } from '@shared/utils/role.utils';

@Injectable({ providedIn: 'root' })
export class StartRouteGuard implements CanActivate {
  private router = inject(Router);
  private authService = inject(AuthService);

  canActivate(): boolean | UrlTree {
    const user = this.authService.getCurrentUser();

    // If somehow unauthenticated here, send to login
    if (!user) {
      return this.router.parseUrl('/auth/login');
    }

    const role = stringToUserRole(user.role);

    // Redirect based on role: employees to timesheets, supervisors+ to approvals
    if (role >= UserRole.SUPERVISOR) {
      return this.router.parseUrl('/approvals');
    }
    return this.router.parseUrl('/timesheets');
  }
}
