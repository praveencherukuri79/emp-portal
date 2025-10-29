import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { TimesheetsRoutingModule } from './timesheets-routing.module';
import { TimesheetsComponent } from './components/timesheets.component';
import { TimesheetEntryDialogComponent } from './components/timesheet-entry-dialog/timesheet-entry-dialog.component';

@NgModule({
  declarations: [
    TimesheetsComponent,
    TimesheetEntryDialogComponent
  ],
  imports: [
    SharedModule,
    TimesheetsRoutingModule
  ]
})
export class TimesheetsModule { }