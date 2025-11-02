import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TimesheetEntry, Project } from '@shared/types';
import { TimesheetService } from '@core/services/timesheet.service';
import { ValidationUtil } from '@shared/utils/validation.util';
import { DateUtil } from '@shared/utils/date.util';

export interface TimesheetEntryDialogData {
  entry?: TimesheetEntry;
  date?: string;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-timesheet-entry-dialog',
  templateUrl: './timesheet-entry-dialog.component.html',
  styleUrls: ['./timesheet-entry-dialog.component.scss']
})
export class TimesheetEntryDialogComponent implements OnInit {
  entryForm!: FormGroup;
  projects: Project[] = [];
  loading = false;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    private timesheetService: TimesheetService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<TimesheetEntryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TimesheetEntryDialogData
  ) {
    this.isEditMode = data.mode === 'edit';
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadProjects();
  }

  private initializeForm(): void {
    const entry = this.data.entry;
    
    this.entryForm = this.fb.group({
      date: [
        entry?.date || this.data.date || DateUtil.formatForInput(new Date()),
        [Validators.required]
      ],
      projectId: [
        entry?.projectId || '',
        [Validators.required]
      ],
      startTime: [
        entry?.startTime || '09:00',
        [Validators.required]
      ],
      endTime: [
        entry?.endTime || '17:00',
        [Validators.required, ValidationUtil.timeRange('startTime')]
      ],
      breakDuration: [
        entry?.breakDuration || 60,
        [Validators.min(0), Validators.max(480)] // Max 8 hours break
      ],
      description: [
        entry?.description || '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(500)]
      ]
    });

    // Add real-time validation for end time
    this.entryForm.get('startTime')?.valueChanges.subscribe(() => {
      this.entryForm.get('endTime')?.updateValueAndValidity();
    });
  }

  private loadProjects(): void {
    this.timesheetService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects.filter(p => p.isActive);
      },
      error: (error) => {
        console.error('Failed to load projects:', error);
        this.snackBar.open('Failed to load projects', 'Close', { duration: 3000 });
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.entryForm.get(fieldName);
    if (field?.errors && field.touched) {
      return ValidationUtil.getErrorMessage(field.errors, fieldName);
    }
    return '';
  }

  getTotalHours(): number {
    const startTime = this.entryForm.get('startTime')?.value;
    const endTime = this.entryForm.get('endTime')?.value;
    const breakMinutes = this.entryForm.get('breakDuration')?.value || 0;
    
    if (startTime && endTime) {
      const totalHours = DateUtil.calculateHours(startTime, endTime);
      const breakHours = breakMinutes / 60;
      return Math.max(0, totalHours - breakHours);
    }
    
    return 0;
  }

  getFormattedDuration(): string {
    return DateUtil.formatDuration(this.getTotalHours());
  }

  onSave(): void {
    if (this.entryForm.valid && !this.loading) {
      this.loading = true;
      
      const formValue = this.entryForm.value;
      const projectName = this.projects.find(p => p.id === formValue.projectId)?.name || undefined;
      const entryData = {
        date: formValue.date,
        projectName,
        taskDescription: formValue.description,
        hours: this.getTotalHours(),
        billable: true,
        status: 'draft' as const
      };

      const operation = this.isEditMode
        ? this.timesheetService.updateEntry(this.data.entry!.id, entryData)
        : this.timesheetService.createTimesheet(entryData);

      operation.subscribe({
        next: (entry) => {
          this.loading = false;
          const action = this.isEditMode ? 'updated' : 'created';
          this.snackBar.open(`Timesheet entry ${action} successfully`, 'Close', { duration: 3000 });
          this.dialogRef.close(entry);
        },
        error: (error) => {
          this.loading = false;
          console.error('Failed to save timesheet entry:', error);
          this.snackBar.open('Failed to save timesheet entry', 'Close', { duration: 3000 });
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.entryForm.controls).forEach(key => {
        this.entryForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getToday(): string {
    return DateUtil.formatForInput(new Date());
  }

  onDelete(): void {
    if (this.isEditMode && this.data.entry) {
      this.loading = true;
      
      this.timesheetService.deleteEntry(this.data.entry.id).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('Timesheet entry deleted successfully', 'Close', { duration: 3000 });
          this.dialogRef.close('deleted');
        },
        error: (error) => {
          this.loading = false;
          console.error('Failed to delete timesheet entry:', error);
          this.snackBar.open('Failed to delete timesheet entry', 'Close', { duration: 3000 });
        }
      });
    }
  }
}