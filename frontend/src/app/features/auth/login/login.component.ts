import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="logo-icon">🛡️</span>
          <h1>InsureFlow</h1>
          <p>Cloud Insurance Management</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Username or Email</mat-label>
            <input matInput formControlName="username" autocomplete="username">
            <mat-icon matSuffix>person</mat-icon>
            <mat-error *ngIf="form.get('username')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput [type]="showPassword() ? 'text' : 'password'"
                   formControlName="password" autocomplete="current-password">
            <button mat-icon-button matSuffix type="button" (click)="showPassword.set(!showPassword())">
              <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="form.get('password')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <div class="error-message" *ngIf="error()">{{ error() }}</div>

          <button mat-flat-button color="primary" type="submit"
                  class="full-width submit-btn" [disabled]="loading()">
            <mat-spinner *ngIf="loading()" diameter="20"></mat-spinner>
            <span *ngIf="!loading()">Sign In</span>
          </button>
        </form>

        <p class="auth-footer">
          Don't have an account? <a routerLink="/auth/register">Register</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
    }
    .auth-card {
      background: white;
      border-radius: 16px;
      padding: 48px 40px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.4);
    }
    .auth-logo {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo-icon { font-size: 48px; }
    .auth-logo h1 {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      margin: 8px 0 4px;
    }
    .auth-logo p { color: #64748b; font-size: 14px; }
    .full-width { width: 100%; }
    .submit-btn {
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      margin-top: 8px;
      border-radius: 8px;
    }
    .error-message {
      color: #ef4444;
      font-size: 14px;
      margin-bottom: 12px;
      padding: 12px;
      background: #fef2f2;
      border-radius: 8px;
      border: 1px solid #fecaca;
    }
    .auth-footer {
      text-align: center;
      margin-top: 24px;
      color: #64748b;
      font-size: 14px;
    }
    .auth-footer a { color: #3b82f6; font-weight: 600; text-decoration: none; }
  `],
})
export class LoginComponent {
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.error.set(err.error?.message || 'Login failed. Please check your credentials.');
        this.loading.set(false);
      },
    });
  }
}
