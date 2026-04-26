import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, TokenResponse, UserInfo } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'insureflow_access_token';
  private readonly REFRESH_KEY = 'insureflow_refresh_token';
  private readonly USER_KEY = 'insureflow_user';

  private _currentUser = signal<UserInfo | null>(this.loadUserFromStorage());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly isAdmin = computed(() => this._currentUser()?.roles.includes('ADMIN') ?? false);
  readonly isManager = computed(() =>
    this._currentUser()?.roles.some(r => r === 'MANAGER' || r === 'ADMIN') ?? false
  );

  constructor(private http: HttpClient, private router: Router) {}

  register(request: RegisterRequest): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${environment.apiUrl}/auth/register`, request)
      .pipe(tap(res => this.handleAuthSuccess(res)));
  }

  login(request: LoginRequest): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(tap(res => this.handleAuthSuccess(res)));
  }

  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<TokenResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(tap(res => this.handleAuthSuccess(res)));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  private handleAuthSuccess(response: TokenResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_KEY, response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this._currentUser.set(response.user);
  }

  private loadUserFromStorage(): UserInfo | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
