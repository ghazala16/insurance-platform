import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { PolicyService } from '../../../core/services/policy.service';
import { AuthService } from '../../../core/services/auth.service';
import { Policy } from '../../../shared/models';

@Component({
  selector: 'app-policy-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, CurrencyPipe, DatePipe,
    MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressSpinnerModule, MatDividerModule,
  ],
  template: `
    <div class="detail-layout">
      <div class="detail-header">
        <button mat-stroked-button routerLink="/policies">
          <mat-icon>arrow_back</mat-icon> Back to Policies
        </button>
        <div class="header-actions" *ngIf="policy()">
          <button mat-stroked-button [routerLink]="['/policies', policy()!.id, 'edit']">
            <mat-icon>edit</mat-icon> Edit
          </button>
          <button mat-flat-button color="warn" *ngIf="authService.isManager()"
                  (click)="deletePolicy()">
            <mat-icon>delete</mat-icon> Delete
          </button>
        </div>
      </div>

      <div *ngIf="loading()" class="loading-center"><mat-spinner diameter="48"></mat-spinner></div>

      <ng-container *ngIf="policy() as p">
        <!-- Title bar -->
        <div class="policy-banner">
          <div class="banner-left">
            <div class="policy-number">{{ p.policyNumber }}</div>
            <h1>{{ p.title }}</h1>
            <p>{{ p.description }}</p>
          </div>
          <div class="banner-right">
            <mat-chip [class]="'chip-status chip-' + p.status.toLowerCase()">{{ p.status }}</mat-chip>
            <mat-chip *ngIf="p.riskLevel" [class]="'chip-risk chip-' + p.riskLevel.toLowerCase().replace('_','-')">
              Risk: {{ p.riskLevel }}
            </mat-chip>
            <mat-chip *ngIf="!p.riskLevel" class="chip-assessing">
              <mat-spinner diameter="12"></mat-spinner>&nbsp;Assessing Risk...
            </mat-chip>
          </div>
        </div>

        <div class="detail-grid">
          <!-- Policyholder -->
          <mat-card class="detail-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>person</mat-icon>
              <mat-card-title>Policyholder</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="detail-row"><span class="label">Full Name</span><span>{{ p.holderName }}</span></div>
              <mat-divider></mat-divider>
              <div class="detail-row"><span class="label">Email</span><span>{{ p.holderEmail }}</span></div>
            </mat-card-content>
          </mat-card>

          <!-- Financial -->
          <mat-card class="detail-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>payments</mat-icon>
              <mat-card-title>Financial</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="detail-row">
                <span class="label">Annual Premium</span>
                <span class="amount">{{ p.premium | currency:p.currency }}</span>
              </div>
              <mat-divider></mat-divider>
              <div class="detail-row">
                <span class="label">Coverage Amount</span>
                <span class="amount coverage">{{ p.coverageAmount | currency:p.currency }}</span>
              </div>
              <mat-divider></mat-divider>
              <div class="detail-row">
                <span class="label">Currency</span>
                <span>{{ p.currency }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Policy Info -->
          <mat-card class="detail-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>policy</mat-icon>
              <mat-card-title>Policy Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="detail-row">
                <span class="label">Type</span>
                <mat-chip [class]="'chip-type chip-' + p.type.toLowerCase()">{{ p.type }}</mat-chip>
              </div>
              <mat-divider></mat-divider>
              <div class="detail-row"><span class="label">Start Date</span><span>{{ p.startDate | date }}</span></div>
              <mat-divider></mat-divider>
              <div class="detail-row"><span class="label">End Date</span><span>{{ p.endDate | date }}</span></div>
            </mat-card-content>
          </mat-card>

          <!-- Risk Assessment -->
          <mat-card class="detail-card" [class.risk-card-pending]="!p.riskLevel">
            <mat-card-header>
              <mat-icon mat-card-avatar>security</mat-icon>
              <mat-card-title>Risk Assessment</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="p.riskLevel; else riskPending">
                <div class="detail-row">
                  <span class="label">Risk Level</span>
                  <mat-chip [class]="'chip-risk chip-' + p.riskLevel.toLowerCase().replace('_','-')">
                    {{ p.riskLevel }}
                  </mat-chip>
                </div>
                <mat-divider></mat-divider>
                <div class="detail-row notes">
                  <span class="label">Notes</span>
                  <span>{{ p.riskNotes }}</span>
                </div>
              </div>
              <ng-template #riskPending>
                <div class="risk-pending-state">
                  <mat-spinner diameter="32"></mat-spinner>
                  <p>Risk assessment in progress via Azure Service Bus...</p>
                  <small>Policy status will update to ACTIVE once complete.</small>
                </div>
              </ng-template>
            </mat-card-content>
          </mat-card>

          <!-- Audit -->
          <mat-card class="detail-card audit-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>history</mat-icon>
              <mat-card-title>Audit Trail</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="detail-row"><span class="label">Created By</span><span>{{ p.createdBy }}</span></div>
              <mat-divider></mat-divider>
              <div class="detail-row"><span class="label">Created At</span><span>{{ p.createdAt | date:'medium' }}</span></div>
              <mat-divider></mat-divider>
              <div class="detail-row"><span class="label">Last Updated</span><span>{{ p.updatedAt | date:'medium' }}</span></div>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .detail-layout { max-width: 1100px; margin: 0 auto; padding: 32px; }
    .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header-actions { display: flex; gap: 12px; }
    .loading-center { display: flex; justify-content: center; padding: 64px; }

    .policy-banner {
      background: linear-gradient(135deg, #0f172a, #1e3a5f);
      border-radius: 16px; padding: 32px; margin-bottom: 24px;
      display: flex; justify-content: space-between; align-items: flex-start; color: white;
    }
    .policy-number { font-size: 13px; color: #94a3b8; font-family: monospace; margin-bottom: 8px; letter-spacing: 1px; }
    .banner-left h1 { font-size: 26px; font-weight: 800; margin: 0 0 8px; }
    .banner-left p { color: #94a3b8; margin: 0; }
    .banner-right { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }

    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .audit-card { grid-column: span 2; }
    .detail-card { border-radius: 12px !important; }
    .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; font-size: 14px; }
    .detail-row.notes { align-items: flex-start; gap: 16px; }
    .label { color: #64748b; font-weight: 500; }
    .amount { font-weight: 700; font-size: 16px; }
    .coverage { color: #0284c7; }

    /* Status / type / risk chips (same as list) */
    mat-chip { font-size: 11px !important; font-weight: 600 !important; }
    .chip-active { background: #dcfce7 !important; color: #15803d !important; }
    .chip-pending { background: #fef9c3 !important; color: #a16207 !important; }
    .chip-expired { background: #fee2e2 !important; color: #b91c1c !important; }
    .chip-life { background: #ede9fe !important; color: #5b21b6 !important; }
    .chip-health { background: #d1fae5 !important; color: #065f46 !important; }
    .chip-property { background: #dbeafe !important; color: #1e40af !important; }
    .chip-low { background: #dcfce7 !important; color: #15803d !important; }
    .chip-medium { background: #fef9c3 !important; color: #a16207 !important; }
    .chip-high { background: #fee2e2 !important; color: #b91c1c !important; }
    .chip-very-high { background: #450a0a !important; color: #fca5a5 !important; }
    .chip-assessing { background: #f1f5f9 !important; color: #475569 !important; display: flex; align-items: center; }

    .risk-pending-state { text-align: center; padding: 24px; color: #64748b; }
    .risk-pending-state p { margin: 16px 0 4px; font-weight: 500; }
    .risk-pending-state small { font-size: 12px; }
    .risk-card-pending { border: 1px dashed #cbd5e1 !important; }

    @media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } .audit-card { grid-column: span 1; } }
  `],
})
export class PolicyDetailComponent implements OnInit {
  policy = signal<Policy | null>(null);
  loading = signal(true);

  constructor(
    private policySvc: PolicyService,
    public authService: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.policySvc.getById(id).subscribe({
      next: p => { this.policy.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  deletePolicy(): void {
    const p = this.policy();
    if (!p) return;
    if (confirm(`Delete policy ${p.policyNumber}?`)) {
      this.policySvc.delete(p.id).subscribe(() => history.back());
    }
  }
}
