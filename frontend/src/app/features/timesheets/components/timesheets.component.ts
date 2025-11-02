import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { TimesheetService } from '@core/services/timesheet.service';
import { DialogService } from '@shared/services/dialog.service';
import { ThemeService } from '@core/services/theme.service';
import { TimesheetEntry, TimesheetSummary, Project } from '@shared/types';
import { DateUtil } from '@shared/utils/date.util';
import { TimesheetEntryDialogComponent, TimesheetEntryDialogData } from './timesheet-entry-dialog/timesheet-entry-dialog.component';
import { ErrorHandlerService } from '@shared/services/error-handler.service';

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
  private errorHandler = inject(ErrorHandlerService);

  // Component state
  currentWeekSummary: TimesheetSummary | null = null;
  weekEntries: TimesheetEntry[] = [];
  loading = true;
  submitting = false;
  submittingWeek = false;
  
  // Current week dates
  currentWeekRange = DateUtil.getCurrentWeekRange();
  weekDays: Array<{ date: Date; dayName: string; dateString: string; entry?: TimesheetEntry }> = [];

  // Weekly entry state (hours-only flow)
  projects: Project[] = [];
  selectedProjectId: string | null = null;
  billable = true;
  description = '';
  weekHours: Record<string, number> = {}; // key: dateString, value: hours
  // Quick-jump past weeks list (last 12 weeks)
  lastWeeks: Array<{ label: string; start: string; end: string }> = [];

  // Theme
  currentTheme = this.themeService.currentTheme;
  isDark = this.themeService.isDark;

  ngOnInit(): void {
    this.initializeWeekDays();
    this.loadWeekData();
    this.loadProjects();
    this.setupRefreshListener();
    this.buildLastWeeks();
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

      // Initialize weekly hours to 0 by default
      const key = DateUtil.formatForInput(date);
      this.weekHours[key] = this.weekHours[key] ?? 0;
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
          const all = Array.isArray(entries) ? entries : [];
          // Filter strictly by current week range using local date strings
          const startStr = DateUtil.formatForInput(start);
          const endStr = DateUtil.formatForInput(end);
          this.weekEntries = all.filter((e: any) => {
            const d = typeof e.date === 'string' ? new Date(e.date) : new Date(e.date);
            const ds = DateUtil.formatForInput(d);
            return ds >= startStr && ds <= endStr;
          });
          
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
          this.seedWeekHoursFromEntries();
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load timesheet data:', error);
          this.weekEntries = [];
          this.currentWeekSummary = null;
          this.loading = false;
          this.errorHandler.show(error ?? 'Failed to load timesheet data.');
        }
      });
  }

  private loadProjects(): void {
    this.timesheetService.getProjects().pipe(takeUntil(this.destroy$)).subscribe({
      next: (projects) => {
        this.projects = projects || [];
        // Auto-select first active project for convenience
        if (!this.selectedProjectId && this.projects.length) {
          this.selectedProjectId = this.projects[0].id;
        }
      },
      error: () => {
        // Non-blocking; weekly entry can still allow saving if backend accepts empty project
        this.projects = [];
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

  private seedWeekHoursFromEntries(): void {
    if (!Array.isArray(this.weekEntries)) return;
    // If there is exactly one entry per day (common case), seed hours from it
    this.weekEntries.forEach(e => {
      const key = typeof e.date === 'string' ? e.date : DateUtil.formatForInput(new Date(e.date));
      const hours = (e.totalHours as number | undefined) ?? (e as any).hours ?? 0;
      if (key) {
        this.weekHours[key] = hours;
      }
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

  // ==========================
  // Weekly hours-only entry
  // ==========================
  weekTotal(): number {
    return Object.values(this.weekHours).reduce((sum, v) => sum + (Number(v) || 0), 0);
  }

  saveWeekHours(): void {
    if (this.submittingWeek) return;

    const entries = this.weekDays
      .map(d => ({ date: d.dateString, hours: Number(this.weekHours[d.dateString]) || 0 }))
      .filter(e => e.hours > 0)
      .map(e => ({ date: e.date, hours: e.hours, billable: this.billable }));

    if (!entries.length) {
      this.snackBar.open('Enter hours for at least one day', 'Close', { duration: 3000 });
      return;
    }

    if (!this.selectedProjectId) {
      this.snackBar.open('Please select a project', 'Close', { duration: 3000 });
      return;
    }

    // Map selected project id to project name for backend compatibility
    const projectName = this.projects.find(p => p.id === this.selectedProjectId)?.name || '';

    this.submittingWeek = true;
    this.timesheetService.createTimesheetBatch({
      project: projectName,
      entries,
      description: this.description || ''
    }).subscribe({
      next: () => {
        this.submittingWeek = false;
        this.snackBar.open('Week hours saved', 'Close', { duration: 2500 });
        this.loadWeekData();
      },
      error: (error) => {
        this.submittingWeek = false;
        this.errorHandler.show(error ?? 'Failed to save hours');
      }
    });
  }

  // Utility methods
  formatDuration(hours: number): string {
    return DateUtil.formatDuration(Number(hours) || 0);
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

  // ==========================
  // Week navigation
  // ==========================
  prevWeek(): void {
    const start = new Date(this.currentWeekRange.start);
    start.setDate(start.getDate() - 7);
    this.setWeek(start);
  }

  nextWeek(): void {
    const start = new Date(this.currentWeekRange.start);
    start.setDate(start.getDate() + 7);
    this.setWeek(start);
  }

  goToCurrentWeek(): void {
    const now = new Date();
    this.setWeek(now);
  }

  private setWeek(anchorDate: Date): void {
    // Compute new week range based on the given date (Mon-Sun)
    const week = {
      start: new Date(anchorDate),
      end: new Date(anchorDate)
    };
    // Align to Monday and Sunday
    const day = week.start.getDay();
    const diffToMonday = (day === 0 ? -6 : 1 - day); // 0=Sun -> -6, 1=Mon -> 0, ...
    week.start.setDate(week.start.getDate() + diffToMonday);
    week.start.setHours(0, 0, 0, 0);
    const end = new Date(week.start);
    end.setDate(week.start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    week.end = end;

    this.currentWeekRange = week;
    this.weekHours = {};
    this.initializeWeekDays();
    this.loadWeekData();
    this.buildLastWeeks();
  }

  private buildLastWeeks(): void {
    // Build last 12 weeks (including current)
    const list: Array<{ label: string; start: string; end: string }> = [];
    const now = new Date();
    // align to Monday
    const day = now.getDay();
    const diffToMonday = (day === 0 ? -6 : 1 - day);
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    for (let i = 0; i < 12; i++) {
      const start = new Date(monday);
      start.setDate(monday.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const label = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      list.push({ label, start: DateUtil.formatForInput(start), end: DateUtil.formatForInput(end) });
    }

    this.lastWeeks = list;
  }

  jumpToWeek(startStr: string): void {
    if (!startStr) return;
    const d = new Date(startStr);
    this.setWeek(d);
  }
}