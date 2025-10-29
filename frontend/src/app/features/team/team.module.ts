import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material Design Modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';

// Components
import { TeamStatsComponent } from './components/team-stats/team-stats.component';
import { TeamListComponent } from './components/team-list/team-list.component';
import { MemberDetailComponent } from './components/member-detail/member-detail.component';

// Services
import { TeamService } from './services/team.service';

// Guards (to be implemented)
// import { RoleGuard } from '../../core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'stats',
    pathMatch: 'full'
  },
  {
    path: 'stats',
    component: TeamStatsComponent,
    // canActivate: [RoleGuard],
    data: { 
      title: 'Team Statistics',
      roles: ['SUPERVISOR', 'ADMIN', 'EMPLOYER']
    }
  },
  {
    path: 'list',
    component: TeamListComponent,
    // canActivate: [RoleGuard],
    data: { 
      title: 'Team Members',
      roles: ['SUPERVISOR', 'ADMIN', 'EMPLOYER']
    }
  },
  {
    path: 'member/:id',
    component: MemberDetailComponent,
    // canActivate: [RoleGuard],
    data: { 
      title: 'Member Details',
      roles: ['SUPERVISOR', 'ADMIN', 'EMPLOYER']
    }
  },
  // {
  //   path: 'member/:id/edit',
  //   // component: MemberEditComponent, // To be implemented
  //   // loadChildren: () => import('../user/user.module').then(m => m.UserModule),
  //   // canActivate: [RoleGuard],
  //   data: { 
  //     title: 'Edit Member',
  //     roles: ['SUPERVISOR', 'ADMIN', 'EMPLOYER']
  //   }
  // }
];

@NgModule({
  declarations: [
    TeamStatsComponent,
    TeamListComponent,
    MemberDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    
    // Material Design Modules
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatTabsModule,
    MatDividerModule
  ],
  providers: [
    TeamService
  ]
})
export class TeamModule { }