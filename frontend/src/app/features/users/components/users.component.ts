import { Component } from '@angular/core';

@Component({
  selector: 'app-users',
  template: `
    <div style="padding: 24px;">
      <h1>User Management</h1>
      <p style="margin-bottom: 24px; color: #666;">Manage users and their roles.</p>
      <mat-card>
        <mat-card-header><mat-card-title>Users</mat-card-title></mat-card-header>
        <mat-card-content><p>User management functionality will be implemented here.</p></mat-card-content>
      </mat-card>
    </div>
  `
})
export class UsersComponent { }