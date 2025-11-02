import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { messages } from '@shared/messages';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private themeService = inject(ThemeService);

  // Reactive state with signals
  loading = signal(false);
  hidePassword = signal(true);
  showErrors = signal(false);
  
  // Messages from centralized system
  readonly msg = messages.auth.login;
  readonly commonMsg = messages.common;
  readonly validationMsg = messages.validation;
  
  // Theme
  readonly currentTheme = this.themeService.currentTheme;
  readonly isDark = this.themeService.isDark;

  loginForm!: FormGroup;

  // Computed error states
  emailError = computed(() => {
    if (!this.showErrors()) return '';
    const control = this.loginForm.get('email');
    if (!control?.touched) return '';
    
    if (control.hasError('required')) return this.validationMsg.required('Email');
    if (control.hasError('email')) return this.validationMsg.email;
    return '';
  });

  passwordError = computed(() => {
    if (!this.showErrors()) return '';
    const control = this.loginForm.get('password');
    if (!control?.touched) return '';
    
    if (control.hasError('required')) return this.validationMsg.required('Password');
    if (control.hasError('minlength')) return this.validationMsg.minLength('Password', 6);
    return '';
  });

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Clear errors when user starts typing
    this.loginForm.valueChanges.subscribe(() => {
      if (this.showErrors() && this.loginForm.valid) {
        this.showErrors.set(false);
      }
    });
  }

  onSubmit(): void {
    // Mark all fields as touched to show validation
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });

    this.showErrors.set(true);

    if (this.loginForm.valid && !this.loading()) {
      this.loading.set(true);
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.snackBar.open('Login successful!', this.commonMsg.close, {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          // Navigate to role-based start route (employees -> timesheets, supervisors+ -> approvals)
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading.set(false);
          const message = error.error?.message || 'Login failed. Please try again.';
          this.snackBar.open(message, this.commonMsg.close, {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onFieldFocus(fieldName: string): void {
    // Remove error when field is focused
    const control = this.loginForm.get(fieldName);
    if (control?.touched && control?.invalid) {
      this.showErrors.set(false);
    }
  }

  onFieldBlur(fieldName: string): void {
    // Show error when field loses focus if invalid
    const control = this.loginForm.get(fieldName);
    if (control?.invalid) {
      this.showErrors.set(true);
    }
  }
}