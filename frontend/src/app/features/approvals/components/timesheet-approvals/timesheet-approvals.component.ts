import { Component, OnInit, ViewChild, Output, EventEmitter, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { TimesheetService } from '@core/services/timesheet.service';
import { ErrorHandlerService } from '@shared/services/error-handler.service';
import { ApprovalDialogComponent } from '../approval-dialog/approval-dialog.component';

interface TimesheetApproval {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  date: Date;
  hours: number;
  project: string;
  description: string;
  status: string;
  submittedAt: Date;
}

@Component({
  selector: 'app-timesheet-approvals',
  templateUrl: './timesheet-approvals.component.html',
  styleUrls: ['./timesheet-approvals.component.scss']
})
export class TimesheetApprovalsComponent implements OnInit {
  @Output() countChange = new EventEmitter<number>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['user', 'date', 'hours', 'project', 'description', 'submittedAt', 'actions'];
  dataSource: MatTableDataSource<TimesheetApproval>;
  loading = false;
  error: string | null = null;
  private errorHandler = inject(ErrorHandlerService);

  constructor(
    private timesheetService: TimesheetService,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<TimesheetApproval>([]);
  }

  ngOnInit(): void {
    this.loadPendingTimesheets();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadPendingTimesheets(): void {
    this.loading = true;
    this.error = null;

    this.timesheetService.getPendingTimesheets().subscribe({
      next: (timesheets: any[]) => {
        // Normalize backend data to UI model
        const mapped: TimesheetApproval[] = (timesheets || []).map((ts: any) => {
          const user = ts.user || ts.userId || {};
          return {
            _id: ts._id,
            user: {
              _id: user._id,
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.email || ''
            },
            date: new Date(ts.date),
            hours: ts.hours ?? ts.totalHours ?? 0,
            project: ts.project ?? ts.projectName ?? '—',
            description: ts.description ?? ts.taskDescription ?? ts.notes ?? '—',
            status: ts.status || 'submitted',
            submittedAt: ts.submittedAt ? new Date(ts.submittedAt) : (ts.updatedAt ? new Date(ts.updatedAt) : new Date(ts.date))
          };
        });
        this.dataSource.data = mapped;
        this.countChange.emit(mapped.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading pending timesheets:', err);
        this.error = this.errorHandler.getMessage(err, 'Failed to load pending timesheets. Please try again.');
        this.errorHandler.show(err);
        this.loading = false;
        this.countChange.emit(0);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getUserName(timesheet: TimesheetApproval): string {
    return `${timesheet.user.firstName} ${timesheet.user.lastName}`;
  }

  approveTimesheet(timesheet: TimesheetApproval): void {
    const dialogRef = this.dialog.open(ApprovalDialogComponent, {
      width: '400px',
      data: {
        type: 'timesheet',
        action: 'approve',
        item: timesheet,
        userName: this.getUserName(timesheet)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.timesheetService.approveTimesheet(timesheet._id).subscribe({
          next: () => {
            this.loadPendingTimesheets();
          },
          error: (err) => {
            console.error('Error approving timesheet:', err);
            this.error = 'Failed to approve timesheet. Please try again.';
            this.loading = false;
          }
        });
      }
    });
  }

  rejectTimesheet(timesheet: TimesheetApproval): void {
    const dialogRef = this.dialog.open(ApprovalDialogComponent, {
      width: '400px',
      data: {
        type: 'timesheet',
        action: 'reject',
        item: timesheet,
        userName: this.getUserName(timesheet),
        requireReason: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.reason) {
        this.loading = true;
        this.timesheetService.rejectTimesheet(timesheet._id, result.reason).subscribe({
          next: () => {
            this.loadPendingTimesheets();
          },
          error: (err) => {
            console.error('Error rejecting timesheet:', err);
            this.error = 'Failed to reject timesheet. Please try again.';
            this.loading = false;
          }
        });
      }
    });
  }
}
