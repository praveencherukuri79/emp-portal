import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService, User, CreateUserRequest, UpdateUserRequest } from '../../services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../../shared/models/enums';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  loading = false;
  saving = false;
  error: string | null = null;
  isEditMode = false;
  userId: string | null = null;
  
  currentUser: any = null;
  currentUserRole: UserRole = UserRole.EMPLOYEE;
  
  roles: Array<{ value: string; label: string; level: number }> = [];
  employmentTypes = this.userService.getEmploymentTypes();
  visaStatuses = this.userService.getVisaStatuses();
  
  departments = [
    'Engineering', 'Marketing', 'Sales', 'Human Resources', 
    'Finance', 'Operations', 'Customer Support', 'Legal'
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.currentUserRole = this.currentUser ? this.stringToUserRole(this.currentUser.role) : UserRole.EMPLOYEE;
    
    // Get available roles for current user
    this.roles = this.userService.getAvailableRoles()
      .filter(role => this.userService.canAssignRole(this.currentUser?.role || 'employee', role.value));
    
    this.initializeForm();
    
    // Check if we're in edit mode
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id');
      this.isEditMode = !!this.userId;
      
      if (this.isEditMode && this.userId) {
        this.loadUser(this.userId);
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

  private initializeForm(): void {
    this.userForm = this.fb.group({
      // Basic Information
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      phone: [''],
      dateOfBirth: [''],
      role: ['employee', [Validators.required]],
      isActive: [true],
      
      // Address Information
      address: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        zipCode: [''],
        country: ['']
      }),
      
      // Employee Information
      employeeInfo: this.fb.group({
        employeeId: [''],
        department: [''],
        designation: [''],
        joiningDate: [''],
        employmentType: ['full-time'],
        salary: ['', [Validators.min(0)]]
      }),
      
      // Visa Information
      visaInfo: this.fb.group({
        type: [''],
        number: [''],
        expiryDate: [''],
        status: ['active']
      })
    });

    // Remove password validation in edit mode
    if (this.isEditMode) {
      this.userForm.get('password')?.clearValidators();
    }
  }

  loadUser(userId: string): void {
    this.loading = true;
    this.error = null;
    
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.populateForm(user);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load user details';
        this.loading = false;
        console.error('Error loading user:', error);
      }
    });
  }

  private populateForm(user: User): void {
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      role: user.role,
      isActive: user.isActive,
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || ''
      },
      employeeInfo: {
        employeeId: user.employeeInfo?.employeeId || '',
        department: user.employeeInfo?.department || '',
        designation: user.employeeInfo?.designation || '',
        joiningDate: user.employeeInfo?.joiningDate || '',
        employmentType: user.employeeInfo?.employmentType || 'full-time',
        salary: user.employeeInfo?.salary || ''
      },
      visaInfo: {
        type: user.visaInfo?.type || '',
        number: user.visaInfo?.number || '',
        expiryDate: user.visaInfo?.expiryDate || '',
        status: user.visaInfo?.status || 'active'
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    this.error = null;

    const formValue = this.userForm.value;
    
    if (this.isEditMode && this.userId) {
      this.updateUser(formValue);
    } else {
      this.createUser(formValue);
    }
  }

  private createUser(formValue: any): void {
    const createData: CreateUserRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      password: formValue.password,
      role: formValue.role,
      phone: formValue.phone || undefined,
      employeeInfo: this.hasEmployeeInfo(formValue) ? {
        department: formValue.employeeInfo.department || undefined,
        designation: formValue.employeeInfo.designation || undefined,
        joiningDate: formValue.employeeInfo.joiningDate || undefined,
        employmentType: formValue.employeeInfo.employmentType || undefined
      } : undefined
    };

    this.userService.createUser(createData).subscribe({
      next: (user) => {
        this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/users', user._id]);
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to create user';
        this.saving = false;
        console.error('Error creating user:', error);
      }
    });
  }

  private updateUser(formValue: any): void {
    const updateData: UpdateUserRequest = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phone: formValue.phone || undefined,
      dateOfBirth: formValue.dateOfBirth || undefined,
      role: formValue.role,
      isActive: formValue.isActive,
      address: this.hasAddressInfo(formValue) ? formValue.address : undefined,
      employeeInfo: this.hasEmployeeInfo(formValue) ? {
        employeeId: formValue.employeeInfo.employeeId || undefined,
        department: formValue.employeeInfo.department || undefined,
        designation: formValue.employeeInfo.designation || undefined,
        joiningDate: formValue.employeeInfo.joiningDate || undefined,
        employmentType: formValue.employeeInfo.employmentType || undefined,
        salary: formValue.employeeInfo.salary || undefined
      } : undefined,
      visaInfo: this.hasVisaInfo(formValue) ? formValue.visaInfo : undefined
    };

    this.userService.updateUser(this.userId!, updateData).subscribe({
      next: (user) => {
        this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/users', user._id]);
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to update user';
        this.saving = false;
        console.error('Error updating user:', error);
      }
    });
  }

  private hasAddressInfo(formValue: any): boolean {
    const address = formValue.address;
    return !!(address.street || address.city || address.state || address.zipCode || address.country);
  }

  private hasEmployeeInfo(formValue: any): boolean {
    const empInfo = formValue.employeeInfo;
    return !!(empInfo.employeeId || empInfo.department || empInfo.designation || 
             empInfo.joiningDate || empInfo.salary);
  }

  private hasVisaInfo(formValue: any): boolean {
    const visaInfo = formValue.visaInfo;
    return !!(visaInfo.type || visaInfo.number || visaInfo.expiryDate);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.markNestedFormGroupTouched(control);
        }
      }
    });
  }

  private markNestedFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Utility methods
  getFieldError(fieldName: string, nestedGroup?: string): string {
    const control = nestedGroup 
      ? this.userForm.get(nestedGroup)?.get(fieldName)
      : this.userForm.get(fieldName);
      
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (control.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
    }
    if (control.errors['min']) {
      return `${this.getFieldLabel(fieldName)} must be greater than ${control.errors['min'].min}`;
    }

    return 'Invalid input';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      password: 'Password',
      phone: 'Phone',
      role: 'Role',
      salary: 'Salary'
    };
    return labels[fieldName] || fieldName;
  }

  canEditRole(): boolean {
    return this.currentUserRole >= UserRole.ADMIN;
  }

  canEditSalary(): boolean {
    return this.currentUserRole >= UserRole.ADMIN;
  }

  onCancel(): void {
    if (this.isEditMode && this.userId) {
      this.router.navigate(['/users', this.userId]);
    } else {
      this.router.navigate(['/users']);
    }
  }

  onReset(): void {
    if (this.isEditMode && this.userId) {
      this.loadUser(this.userId);
    } else {
      this.userForm.reset();
      this.initializeForm();
    }
  }
}