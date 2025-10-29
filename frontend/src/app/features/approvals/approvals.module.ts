import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';

import { RoleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../shared/models/enums';

import { ApprovalsComponent } from './components/approvals/approvals.component';
import { TimesheetApprovalsComponent } from './components/timesheet-approvals/timesheet-approvals.component';
import { LeaveApprovalsComponent } from './components/leave-approvals/leave-approvals.component';
import { ApprovalDialogComponent } from './components/approval-dialog/approval-dialog.component';

const routes: Routes = [
  {
    path: '',
    component: ApprovalsComponent,
    canActivate: [RoleGuard],
    data: { minRole: UserRole.SUPERVISOR }
  }
];

@NgModule({
  declarations: [
    ApprovalsComponent,
    TimesheetApprovalsComponent,
    LeaveApprovalsComponent,
    ApprovalDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatBadgeModule
  ]
})
export class ApprovalsModule { }
