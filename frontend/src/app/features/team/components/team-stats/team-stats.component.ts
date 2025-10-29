import { Component, OnInit } from '@angular/core';
import { TeamService, TeamStats } from '../../services/team.service';

@Component({
  selector: 'app-team-stats',
  templateUrl: './team-stats.component.html',
  styleUrls: ['./team-stats.component.scss']
})
export class TeamStatsComponent implements OnInit {
  stats: TeamStats | null = null;
  loading = false;
  error: string | null = null;

  constructor(private teamService: TeamService) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;

    this.teamService.getTeamStats().subscribe({
      next: (response) => {
        this.stats = response.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading team stats:', err);
        this.error = 'Failed to load team statistics';
        this.loading = false;
      }
    });
  }

  refresh(): void {
    this.loadStats();
  }
}