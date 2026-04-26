import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { PolicyService } from '../../../core/services/policy.service';
import { AuthService } from '../../../core/services/auth.service';
import { Policy, PagedResponse } from '../../../shared/models';
import { debounceTime, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatTableModule, MatPaginatorModule, MatChipsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatMenuModule, MatProgressSpinnerModule,
    MatTooltipModule, MatDialogModule,
  ],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <span>🛡️</span><span class="sidebar-title">InsureFlow</span>
        </div>
        <nav class="sidebar-nav">
          <a class="nav-item" routerLink="/dashboard"><mat-icon>dashboard</mat-icon><span>Dashboard</span></a>
          <a class="nav-item active" routerLink="/policies"><mat-icon>policy</mat-icon><span>Policies</span></a>
          <a class="nav-item" routerLink="/policies/new"><mat-icon>add_circle</mat-icon><span>New Policy</span></a>
        </nav>
        <div class="sidebar-footer">
          <div class="user-info" *ngIf="authService.currentUser() as user">
            <div class="user-avatar">{{ user.fullName[0] }}</div>
            <div>
              <div class="user-name">{{ user.fullName }}</div>
              <div class="user-role">{{ user.roles[0] }}</div>
            </div>
          </div>
          <button mat-icon-button (click)="authService.logout()"><mat-icon>logout</mat-icon></button>
        </div>
      </aside>

      <main class="main-content">
        <div class="page-header">
          <div>
            <h1>Insurance Policies</h1>
            <p>{{ pagedData()?.totalElements || 0 }} total policies</p>
          </div>
          <button mat-flat-button color="primary" routerLink="/policies/new">
            <mat-icon>add</mat-icon> New Policy
          </button>
        </div>

        <!-- Search & Filters -->
        <div class="toolbar">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search policies...</mat-label>
            <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearch($event)">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <div class="status-filters">
            <button mat-stroked-button
                    *ngFor="let s of statusFilters"
                    [class.active-filter]="activeStatus() === s.value"
                    (click)="filterByStatus(s.value)">
              {{ s.label }}
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="table-card">
          <div *ngIf="loading()" class="table-loading">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <table mat-table [dataSource]="policies()" class="policies-table" *ngIf="!loading()">
            <ng-container matColumnDef="policyNumber">
              <th mat-header-cell *matHeaderCellDef>Policy #</th>
              <td mat-cell *matCellDef="let p">
                <a [routerLink]="['/policies', p.id]" class="policy-link">{{ p.policyNumber }}</a>
              </td>
            </ng-container>

            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let p">
                <div class="policy-title">{{ p.title }}</div>
                <div class="policy-holder">{{ p.holderName }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let p">
                <mat-chip [class]="'chip-type chip-' + p.type.toLowerCase()">{{ p.type }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let p">
                <mat-chip [class]="'chip-status chip-' + p.status.toLowerCase()">{{ p.status }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="premium">
              <th mat-header-cell *matHeaderCellDef>Premium</th>
              <td mat-cell *matCellDef="let p">{{ p.premium | currency:p.currency }}</td>
            </ng-container>

            <ng-container matColumnDef="risk">
              <th mat-header-cell *matHeaderCellDef>Risk</th>
              <td mat-cell *matCellDef="let p">
                <mat-chip *ngIf="p.riskLevel" [class]="'chip-risk chip-' + p.riskLevel.toLowerCase().replace('_','-')">
                  {{ p.riskLevel }}
                </mat-chip>
                <span *ngIf="!p.riskLevel" class="pending-text">Assessing...</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let p">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [routerLink]="['/policies', p.id]">
                    <mat-icon>visibility</mat-icon> View
                  </button>
                  <button mat-menu-item [routerLink]="['/policies', p.id, 'edit']">
                    <mat-icon>edit</mat-icon> Edit
                  </button>
                  <button mat-menu-item *ngIf="authService.isManager()" (click)="deletePolicy(p)"
                          class="delete-action">
                    <mat-icon color="warn">delete</mat-icon> Delete
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="policy-row"></tr>
          </table>

          <div *ngIf="!loading() && policies().length === 0" class="empty-state">
            <mat-icon>inbox</mat-icon>
            <p>No policies found</p>
            <button mat-flat-button color="primary" routerLink="/policies/new">Create your first policy</button>
          </div>

          <mat-paginator
            *ngIf="pagedData() && pagedData()!.totalElements > 0"
            [length]="pagedData()!.totalElements"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25]"
            (page)="onPageChange($event)">
          </mat-paginator>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-layout { display: flex; min-height: 100vh; background: #f1f5f9; }
    .sidebar { width: 240px; flex-shrink: 0; background: #0f172a; color: white; display: flex; flex-direction: column; padding: 24px 0; }
    .sidebar-logo { display: flex; align-items: center; gap: 12px; padding: 0 24px 32px; font-size: 20px; font-weight: 800; }
    .sidebar-title { font-size: 18px; }
    .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 0 12px; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; color: #94a3b8; text-decoration: none; font-size: 14px; font-weight: 500; transition: all 0.15s; }
    .nav-item:hover, .nav-item.active { background: #1e293b; color: white; }
    .nav-item.active { color: #60a5fa; }
    .sidebar-footer { padding: 24px 16px 0; display: flex; align-items: center; justify-content: space-between; }
    .user-info { display: flex; align-items: center; gap: 10px; }
    .user-avatar { width: 36px; height: 36px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .user-name { font-size: 13px; font-weight: 600; }
    .user-role { font-size: 11px; color: #64748b; text-transform: uppercase; }

    .main-content { flex: 1; padding: 32px; overflow-y: auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0; }
    .page-header p { color: #64748b; margin: 4px 0 0; }

    .toolbar { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
    .search-field { min-width: 280px; }
    .status-filters { display: flex; gap: 8px; flex-wrap: wrap; }
    .status-filters button { font-size: 12px; padding: 0 12px; height: 36px; }
    .active-filter { background: #0f172a !important; color: white !important; }

    .table-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    .table-loading { display: flex; justify-content: center; padding: 48px; }
    .policies-table { width: 100%; }
    .policy-link { color: #3b82f6; font-weight: 600; text-decoration: none; font-size: 13px; font-family: monospace; }
    .policy-title { font-weight: 600; font-size: 14px; color: #0f172a; }
    .policy-holder { font-size: 12px; color: #64748b; }
    .policy-row:hover { background: #f8fafc; }
    .pending-text { font-size: 12px; color: #94a3b8; }
    .delete-action { color: #ef4444; }

    /* Status chips */
    mat-chip { font-size: 11px !important; font-weight: 600 !important; height: 22px !important; }
    .chip-active { background: #dcfce7 !important; color: #15803d !important; }
    .chip-pending { background: #fef9c3 !important; color: #a16207 !important; }
    .chip-expired { background: #fee2e2 !important; color: #b91c1c !important; }
    .chip-cancelled { background: #f1f5f9 !important; color: #475569 !important; }
    .chip-suspended { background: #fce7f3 !important; color: #9d174d !important; }

    /* Type chips */
    .chip-life { background: #ede9fe !important; color: #5b21b6 !important; }
    .chip-health { background: #d1fae5 !important; color: #065f46 !important; }
    .chip-property { background: #dbeafe !important; color: #1e40af !important; }
    .chip-casualty { background: #fef3c7 !important; color: #92400e !important; }
    .chip-marine { background: #e0f2fe !important; color: #075985 !important; }
    .chip-aviation { background: #f0fdf4 !important; color: #14532d !important; }

    /* Risk chips */
    .chip-low { background: #dcfce7 !important; color: #15803d !important; }
    .chip-medium { background: #fef9c3 !important; color: #a16207 !important; }
    .chip-high { background: #fee2e2 !important; color: #b91c1c !important; }
    .chip-very-high { background: #450a0a !important; color: #fca5a5 !important; }

    .empty-state { text-align: center; padding: 64px; color: #94a3b8; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; }
    .empty-state p { margin: 16px 0; font-size: 18px; }
  `],
})
export class PolicyListComponent implements OnInit {
  displayedColumns = ['policyNumber', 'title', 'type', 'status', 'premium', 'risk', 'actions'];
  policies = signal<Policy[]>([]);
  pagedData = signal<PagedResponse<Policy> | null>(null);
  loading = signal(true);
  activeStatus = signal<string | null>(null);
  searchQuery = '';
  pageSize = 10;
  currentPage = 0;

  private searchSubject = new Subject<string>();

  statusFilters = [
    { label: 'All', value: null },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Expired', value: 'EXPIRED' },
  ];

  constructor(
    private policySvc: PolicyService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadPolicies();
    this.searchSubject.pipe(debounceTime(400)).subscribe(q => {
      this.currentPage = 0;
      if (q.trim()) {
        this.policySvc.search(q, 0, this.pageSize).subscribe(res => this.applyResult(res));
      } else {
        this.loadPolicies();
      }
    });
  }

  loadPolicies(): void {
    this.loading.set(true);
    this.policySvc.getAll(this.currentPage, this.pageSize).subscribe({
      next: res => { this.applyResult(res); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  applyResult(res: PagedResponse<Policy>): void {
    this.pagedData.set(res);
    this.policies.set(res.content);
    this.loading.set(false);
  }

  onSearch(value: string): void { this.searchSubject.next(value); }

  filterByStatus(status: string | null): void {
    this.activeStatus.set(status);
    this.currentPage = 0;
    if (status) {
      this.policySvc.getByStatus(status as any, 0, this.pageSize).subscribe(res => this.applyResult(res));
    } else {
      this.loadPolicies();
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPolicies();
  }

  deletePolicy(policy: Policy): void {
    if (confirm(`Delete policy ${policy.policyNumber}? This cannot be undone.`)) {
      this.policySvc.delete(policy.id).subscribe(() => this.loadPolicies());
    }
  }
}
