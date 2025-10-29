import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { TimesheetService } from '@core/services/timesheet.service';
import { DialogService } from '@shared/services/dialog.service';
import { ThemeService } from '@core/services/theme.service';
import { TimesheetEntry, TimesheetSummary } from '@shared/types';
import { DateUtil } from '@shared/utils/date.util';
import { TimesheetEntryDialogComponent, TimesheetEntryDialogData } from './timesheet-entry-dialog/timesheet-entry-dialog.component';

@Component({
  selector: 'app-timesheets',
  templateUrl: './timesheets.component.html',
  styleUrls: ['./timesheets.component.scss']
})
export class TimesheetsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Services
  private dialog = inject(MatDialog);
  private timesheetService = inject(TimesheetService);
  private dialogService = inject(DialogService);
  private snackBar = inject(MatSnackBar);
  private themeService = inject(ThemeService);

  // Component state
  currentWeekSummary: TimesheetSummary | null = null;
  weekEntries: TimesheetEntry[] = [];
  loading = true;
  submitting = false;
  
  // Current week dates
  currentWeekRange = DateUtil.getCurrentWeekRange();
  weekDays: Array<{ date: Date; dayName: string; dateString: string; entry?: TimesheetEntry }> = [];

  // Theme
  currentTheme = this.themeService.currentTheme;
  isDark = this.themeService.isDark;

  ngOnInit(): void {
    this.initializeWeekDays();
    this.loadWeekData();
    this.setupRefreshListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeWeekDays(): void {
    this.weekDays = [];
    const { start } = this.currentWeekRange;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      
      this.weekDays.push({
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dateString: DateUtil.formatForInput(date)
      });
    }
  }

  private loadWeekData(): void {
    this.loading = true;
    const { start, end } = this.currentWeekRange;
    
    // Fetch actual timesheet entries for the week
    this.timesheetService.getTimesheets({ 
      startDate: DateUtil.formatForInput(start), 
      endDate: DateUtil.formatForInput(end) 
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          // Handle both direct array and ApiResponse wrapper
          const entries = Array.isArray(response) ? response : (response?.data || []);
          this.weekEntries = Array.isArray(entries) ? entries : [];
          
          // Calculate summary from actual entries
          const totalHours = this.timesheetService.calculateTotalHours(this.weekEntries);
          const approvedEntries = this.weekEntries.filter(e => e.status === 'approved');
          const approvedHours = this.timesheetService.calculateTotalHours(approvedEntries);
          
          this.currentWeekSummary = {
            weekStartDate: DateUtil.formatForInput(start),
            weekEndDate: DateUtil.formatForInput(end),
            totalHours: totalHours,
            regularHours: approvedHours,
            overtimeHours: Math.max(0, approvedHours - 40), // Assuming 40hr week
            entries: this.weekEntries,
            status: this.calculateOverallStatus(this.weekEntries)
          };
          
          this.mapEntriesToDays();
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load timesheet data:', error);
          this.weekEntries = [];
          this.currentWeekSummary = null;
          this.loading = false;
          
          const errorMessage = error?.error?.message || error?.message || 'Failed to load timesheet data. Please try again.';
          this.snackBar.open(errorMessage, 'Close', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  private calculateOverallStatus(entries: TimesheetEntry[]): 'draft' | 'submitted' | 'approved' | 'rejected' {
    if (entries.length === 0) return 'draft';
    if (entries.every(e => e.status === 'approved')) return 'approved';
    if (entries.some(e => e.status === 'rejected')) return 'rejected';
    if (entries.some(e => e.status === 'submitted')) return 'submitted';
    return 'draft';
  }

  private mapEntriesToDays(): void {
    // Safely map entries to days with null checks
    if (!Array.isArray(this.weekDays)) {
      this.weekDays = [];
      this.initializeWeekDays();
    }
    
    if (!Array.isArray(this.weekEntries)) {
      this.weekEntries = [];
    }
    
    this.weekDays.forEach(day => {
      day.entry = this.weekEntries.find(entry => {
        // Compare dates properly, handling different date formats
        const entryDate = typeof entry.date === 'string' 
          ? entry.date 
          : DateUtil.formatForInput(new Date(entry.date));
        return entryDate === day.dateString;
      });
    });
  }

  private setupRefreshListener(): void {
    this.timesheetService.refresh$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadWeekData();
      });
  }

  // Actions
  addTimeEntry(date?: string): void {
    const dialogData: TimesheetEntryDialogData = {
      mode: 'create',
      date: date || DateUtil.formatForInput(new Date())
    };

    const dialogRef = this.dialog.open(TimesheetEntryDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result !== 'deleted') {
        this.loadWeekData();
      }
    });
  }

  editTimeEntry(entry: TimesheetEntry): void {
    const dialogData: TimesheetEntryDialogData = {
      mode: 'edit',
      entry: entry
    };

    const dialogRef = this.dialog.open(TimesheetEntryDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadWeekData();
      }
    });
  }

  deleteTimeEntry(entry: TimesheetEntry): void {
    if (!entry || !entry.id) {
      this.snackBar.open('Invalid time entry', 'Close', { duration: 3000 });
      return;
    }

    this.dialogService.confirmDelete(`time entry for ${DateUtil.formatDisplay(entry.date)}`).subscribe(confirmed => {
      if (confirmed) {
        this.timesheetService.deleteEntry(entry.id).subscribe({
          next: () => {
            this.snackBar.open('Time entry deleted successfully', 'Close', { duration: 3000 });
            this.loadWeekData();
          },
          error: (error) => {
            console.error('Failed to delete time entry:', error);
            const errorMessage = error?.error?.message || 'Failed to delete time entry. Please try again.';
            this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
          }
        });
      }
    });
  }

  submitTimesheet(): void {
    if (!this.currentWeekSummary) {
      this.snackBar.open('No timesheet data available', 'Close', { duration: 3000 });
      return;
    }

    if (!this.canSubmitTimesheet()) {
      this.snackBar.open('Cannot submit timesheet. Please ensure you have entries and the timesheet is in draft status.', 'Close', { duration: 5000 });
      return;
    }

    this.dialogService.confirm({
      title: 'Submit Timesheet',
      message: `Are you sure you want to submit your timesheet for the week of ${DateUtil.formatDisplay(this.currentWeekSummary.weekStartDate)}? You won't be able to make changes after submission.`,
      confirmText: 'Submit',
      cancelText: 'Cancel',
      type: 'warning'
    }).subscribe(confirmed => {
      if (confirmed && this.currentWeekSummary) {
        this.submitting = true;
        
        this.timesheetService.submitTimesheet(
          this.currentWeekSummary.weekStartDate,
          this.currentWeekSummary.weekEndDate
        ).subscribe({
          next: () => {
            this.submitting = false;
            this.snackBar.open('Timesheet submitted successfully', 'Close', { duration: 3000 });
            this.loadWeekData();
          },
          error: (error) => {
            this.submitting = false;
            console.error('Failed to submit timesheet:', error);
            const errorMessage = error?.error?.message || 'Failed to submit timesheet. Please try again.';
            this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
          }
        });
      }
    });
  }

  refreshData(): void {
    this.timesheetService.triggerRefresh();
    this.loadWeekData();
  }

  // Utility methods
  formatDuration(hours: number): string {
    return DateUtil.formatDuration(hours);
  }

  getEntryStatus(entry: TimesheetEntry): { text: string; class: string } {
    switch (entry.status) {
      case 'draft':
        return { text: 'Draft', class: 'status-draft' };
      case 'submitted':
        return { text: 'Submitted', class: 'status-submitted' };
      case 'approved':
        return { text: 'Approved', class: 'status-approved' };
      case 'rejected':
        return { text: 'Rejected', class: 'status-rejected' };
      default:
        return { text: 'Unknown', class: 'status-unknown' };
    }
  }

  canEditEntry(entry: TimesheetEntry): boolean {
    if (!entry || !entry.status) return false;
    return entry.status === 'draft' || entry.status === 'rejected';
  }

  canSubmitTimesheet(): boolean {
    if (!this.currentWeekSummary) return false;
    if (!Array.isArray(this.weekEntries) || this.weekEntries.length === 0) return false;
    return this.currentWeekSummary.status === 'draft';
  }

  isToday(dateString: string): boolean {
    if (!dateString) return false;
    const today = DateUtil.formatForInput(new Date());
    return dateString === today;
  }

  isPastDate(dateString: string): boolean {
    if (!dateString) return false;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const date = new Date(dateString);
      date.setHours(0, 0, 0, 0);
      return date < today;
    } catch (e) {
      console.error('Invalid date:', dateString, e);
      return false;
    }
  }
}