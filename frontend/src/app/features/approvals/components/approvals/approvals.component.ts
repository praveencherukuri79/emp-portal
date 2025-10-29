import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.scss']
})
export class ApprovalsComponent implements OnInit {
  pendingTimesheetsCount = 0;
  pendingLeavesCount = 0;

  constructor() { }

  ngOnInit(): void {
    // Counts will be updated by child components
  }

  onTimesheetsCountChange(count: number): void {
    this.pendingTimesheetsCount = count;
  }

  onLeavesCountChange(count: number): void {
    this.pendingLeavesCount = count;
  }
}
