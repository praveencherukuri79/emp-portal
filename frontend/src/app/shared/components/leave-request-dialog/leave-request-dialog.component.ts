import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { LeaveService } from '@core/services/leave.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LeaveType } from '@shared/models/enums';

export interface LeaveRequestData {
  type: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  days: number;
}

@Component({
  selector: 'app-leave-request-dialog',
  templateUrl: './leave-request-dialog.component.html',
  styleUrls: ['./leave-request-dialog.component.scss']
})
export class LeaveRequestDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<LeaveRequestDialogComponent>);
  private leaveService = inject(LeaveService);
  private snackBar = inject(MatSnackBar);

  isSubmitting = false;

  form: FormGroup;
  minDate = new Date();
  
  // Use semantic CSS variables instead of hardcoded hex colors
  // Tokens referenced from styles.scss (:root)
  leaveTypes = [
    { value: LeaveType.ANNUAL, label: 'Vacation', icon: 'beach_access', color: 'var(--primary-500)' },
    { value: LeaveType.SICK, label: 'Sick', icon: 'healing', color: 'var(--success-600)' },
    { value: LeaveType.PERSONAL, label: 'Personal', icon: 'person', color: 'var(--primary-400)' },
    { value: LeaveType.UNPAID, label: 'Unpaid', icon: 'money_off', color: 'var(--warning-600)' },
    { value: LeaveType.MATERNITY, label: 'Maternity', icon: 'child_care', color: 'var(--primary-600)' },
    { value: LeaveType.PATERNITY, label: 'Paternity', icon: 'face', color: 'var(--text-tertiary)' }
  ];

  constructor() {
    this.form = this.fb.group({
      type: [LeaveType.ANNUAL, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      reason: ['', Validators.required] // Make reason required to match backend
    });

    // Calculate days when dates change
    this.form.get('startDate')?.valueChanges.subscribe(() => {
      // Ensure end date is not before start date
      const start = this.form.get('startDate')?.value;
      const end = this.form.get('endDate')?.value;
      if (start && end && end < start) {
        this.form.patchValue({ endDate: start });
      }
    });
  }

  selectLeaveType(type: string): void {
    this.form.patchValue({ type });
  }

  get calculatedDays(): number {
    const start = this.form.get('startDate')?.value;
    const end = this.form.get('endDate')?.value;
    
    if (start && end) {
      const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    
    return 0;
  }

  onSubmit(): void {
    if (this.form.valid && this.calculatedDays > 0) {
      this.isSubmitting = true;
      
      const formData = {
        userId: '', // Will be set by backend from authenticated user
        type: this.form.value.type,
        startDate: this.form.value.startDate,
        endDate: this.form.value.endDate,
        reason: this.form.value.reason,
        days: this.calculatedDays
      };

      this.leaveService.createLeaveRequest(formData).subscribe({
        next: (response) => {
          this.snackBar.open('Leave request submitted successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error submitting leave request:', error);
          this.snackBar.open('Failed to submit leave request. Please try again.', 'Close', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
