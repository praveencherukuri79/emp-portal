import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface ApprovalDialogData {
  type: 'timesheet' | 'leave';
  action: 'approve' | 'reject';
  item: any;
  userName: string;
  requireReason?: boolean;
}

@Component({
  selector: 'app-approval-dialog',
  templateUrl: './approval-dialog.component.html',
  styleUrls: ['./approval-dialog.component.scss']
})
export class ApprovalDialogComponent {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ApprovalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ApprovalDialogData,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      reason: ['', data.requireReason ? Validators.required : []]
    });
  }

  getTitle(): string {
    const action = this.data.action === 'approve' ? 'Approve' : 'Reject';
    const type = this.data.type === 'timesheet' ? 'Timesheet' : 'Leave Request';
    return `${action} ${type}`;
  }

  getMessage(): string {
    if (this.data.action === 'approve') {
      return `Are you sure you want to approve this ${this.data.type} for ${this.data.userName}?`;
    } else {
      return `Are you sure you want to reject this ${this.data.type} for ${this.data.userName}?`;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.data.requireReason && !this.form.valid) {
      return;
    }

    const result = this.data.requireReason 
      ? { reason: this.form.value.reason }
      : true;

    this.dialogRef.close(result);
  }
}
