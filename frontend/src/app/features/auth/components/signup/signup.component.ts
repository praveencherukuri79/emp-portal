import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { messages } from '@shared/messages';
import { environment } from '@env/environment';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  // Messages
  readonly msg = messages.auth;
  readonly validation = messages.validation;
  
  // Theme
  readonly currentTheme = this.themeService.currentTheme;
  readonly isDark = this.themeService.isDark;
  
  // Form state
  readonly loading = signal(false);
  readonly hidePassword = signal(true);
  readonly hideConfirmPassword = signal(true);

  // Form
  signupForm!: FormGroup;

  constructor() {
    this.signupForm = this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-Z\s]+$/)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.pattern(/^[a-zA-Z\s]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Check if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Validation methods
  getFirstNameError(): string | null {
    const control = this.signupForm.get('firstName');
    if (control?.invalid && control?.touched) {
      if (control.errors?.['required']) return this.validation.required('First Name');
      if (control.errors?.['minlength']) return this.validation.minLength('First Name', 2);
      if (control.errors?.['pattern']) return 'First Name should only contain letters';
    }
    return null;
  }

  getLastNameError(): string | null {
    const control = this.signupForm.get('lastName');
    if (control?.invalid && control?.touched) {
      if (control.errors?.['required']) return this.validation.required('Last Name');
      if (control.errors?.['minlength']) return this.validation.minLength('Last Name', 2);
      if (control.errors?.['pattern']) return 'Last Name should only contain letters';
    }
    return null;
  }

  getEmailError(): string | null {
    const control = this.signupForm.get('email');
    if (control?.invalid && control?.touched) {
      if (control.errors?.['required']) return this.validation.required('Email');
      if (control.errors?.['email']) return this.validation.email;
    }
    return null;
  }

  getPasswordError(): string | null {
    const control = this.signupForm.get('password');
    if (control?.invalid && control?.touched) {
      if (control.errors?.['required']) return this.validation.required('Password');
      if (control.errors?.['minlength']) return this.validation.minLength('Password', 8);
      if (control.errors?.['pattern']) return 'Password must contain uppercase, lowercase, number and special character';
    }
    return null;
  }

  getConfirmPasswordError(): string | null {
    const control = this.signupForm.get('confirmPassword');
    if (control?.invalid && control?.touched) {
      if (control.errors?.['required']) return this.validation.required('Confirm Password');
      if (control.errors?.['mismatch']) return 'Passwords do not match';
    }
    return null;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      const confirmPasswordControl = form.get('confirmPassword');
      if (confirmPasswordControl?.errors?.['mismatch']) {
        delete confirmPasswordControl.errors['mismatch'];
        if (Object.keys(confirmPasswordControl.errors).length === 0) {
          confirmPasswordControl.setErrors(null);
        }
      }
    }
    return null;
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update(value => !value);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onFieldFocus(fieldName: string): void {
    // Add focus styling or logic if needed
  }

  onFieldBlur(fieldName: string): void {
    // Add blur logic if needed
  }

  onSubmit(): void {
    if (this.signupForm.valid && !this.loading()) {
      this.loading.set(true);
      
      const formValue = this.signupForm.value;
      const signupData = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        password: formValue.password
      };

      this.authService.register(signupData).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.snackBar.open(
            'Account created successfully! Please login with your credentials.',
            'Close',
            { duration: 5000 }
          );
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.loading.set(false);
          const errorMessage = error.error?.message || 'Registration failed. Please try again.';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}