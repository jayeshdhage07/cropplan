/**
 * Authentication Service - Handles login, register, token management.
 */

import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface LoginRequest {
  mobile: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  mobile: string;
  password: string;
  email?: string;
  district?: string;
  state?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  name: string;
  role: string;
}

export interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  district?: string;
  state?: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'crop_predict_token';
  private readonly USER_KEY = 'crop_predict_user';

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
    return this.api.post<TokenResponse>('/api/auth/login', credentials).pipe(
      tap((response) => {
        this.storeToken(response.access_token);
        const user: UserProfile = {
          id: response.user_id,
          name: response.name,
          mobile: credentials.mobile,
          role: response.role,
        };
        this.storeUser(user);
        this._currentUser.set(user);
      })
    );
  }

  register(data: RegisterRequest): Observable<UserProfile> {
    return this.api.post<UserProfile>('/api/auth/register', data);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getProfile(): Observable<UserProfile> {
    return this.api.get<UserProfile>('/api/auth/me').pipe(
      tap((user) => {
        this.storeUser(user);
        this._currentUser.set(user);
      })
    );
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
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
