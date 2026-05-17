/**
 * Authentication Service - Handles login, register, token management.
 * Integrates with LanguageService for auto-loading user language preference.
 */

import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { LanguageService } from './language.service';

export interface LoginRequest {
  mobile: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  mobile: string;
  password: string;
  confirm_password: string;
  email?: string;
  district?: string;
  state?: string;
  village?: string;
  preferred_language?: string;
  primary_crops?: string;
  land_size_acres?: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  name: string;
  role: string;
  preferred_language: string;
}

export interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  district?: string;
  state?: string;
  village?: string;
  role: string;
  preferred_language?: string;
  primary_crops?: string;
  land_size_acres?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'crop_predict_access_token';
  private readonly REFRESH_TOKEN_KEY = 'crop_predict_refresh_token';
  private readonly USER_KEY = 'crop_predict_user';

  private languageService = inject(LanguageService);

  /** Reactive signal for current user */
  private _currentUser = signal<UserProfile | null>(this.loadStoredUser());

  /** Read-only computed for whether user is authenticated */
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly currentUser = computed(() => this._currentUser());
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.api.post<TokenResponse>('/auth/login', credentials).pipe(
      tap((response) => {
        this.storeTokens(response.access_token, response.refresh_token);
        const user: UserProfile = {
          id: response.user_id,
          name: response.name,
          mobile: credentials.mobile,
          role: response.role,
          preferred_language: response.preferred_language,
        };
        this.storeUser(user);
        this._currentUser.set(user);

        // Auto-load user's preferred language on login
        if (response.preferred_language) {
          this.languageService.loadUserLanguage(response.preferred_language);
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<UserProfile> {
    return this.api.post<UserProfile>('/auth/register', data);
  }

  logout(): void {
    this.api.post('/auth/logout', {}).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    return this.api.post<TokenResponse>('/auth/refresh', { refresh_token: refreshToken }).pipe(
      tap((response) => {
        this.storeTokens(response.access_token, response.refresh_token);
      })
    );
  }

  getProfile(): Observable<UserProfile> {
    return this.api.get<UserProfile>('/auth/me').pipe(
      tap((user) => {
        this.storeUser(user);
        this._currentUser.set(user);
        // Sync language on profile refresh
        if (user.preferred_language) {
          this.languageService.loadUserLanguage(user.preferred_language);
        }
      })
    );
  }

  updateProfile(data: Partial<UserProfile>): Observable<UserProfile> {
    return this.api.put<UserProfile>('/auth/profile', data).pipe(
      tap((user) => {
        this.storeUser(user);
        this._currentUser.set(user);
      })
    );
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  private storeUser(user: UserProfile): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private loadStoredUser(): UserProfile | null {
    const stored = localStorage.getItem(this.USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }
}
