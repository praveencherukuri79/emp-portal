import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TimesheetService } from '@core/services/timesheet.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

interface WeekDay {
  name: string;
  date: Date;
  index: number;
  isWeekend: boolean;
}

export interface LogTimeData {
  project: string;
  weekStart: Date;
  weekEnd: Date;
  days: { date: Date; hours: number }[];
  totalHours: number;
  description: string;
}

@Component({
  selector: 'app-log-time-dialog',
  templateUrl: './log-time-dialog.component.html',
  styleUrls: ['./log-time-dialog.component.scss']
})
export class LogTimeDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<LogTimeDialogComponent>);
  private timesheetService = inject(TimesheetService);
  private snackBar = inject(MatSnackBar);

  isSubmitting = false;

  form: FormGroup;
  weekStart!: Date;
  weekEnd!: Date;
  weekDays: WeekDay[] = [];
  
  projects = [
    'Employee Portal',
    'Internal Tools',
    'Client Project A',
    'Client Project B',
    'Training',
    'Administration'
  ];

  // Week starts on Monday by default (can be customized)
  weekStartDay = 1; // 0 = Sunday, 1 = Monday

  constructor() {
    this.form = this.fb.group({
      project: ['Employee Portal', Validators.required], // Pre-select first project
      day0: [0],
      day1: [0],
      day2: [0],
      day3: [0],
      day4: [0],
      day5: [0],
      day6: [0],
      description: ['']
    });

    this.goToCurrentWeek();
    this.setupValueChanges();
  }

  setupValueChanges(): void {
    // Listen to changes in day inputs to recalculate total
    for (let i = 0; i < 7; i++) {
      this.form.get(`day${i}`)?.valueChanges.subscribe(() => {
        // Trigger change detection for total hours
      });
    }
  }

  goToCurrentWeek(): void {
    const today = new Date();
    this.setWeek(today);
  }

  previousWeek(): void {
    const newDate = new Date(this.weekStart);
    newDate.setDate(newDate.getDate() - 7);
    this.setWeek(newDate);
  }

  nextWeek(): void {
    const newDate = new Date(this.weekStart);
    newDate.setDate(newDate.getDate() + 7);
    this.setWeek(newDate);
  }

  setWeek(date: Date): void {
    const current = new Date(date);
    const day = current.getDay();
    const diff = (day < this.weekStartDay ? 7 : 0) + day - this.weekStartDay;
    
    this.weekStart = new Date(current);
    this.weekStart.setDate(current.getDate() - diff);
    this.weekStart.setHours(0, 0, 0, 0);
    
    this.weekEnd = new Date(this.weekStart);
    this.weekEnd.setDate(this.weekStart.getDate() + 6);
    this.weekEnd.setHours(23, 59, 59, 999);
    
    this.generateWeekDays();
  }

  generateWeekDays(): void {
    this.weekDays = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.weekStart);
      date.setDate(this.weekStart.getDate() + i);
      const dayOfWeek = date.getDay();
      
      this.weekDays.push({
        name: dayNames[dayOfWeek],
        date: date,
        index: i,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6
      });
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  get totalHours(): number {
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const value = this.form.get(`day${i}`)?.value || 0;
      total += parseFloat(value) || 0;
    }
    return total;
  }

  onSubmit(): void {
    if (this.form.valid && this.totalHours > 0) {
      this.isSubmitting = true;
      
      const entries: { date: Date; hours: number; billable: boolean }[] = [];
      
      for (let i = 0; i < 7; i++) {
        const hours = this.form.get(`day${i}`)?.value || 0;
        if (hours > 0) {
          entries.push({
            date: this.weekDays[i].date,
            hours: parseFloat(hours),
            billable: true
          });
        }
      }

      const payload = {
        project: this.form.get('project')?.value,
        entries: entries,
        description: this.form.get('description')?.value || ''
      };

      this.timesheetService.createTimesheet(payload).subscribe({
        next: () => {
          this.snackBar.open('Timesheet entries created successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error creating timesheet entries:', error);
          this.snackBar.open('Failed to create timesheet entries. Please try again.', 'Close', {
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
