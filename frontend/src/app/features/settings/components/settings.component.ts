import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService, User } from '@features/user/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';

interface NotificationPreferences {
  email: {
    leaveApprovals: boolean;
    timesheetReminders: boolean;
    documentUploads: boolean;
    systemAnnouncements: boolean;
  };
  push: {
    leaveApprovals: boolean;
    timesheetReminders: boolean;
    documentUploads: boolean;
    systemAnnouncements: boolean;
  };
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  selectedTabIndex = 0;
  loading = false;
  saving = false;

  // Current user data
  currentUser: User | null = null;

  // Forms
  profileForm!: FormGroup;
  preferencesForm!: FormGroup;
  securityForm!: FormGroup;
  notificationsForm!: FormGroup;

  // Dropdown options
  languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' }
  ];

  timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (US)' },
    { value: 'America/Chicago', label: 'Central Time (US)' },
    { value: 'America/Denver', label: 'Mountain Time (US)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Shanghai', label: 'Shanghai' },
    { value: 'Australia/Sydney', label: 'Sydney' }
  ];

  dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' }
  ];

  themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto (System)' }
  ];

  // Password visibility toggles
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private themeService: ThemeService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    // Profile Form
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: [{ value: '', disabled: true }],
      phone: [''],
      department: [''],
      designation: ['']
    });

    // Preferences Form
    this.preferencesForm = this.fb.group({
      language: ['en'],
      timezone: ['UTC'],
      dateFormat: ['MM/DD/YYYY'],
      theme: ['auto']
    });

    // Security Form
    this.securityForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    // Notifications Form
    this.notificationsForm = this.fb.group({
      email: this.fb.group({
        leaveApprovals: [true],
        timesheetReminders: [true],
        documentUploads: [false],
        systemAnnouncements: [true]
      }),
      push: this.fb.group({
        leaveApprovals: [true],
        timesheetReminders: [false],
        documentUploads: [false],
        systemAnnouncements: [false]
      })
    });
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  private loadCurrentUser(): void {
    this.loading = true;
    this.userService.getCurrentUserProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          this.populateForms(user);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.snackBar.open('Failed to load user profile', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  private populateForms(user: User): void {
    // Profile form
    this.profileForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      department: user.employeeInfo?.department || '',
      designation: user.employeeInfo?.designation || ''
    });

    // Preferences form - would come from user preferences in real app
    this.preferencesForm.patchValue({
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      theme: 'auto'
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.saving = true;
    const formValue = this.profileForm.getRawValue();
    
    const updateData = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phone: formValue.phone,
      employeeInfo: {
        department: formValue.department,
        designation: formValue.designation
      }
    };

    this.userService.updateUser(this.currentUser!._id, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          this.snackBar.open('Profile updated successfully', 'Close', { 
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          this.saving = false;
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.snackBar.open(
            error.error?.message || 'Failed to update profile', 
            'Close', 
            { duration: 3000, panelClass: ['snackbar-error'] }
          );
          this.saving = false;
        }
      });
  }

  updatePreferences(): void {
    if (this.preferencesForm.invalid) {
      return;
    }

    this.saving = true;
    const preferences = this.preferencesForm.value;

    // Apply theme immediately
    if (preferences.theme !== 'auto') {
      this.themeService.setTheme(preferences.theme);
    } else {
      this.themeService.setTheme('auto');
    }

    // In a real app, save to backend
    setTimeout(() => {
      this.snackBar.open('Preferences updated successfully', 'Close', { 
        duration: 3000,
        panelClass: ['snackbar-success']
      });
      this.saving = false;
    }, 500);
  }

  changePassword(): void {
    if (this.securityForm.invalid) {
      this.markFormGroupTouched(this.securityForm);
      return;
    }

    this.saving = true;
    const { currentPassword, newPassword } = this.securityForm.value;

    // In a real app, call UserService.changePassword()
    // For now, simulate API call
    setTimeout(() => {
      this.snackBar.open('Password changed successfully', 'Close', { 
        duration: 3000,
        panelClass: ['snackbar-success']
      });
      this.securityForm.reset();
      this.saving = false;
    }, 1000);
  }

  updateNotifications(): void {
    if (this.notificationsForm.invalid) {
      return;
    }

    this.saving = true;
    const notifications = this.notificationsForm.value;

    // In a real app, save to backend
    setTimeout(() => {
      this.snackBar.open('Notification preferences updated successfully', 'Close', { 
        duration: 3000,
        panelClass: ['snackbar-success']
      });
      this.saving = false;
    }, 500);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getPasswordStrength(): string {
    const password = this.securityForm.get('newPassword')?.value || '';
    if (password.length === 0) return '';
    if (password.length < 8) return 'weak';
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)) return 'strong';
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) return 'medium';
    return 'weak';
  }

  getPasswordStrengthColor(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'strong': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'weak': return '#f44336';
      default: return '#e0e0e0';
    }
  }
}