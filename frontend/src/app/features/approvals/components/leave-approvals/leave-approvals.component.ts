import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { LeaveService } from '@core/services/leave.service';
import { ApprovalDialogComponent } from '../approval-dialog/approval-dialog.component';

interface LeaveApproval {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  leaveType: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: string;
  submittedAt: Date;
}

@Component({
  selector: 'app-leave-approvals',
  templateUrl: './leave-approvals.component.html',
  styleUrls: ['./leave-approvals.component.scss']
})
export class LeaveApprovalsComponent implements OnInit {
  @Output() countChange = new EventEmitter<number>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['user', 'leaveType', 'startDate', 'endDate', 'totalDays', 'reason', 'submittedAt', 'actions'];
  dataSource: MatTableDataSource<LeaveApproval>;
  loading = false;
  error: string | null = null;

  constructor(
    private leaveService: LeaveService,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<LeaveApproval>([]);
  }

  ngOnInit(): void {
    this.loadPendingLeaves();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadPendingLeaves(): void {
    this.loading = true;
    this.error = null;

    this.leaveService.getPendingLeaves().subscribe({
      next: (leaves) => {
        this.dataSource.data = leaves as any;
        this.countChange.emit(leaves.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading pending leaves:', err);
        this.error = 'Failed to load pending leaves. Please try again.';
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

  getUserName(leave: LeaveApproval): string {
    return `${leave.user.firstName} ${leave.user.lastName}`;
  }

  getLeaveTypeLabel(type: string): string {
    const types: Record<string, string> = {
      sick: 'Sick Leave',
      vacation: 'Vacation',
      personal: 'Personal',
      unpaid: 'Unpaid',
      other: 'Other'
    };
    return types[type] || type;
  }

  getLeaveTypeColor(type: string): string {
    const colors: Record<string, string> = {
      sick: 'warn',
      vacation: 'primary',
      personal: 'accent',
      unpaid: '',
      other: ''
    };
    return colors[type] || '';
  }

  approveLeave(leave: LeaveApproval): void {
    const dialogRef = this.dialog.open(ApprovalDialogComponent, {
      width: '400px',
      data: {
        type: 'leave',
        action: 'approve',
        item: leave,
        userName: this.getUserName(leave)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.leaveService.approveLeave(leave._id).subscribe({
          next: () => {
            this.loadPendingLeaves();
          },
          error: (err) => {
            console.error('Error approving leave:', err);
            this.error = 'Failed to approve leave. Please try again.';
            this.loading = false;
          }
        });
      }
    });
  }

  rejectLeave(leave: LeaveApproval): void {
    const dialogRef = this.dialog.open(ApprovalDialogComponent, {
      width: '400px',
      data: {
        type: 'leave',
        action: 'reject',
        item: leave,
        userName: this.getUserName(leave),
        requireReason: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.reason) {
        this.loading = true;
        this.leaveService.rejectLeave(leave._id, result.reason).subscribe({
          next: () => {
            this.loadPendingLeaves();
          },
          error: (err) => {
            console.error('Error rejecting leave:', err);
            this.error = 'Failed to reject leave. Please try again.';
            this.loading = false;
          }
        });
      }
    });
  }
}
