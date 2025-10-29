import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@shared/models/enums';
import { stringToUserRole } from '@shared/utils/role.utils';

// Role hierarchy: higher number = more permissions
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.PROSPECT]: 0,
  [UserRole.EMPLOYEE]: 1,
  [UserRole.HR]: 2,
  [UserRole.SUPERVISOR]: 3,
  [UserRole.ADMIN]: 4,
  [UserRole.EMPLOYER]: 5
};

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRoles = route.data['roles'] as UserRole[];
    const minRole = route.data['minRole'] as UserRole;

    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        const userRole = stringToUserRole(user.role);

        // Check exact role match
        if (requiredRoles && requiredRoles.length > 0) {
          if (requiredRoles.includes(userRole)) {
            return true;
          }
        }

        // Check hierarchical role (minimum role level)
        if (minRole) {
          const userLevel = ROLE_HIERARCHY[userRole] || 0;
          const minLevel = ROLE_HIERARCHY[minRole] || 0;
          
          if (userLevel >= minLevel) {
            return true;
          }
        }

        // If no role requirements specified, allow if authenticated
        if (!requiredRoles && !minRole) {
          return true;
        }

        // Access denied
        this.router.navigate(['/dashboard']);
        return false;
      })
    );
  }
}
