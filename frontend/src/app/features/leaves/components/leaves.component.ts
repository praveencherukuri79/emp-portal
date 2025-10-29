import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LeaveService } from '@core/services/leave.service';
import { LeaveRequest, LeaveBalance } from '@shared/types';
import { LeaveRequestDialogComponent } from '@shared/components/leave-request-dialog/leave-request-dialog.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-leaves',
  templateUrl: './leaves.component.html',
  styleUrls: ['./leaves.component.scss']
})
export class LeavesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['leaveType', 'dateRange', 'days', 'reason', 'status', 'submittedAt', 'actions'];
  dataSource: MatTableDataSource<LeaveRequest>;
  leaveBalance: LeaveBalance | null = null;
  loading = false;
  
  // Filters
  statusFilter = '';
  typeFilter = '';
  searchText = '';

  private destroy$ = new Subject<void>();

  constructor(
    private leaveService: LeaveService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<LeaveRequest>([]);
  }

  ngOnInit(): void {
    this.loadLeaveBalance();
    this.loadLeaves();
    this.setupRefreshListener();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom filter predicate
    this.dataSource.filterPredicate = (data: LeaveRequest, filter: string) => {
      const searchStr = filter.toLowerCase();
      return data.reason.toLowerCase().includes(searchStr) ||
             data.type.toLowerCase().includes(searchStr) ||
             data.status.toLowerCase().includes(searchStr);
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupRefreshListener(): void {
    this.leaveService.refresh$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadLeaves();
        this.loadLeaveBalance();
      });
  }

  loadLeaveBalance(): void {
    this.leaveService.getLeaveBalance()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (balance) => {
          this.leaveBalance = balance;
        },
        error: (error) => {
          console.error('Failed to load leave balance:', error);
          this.snackBar.open('Failed to load leave balance', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  loadLeaves(): void {
    this.loading = true;
    
    const params: any = {};
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.typeFilter) params.type = this.typeFilter;
    
    this.leaveService.getLeaves(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (leaves) => {
          this.dataSource.data = Array.isArray(leaves) ? leaves : [];
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load leaves:', error);
          this.dataSource.data = [];
          this.loading = false;
          this.snackBar.open('Failed to load leave requests', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  applyFilters(): void {
    this.loadLeaves();
  }

  applySearch(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchText = filterValue.trim().toLowerCase();
    this.dataSource.filter = this.searchText;
  }

  refreshData(): void {
    this.leaveService.triggerRefresh();
  }

  requestLeave(): void {
    const dialogRef = this.dialog.open(LeaveRequestDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: true,
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.leaveService.createLeaveRequest(result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loading = false;
              this.snackBar.open('Leave request submitted successfully', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
              this.leaveService.triggerRefresh();
            },
            error: (error) => {
              this.loading = false;
              const errorMessage = error?.error?.message || 'Failed to submit leave request';
              this.snackBar.open(errorMessage, 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
      }
    });
  }

  viewLeave(leave: LeaveRequest): void {
    this.dialog.open(LeaveRequestDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { mode: 'view', leave }
    });
  }

  editLeave(leave: LeaveRequest): void {
    const dialogRef = this.dialog.open(LeaveRequestDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: true,
      data: { mode: 'edit', leave }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.leaveService.updateLeaveRequest(leave.id, result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loading = false;
              this.snackBar.open('Leave request updated successfully', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
              this.leaveService.triggerRefresh();
            },
            error: (error) => {
              this.loading = false;
              const errorMessage = error?.error?.message || 'Failed to update leave request';
              this.snackBar.open(errorMessage, 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
      }
    });
  }

  cancelLeave(leave: LeaveRequest): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancel Leave Request',
        message: `Are you sure you want to cancel this ${this.getLeaveTypeLabel(leave.type)} request from ${this.formatDate(leave.startDate)} to ${this.formatDate(leave.endDate)}?`,
        confirmText: 'Yes, Cancel',
        cancelText: 'No, Keep It',
        type: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.loading = true;
        this.leaveService.cancelLeaveRequest(leave.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loading = false;
              this.snackBar.open('Leave request cancelled successfully', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
              this.leaveService.triggerRefresh();
            },
            error: (error) => {
              this.loading = false;
              const errorMessage = error?.error?.message || 'Failed to cancel leave request';
              this.snackBar.open(errorMessage, 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
      }
    });
  }

  canEditLeave(leave: LeaveRequest): boolean {
    return leave.status === 'pending' || leave.status === 'rejected';
  }

  canCancelLeave(leave: LeaveRequest): boolean {
    return leave.status === 'pending' || leave.status === 'approved';
  }

  getLeaveTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      annual: 'Annual Leave',
      sick: 'Sick Leave',
      personal: 'Personal Leave',
      unpaid: 'Unpaid Leave',
      maternity: 'Maternity Leave',
      paternity: 'Paternity Leave'
    };
    return labels[type] || type;
  }

  getLeaveTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      annual: 'calendar_today',
      sick: 'local_hospital',
      personal: 'person',
      unpaid: 'money_off',
      maternity: 'child_care',
      paternity: 'child_care'
    };
    return icons[type] || 'event';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}
