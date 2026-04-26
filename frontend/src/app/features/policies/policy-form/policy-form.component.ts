import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { PolicyService } from '../../../core/services/policy.service';

@Component({
  selector: 'app-policy-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatDatepickerModule, MatNativeDateModule, MatCardModule,
  ],
  template: `
    <div class="form-layout">
      <div class="form-header">
        <button mat-icon-button routerLink="/policies">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1>{{ isEdit() ? 'Edit Policy' : 'New Insurance Policy' }}</h1>
          <p>{{ isEdit() ? 'Update policy details' : 'Fill in the details to create a new policy' }}</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <!-- Section: Policy Details -->
          <mat-card class="form-section">
            <mat-card-header>
              <mat-card-title><mat-icon>info</mat-icon> Policy Details</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Policy Title</mat-label>
                <input matInput formControlName="title" placeholder="e.g. Annual Life Coverage 2025">
                <mat-error *ngIf="form.get('title')?.hasError('required')">Required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"></textarea>
              </mat-form-field>

              <div class="two-col">
                <mat-form-field appearance="outline">
                  <mat-label>Policy Type</mat-label>
                  <mat-select formControlName="type">
                    <mat-option *ngFor="let t of policyTypes" [value]="t">{{ t }}</mat-option>
                  </mat-select>
                  <mat-error *ngIf="form.get('type')?.hasError('required')">Required</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Currency</mat-label>
                  <mat-select formControlName="currency">
                    <mat-option value="USD">USD</mat-option>
                    <mat-option value="EUR">EUR</mat-option>
                    <mat-option value="GBP">GBP</mat-option>
                    <mat-option value="INR">INR</mat-option>
                    <mat-option value="CHF">CHF</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Section: Policyholder -->
          <mat-card class="form-section">
            <mat-card-header>
              <mat-card-title><mat-icon>person</mat-icon> Policyholder</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="holderName">
                <mat-error *ngIf="form.get('holderName')?.hasError('required')">Required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email Address</mat-label>
                <input matInput formControlName="holderEmail" type="email">
                <mat-error *ngIf="form.get('holderEmail')?.hasError('required')">Required</mat-error>
                <mat-error *ngIf="form.get('holderEmail')?.hasError('email')">Invalid email</mat-error>
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <!-- Section: Financial -->
          <mat-card class="form-section">
            <mat-card-header>
              <mat-card-title><mat-icon>payments</mat-icon> Financial Details</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="two-col">
                <mat-form-field appearance="outline">
                  <mat-label>Annual Premium</mat-label>
                  <input matInput formControlName="premium" type="number" min="0">
                  <mat-error *ngIf="form.get('premium')?.hasError('required')">Required</mat-error>
                  <mat-error *ngIf="form.get('premium')?.hasError('min')">Must be positive</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Coverage Amount</mat-label>
                  <input matInput formControlName="coverageAmount" type="number" min="0">
                  <mat-error *ngIf="form.get('coverageAmount')?.hasError('required')">Required</mat-error>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Section: Dates -->
          <mat-card class="form-section">
            <mat-card-header>
              <mat-card-title><mat-icon>date_range</mat-icon> Policy Period</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="two-col">
                <mat-form-field appearance="outline">
                  <mat-label>Start Date</mat-label>
                  <input matInput [matDatepicker]="startPicker" formControlName="startDate">
                  <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                  <mat-datepicker #startPicker></mat-datepicker>
                  <mat-error *ngIf="form.get('startDate')?.hasError('required')">Required</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>End Date</mat-label>
                  <input matInput [matDatepicker]="endPicker" formControlName="endDate">
                  <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                  <mat-datepicker #endPicker></mat-datepicker>
                  <mat-error *ngIf="form.get('endDate')?.hasError('required')">Required</mat-error>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Submit -->
        <div class="form-actions">
          <div class="error-message" *ngIf="error()">{{ error() }}</div>
          <div class="success-message" *ngIf="success()">{{ success() }}</div>
          <button mat-stroked-button type="button" routerLink="/policies">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="loading()">
            <mat-spinner *ngIf="loading()" diameter="20"></mat-spinner>
            <span *ngIf="!loading()">{{ isEdit() ? 'Update Policy' : 'Create Policy' }}</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-layout { max-width: 900px; margin: 0 auto; padding: 32px; }
    .form-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 32px; }
    .form-header h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
    .form-header p { color: #64748b; margin: 4px 0 0; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .form-section { border-radius: 12px !important; }
    .form-section mat-card-title { display: flex; align-items: center; gap: 8px; font-size: 15px !important; }
    .full-width { width: 100%; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; align-items: center; flex-wrap: wrap; }
    .error-message { color: #ef4444; background: #fef2f2; padding: 12px 16px; border-radius: 8px; flex: 1; }
    .success-message { color: #15803d; background: #dcfce7; padding: 12px 16px; border-radius: 8px; flex: 1; }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } .two-col { grid-template-columns: 1fr; } }
  `],
})
export class PolicyFormComponent implements OnInit {
  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    type: ['', Validators.required],
    holderName: ['', Validators.required],
    holderEmail: ['', [Validators.required, Validators.email]],
    premium: [null, [Validators.required, Validators.min(0.01)]],
    coverageAmount: [null, [Validators.required, Validators.min(1)]],
    currency: ['USD', Validators.required],
    startDate: [null, Validators.required],
    endDate: [null, Validators.required],
  });

  isEdit = signal(false);
  loading = signal(false);
  error = signal('');
  success = signal('');
  editId = '';

  policyTypes = ['LIFE', 'HEALTH', 'PROPERTY', 'CASUALTY', 'LIABILITY', 'MARINE', 'AVIATION'];

  constructor(
    private fb: FormBuilder,
    private policySvc: PolicyService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.editId = this.route.snapshot.params['id'];
    if (this.editId) {
      this.isEdit.set(true);
      this.policySvc.getById(this.editId).subscribe(policy => {
        this.form.patchValue({
          title: policy.title,
          description: policy.description,
          type: policy.type,
          holderName: policy.holderName,
          holderEmail: policy.holderEmail,
          premium: policy.premium as any,
          coverageAmount: policy.coverageAmount as any,
          currency: policy.currency,
          startDate: policy.startDate as any,
          endDate: policy.endDate as any,
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    const value = this.form.value;
    const formatDate = (d: any) => d instanceof Date
      ? d.toISOString().split('T')[0]
      : d;

    const payload = {
      ...value,
      startDate: formatDate(value.startDate),
      endDate: formatDate(value.endDate),
    } as any;

    const request$ = this.isEdit()
      ? this.policySvc.update(this.editId, payload)
      : this.policySvc.create(payload);

    request$.subscribe({
      next: (policy) => {
        this.success.set(this.isEdit() ? 'Policy updated!' : `Policy ${policy.policyNumber} created! Processing asynchronously...`);
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/policies', policy.id]), 1500);
      },
      error: err => {
        this.error.set(err.error?.message || 'Failed to save policy.');
        this.loading.set(false);
      },
    });
  }
}
