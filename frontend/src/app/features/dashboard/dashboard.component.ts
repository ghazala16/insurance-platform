import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { DashboardApiService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats } from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, CurrencyPipe,
    MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatChipsModule,
  ],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <span>🛡️</span>
          <span class="sidebar-title">InsureFlow</span>
        </div>
        <nav class="sidebar-nav">
          <a class="nav-item active" routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon><span>Dashboard</span>
          </a>
          <a class="nav-item" routerLink="/policies">
            <mat-icon>policy</mat-icon><span>Policies</span>
          </a>
          <a class="nav-item" routerLink="/policies/new">
            <mat-icon>add_circle</mat-icon><span>New Policy</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="user-info" *ngIf="authService.currentUser() as user">
            <div class="user-avatar">{{ user.fullName[0] }}</div>
            <div>
              <div class="user-name">{{ user.fullName }}</div>
              <div class="user-role">{{ user.roles[0] }}</div>
            </div>
          </div>
          <button mat-icon-button (click)="authService.logout()" title="Logout">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="main-content">
        <div class="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {{ authService.currentUser()?.fullName }}</p>
          </div>
          <button mat-flat-button color="primary" routerLink="/policies/new">
            <mat-icon>add</mat-icon> New Policy
          </button>
        </div>

        <div *ngIf="loading()" class="loading-center">
          <mat-spinner diameter="48"></mat-spinner>
        </div>

        <ng-container *ngIf="stats() as s">
          <!-- KPI Cards -->
          <div class="kpi-grid">
            <div class="kpi-card kpi-total">
              <div class="kpi-icon"><mat-icon>article</mat-icon></div>
              <div class="kpi-body">
                <div class="kpi-value">{{ s.totalPolicies }}</div>
                <div class="kpi-label">Total Policies</div>
              </div>
            </div>
            <div class="kpi-card kpi-active">
              <div class="kpi-icon"><mat-icon>check_circle</mat-icon></div>
              <div class="kpi-body">
                <div class="kpi-value">{{ s.activePolicies }}</div>
                <div class="kpi-label">Active</div>
              </div>
            </div>
            <div class="kpi-card kpi-pending">
              <div class="kpi-icon"><mat-icon>pending</mat-icon></div>
              <div class="kpi-body">
                <div class="kpi-value">{{ s.pendingPolicies }}</div>
                <div class="kpi-label">Pending</div>
              </div>
            </div>
            <div class="kpi-card kpi-premium">
              <div class="kpi-icon"><mat-icon>payments</mat-icon></div>
              <div class="kpi-body">
                <div class="kpi-value">{{ s.totalPremium | currency:'USD':'symbol':'1.0-0' }}</div>
                <div class="kpi-label">Total Premium</div>
              </div>
            </div>
            <div class="kpi-card kpi-coverage">
              <div class="kpi-icon"><mat-icon>shield</mat-icon></div>
              <div class="kpi-body">
                <div class="kpi-value">{{ s.totalCoverage | currency:'USD':'symbol':'1.0-0' }}</div>
                <div class="kpi-label">Total Coverage</div>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="charts-grid">
            <!-- By Type -->
            <mat-card class="chart-card">
              <mat-card-header>
                <mat-card-title>Policies by Type</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div *ngFor="let entry of typeEntries(s)" class="bar-row">
                  <span class="bar-label">{{ entry.key }}</span>
                  <div class="bar-track">
                    <div class="bar-fill bar-type"
                         [style.width.%]="barWidth(entry.value, s.totalPolicies)">
                    </div>
                  </div>
                  <span class="bar-count">{{ entry.value }}</span>
                </div>
                <p *ngIf="!typeEntries(s).length" class="empty-chart">No data yet</p>
              </mat-card-content>
            </mat-card>

            <!-- By Risk -->
            <mat-card class="chart-card">
              <mat-card-header>
                <mat-card-title>Risk Distribution</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div *ngFor="let entry of riskEntries(s)" class="bar-row">
                  <span class="bar-label">{{ entry.key }}</span>
                  <div class="bar-track">
                    <div class="bar-fill"
                         [class]="'bar-risk-' + entry.key.toLowerCase().replace('_','-')"
                         [style.width.%]="barWidth(entry.value, s.totalPolicies)">
                    </div>
                  </div>
                  <span class="bar-count">{{ entry.value }}</span>
                </div>
                <p *ngIf="!riskEntries(s).length" class="empty-chart">Risk data pending</p>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Quick Actions -->
          <mat-card class="quick-actions-card">
            <mat-card-header>
              <mat-card-title>Quick Actions</mat-card-title>
            </mat-card-header>
            <mat-card-content class="quick-actions">
              <button mat-stroked-button routerLink="/policies/new">
                <mat-icon>add</mat-icon> Create Policy
              </button>
              <button mat-stroked-button routerLink="/policies">
                <mat-icon>search</mat-icon> Search Policies
              </button>
              <button mat-stroked-button [routerLink]="['/policies']" [queryParams]="{status:'PENDING'}">
                <mat-icon>pending_actions</mat-icon> View Pending
              </button>
              <button mat-stroked-button [routerLink]="['/policies']" [queryParams]="{status:'EXPIRED'}">
                <mat-icon>event_busy</mat-icon> View Expired
              </button>
            </mat-card-content>
          </mat-card>
        </ng-container>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-layout { display: flex; min-height: 100vh; background: #f1f5f9; }

    /* Sidebar */
    .sidebar {
      width: 240px; flex-shrink: 0;
      background: #0f172a; color: white;
      display: flex; flex-direction: column; padding: 24px 0;
    }
    .sidebar-logo { display: flex; align-items: center; gap: 12px; padding: 0 24px 32px; font-size: 20px; font-weight: 800; }
    .sidebar-title { font-size: 18px; }
    .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 0 12px; }
    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; border-radius: 8px; color: #94a3b8;
      text-decoration: none; font-size: 14px; font-weight: 500;
      transition: all 0.15s;
    }
    .nav-item:hover, .nav-item.active { background: #1e293b; color: white; }
    .nav-item.active { color: #60a5fa; }
    .sidebar-footer { padding: 24px 16px 0; display: flex; align-items: center; justify-content: space-between; }
    .user-info { display: flex; align-items: center; gap: 10px; }
    .user-avatar { width: 36px; height: 36px; background: #3b82f6; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .user-name { font-size: 13px; font-weight: 600; }
    .user-role { font-size: 11px; color: #64748b; text-transform: uppercase; }

    /* Main */
    .main-content { flex: 1; padding: 32px; overflow-y: auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .page-header h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0; }
    .page-header p { color: #64748b; margin: 4px 0 0; }
    .loading-center { display: flex; justify-content: center; padding: 64px; }

    /* KPI Grid */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .kpi-card {
      background: white; border-radius: 12px; padding: 24px;
      display: flex; align-items: center; gap: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid transparent;
    }
    .kpi-total { border-color: #6366f1; }
    .kpi-active { border-color: #22c55e; }
    .kpi-pending { border-color: #f59e0b; }
    .kpi-premium { border-color: #3b82f6; }
    .kpi-coverage { border-color: #8b5cf6; }
    .kpi-icon { width: 48px; height: 48px; border-radius: 10px; background: #f1f5f9;
      display: flex; align-items: center; justify-content: center; color: #475569; }
    .kpi-value { font-size: 22px; font-weight: 800; color: #0f172a; }
    .kpi-label { font-size: 12px; color: #64748b; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

    /* Charts */
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .chart-card { border-radius: 12px !important; }
    .bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-size: 13px; }
    .bar-label { width: 90px; flex-shrink: 0; color: #475569; font-weight: 500; }
    .bar-track { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
    .bar-type { background: #6366f1; }
    .bar-risk-low { background: #22c55e; }
    .bar-risk-medium { background: #f59e0b; }
    .bar-risk-high { background: #ef4444; }
    .bar-risk-very-high { background: #7f1d1d; }
    .bar-count { width: 24px; text-align: right; font-weight: 700; color: #0f172a; }
    .empty-chart { color: #94a3b8; font-size: 13px; text-align: center; padding: 16px 0; }

    /* Quick Actions */
    .quick-actions-card { border-radius: 12px !important; }
    .quick-actions { display: flex; gap: 12px; flex-wrap: wrap; padding-top: 8px; }
    .quick-actions button { gap: 8px; }

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .charts-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  loading = signal(true);

  constructor(
    private dashboardSvc: DashboardApiService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.dashboardSvc.getStats().subscribe({
      next: s => { this.stats.set(s); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  typeEntries(s: DashboardStats): { key: string; value: number }[] {
    return Object.entries(s.policiesByType).map(([key, value]) => ({ key, value }));
  }

  riskEntries(s: DashboardStats): { key: string; value: number }[] {
    return Object.entries(s.policiesByRisk).map(([key, value]) => ({ key, value }));
  }

  barWidth(value: number, total: number): number {
    return total ? Math.round((value / total) * 100) : 0;
  }
}
