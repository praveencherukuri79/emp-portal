import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';

// Shared Components
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { LogTimeDialogComponent } from './components/log-time-dialog/log-time-dialog.component';
import { LeaveRequestDialogComponent } from './components/leave-request-dialog/leave-request-dialog.component';
import { DocumentUploadDialogComponent } from './components/document-upload-dialog/document-upload-dialog.component';

const MaterialModules = [
  MatButtonModule,
  MatInputModule,
  MatFormFieldModule,
  MatCardModule,
  MatToolbarModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatDialogModule,
  MatSnackBarModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatChipsModule,
  MatProgressSpinnerModule,
  MatMenuModule,
  MatBadgeModule,
  MatDividerModule,
  MatSlideToggleModule,
  MatTabsModule
];

@NgModule({
  declarations: [
    ConfirmDialogComponent,
    LogTimeDialogComponent,
    LeaveRequestDialogComponent,
    DocumentUploadDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ...MaterialModules
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ...MaterialModules,
    ConfirmDialogComponent,
    LogTimeDialogComponent,
    LeaveRequestDialogComponent,
    DocumentUploadDialogComponent
  ]
})
export class SharedModule { }