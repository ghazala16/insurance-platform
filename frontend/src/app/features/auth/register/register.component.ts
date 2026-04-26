import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
          <h1>Create Account</h1>
          <p>Join InsureFlow today</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="fullName">
            <mat-icon matSuffix>badge</mat-icon>
            <mat-error *ngIf="form.get('fullName')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Username</mat-label>
            <input matInput formControlName="username">
            <mat-icon matSuffix>alternate_email</mat-icon>
            <mat-error *ngIf="form.get('username')?.hasError('required')">Required</mat-error>
            <mat-error *ngIf="form.get('username')?.hasError('minlength')">Min 3 characters</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email">
            <mat-icon matSuffix>email</mat-icon>
            <mat-error *ngIf="form.get('email')?.hasError('required')">Required</mat-error>
            <mat-error *ngIf="form.get('email')?.hasError('email')">Invalid email</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput [type]="showPwd() ? 'text' : 'password'" formControlName="password">
            <button mat-icon-button matSuffix type="button" (click)="showPwd.set(!showPwd())">
              <mat-icon>{{ showPwd() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-hint>Min 8 chars with uppercase, digit & special char</mat-hint>
            <mat-error *ngIf="form.get('password')?.hasError('required')">Required</mat-error>
            <mat-error *ngIf="form.get('password')?.hasError('pattern')">Password too weak</mat-error>
          </mat-form-field>

          <div class="error-message" *ngIf="error()">{{ error() }}</div>

          <button mat-flat-button color="primary" type="submit"
                  class="full-width submit-btn" [disabled]="loading()">
            <mat-spinner *ngIf="loading()" diameter="20"></mat-spinner>
            <span *ngIf="!loading()">Create Account</span>
          </button>
        </form>

        <p class="auth-footer">
          Already have an account? <a routerLink="/auth/login">Sign In</a>
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
      padding: 24px;
    }
    .auth-card {
      background: white;
      border-radius: 16px;
      padding: 48px 40px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.4);
    }
    .auth-logo { text-align: center; margin-bottom: 32px; }
    .logo-icon { font-size: 48px; }
    .auth-logo h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin: 8px 0 4px; }
    .auth-logo p { color: #64748b; font-size: 14px; }
    .full-width { width: 100%; }
    .submit-btn { height: 48px; font-size: 16px; font-weight: 600; margin-top: 8px; border-radius: 8px; }
    .error-message { color: #ef4444; font-size: 14px; margin-bottom: 12px; padding: 12px;
      background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca; }
    .auth-footer { text-align: center; margin-top: 24px; color: #64748b; font-size: 14px; }
    .auth-footer a { color: #3b82f6; font-weight: 600; text-decoration: none; }
  `],
})
export class RegisterComponent {
  form = this.fb.group({
    fullName: ['', Validators.required],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
    ]],
  });

  loading = signal(false);
  error = signal('');
  showPwd = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.register(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.error.set(err.error?.message || 'Registration failed. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
