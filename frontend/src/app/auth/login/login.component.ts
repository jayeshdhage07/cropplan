/**
 * Login Page Component.
 * Premium login form with mobile number, password, and language selection.
 * All labels are translated via ngx-translate.
 */

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslateModule,
    LanguageSelectorComponent,
  ],
  template: `
    <div class="auth-page">
      <div class="auth-container animate-fade-in-up">
        <!-- Language Selector (before login) -->
        <div class="pre-auth-lang">
          <app-language-selector mode="dropdown"></app-language-selector>
        </div>

        <!-- Branding -->
        <div class="auth-branding">
          <mat-icon class="brand-icon">eco</mat-icon>
          <h1>{{ 'APP.NAME' | translate }}</h1>
          <p>{{ 'APP.TAGLINE' | translate }}</p>
        </div>

        <!-- Login Card -->
        <mat-card class="auth-card">
          <mat-card-header>
            <mat-card-title>{{ 'AUTH.LOGIN.TITLE' | translate }}</mat-card-title>
            <mat-card-subtitle>{{ 'AUTH.LOGIN.SUBTITLE' | translate }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'AUTH.LOGIN.MOBILE' | translate }}</mat-label>
                <input
                  matInput
                  formControlName="mobile"
                  type="tel"
                  [placeholder]="'AUTH.LOGIN.MOBILE_PLACEHOLDER' | translate"
                  id="login-mobile"
                />
                <mat-icon matPrefix>phone</mat-icon>
                @if (loginForm.get('mobile')?.hasError('required') && loginForm.get('mobile')?.touched) {
                  <mat-error>{{ 'AUTH.VALIDATION.REQUIRED' | translate }}</mat-error>
                }
                @if (loginForm.get('mobile')?.hasError('pattern') && loginForm.get('mobile')?.touched) {
                  <mat-error>{{ 'AUTH.VALIDATION.MOBILE_INVALID' | translate }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'AUTH.LOGIN.PASSWORD' | translate }}</mat-label>
                <input
                  matInput
                  formControlName="password"
                  [type]="hidePassword() ? 'password' : 'text'"
                  [placeholder]="'AUTH.LOGIN.PASSWORD_PLACEHOLDER' | translate"
                  id="login-password"
                />
                <mat-icon matPrefix>lock</mat-icon>
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="hidePassword.set(!hidePassword())"
                >
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                  <mat-error>{{ 'AUTH.VALIDATION.REQUIRED' | translate }}</mat-error>
                }
              </mat-form-field>

              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="submit-btn"
                [disabled]="loading()"
                id="login-submit"
              >
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ 'AUTH.LOGIN.SUBMIT' | translate }}
                }
              </button>
            </form>
          </mat-card-content>

          <mat-card-actions>
            <p class="auth-link">
              {{ 'AUTH.LOGIN.NO_ACCOUNT' | translate }}
              <a routerLink="/auth/register">{{ 'AUTH.LOGIN.REGISTER_LINK' | translate }}</a>
            </p>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--gradient-hero);
      padding: var(--space-4);
    }

    .auth-container {
      width: 100%;
      max-width: 420px;
    }

    .pre-auth-lang {
      margin-bottom: var(--space-4);
      ::ng-deep .mat-mdc-form-field {
        .mdc-text-field--outlined {
          background: rgba(255,255,255,0.15);
          border-radius: var(--radius-md);
        }
        .mat-mdc-select-value, .mat-mdc-floating-label, mat-icon {
          color: white !important;
        }
      }
    }

    .auth-branding {
      text-align: center;
      margin-bottom: var(--space-8);
      color: white;

      .brand-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: var(--space-2);
      }

      h1 {
        font-size: var(--font-size-3xl);
        font-weight: 800;
        margin-bottom: var(--space-1);
      }

      p {
        font-size: var(--font-size-base);
        opacity: 0.8;
      }
    }

    .auth-card {
      padding: var(--space-8) !important;
      border-radius: var(--radius-xl) !important;
      box-shadow: var(--shadow-xl) !important;
    }

    mat-card-header {
      margin-bottom: var(--space-6);

      mat-card-title {
        font-size: var(--font-size-2xl) !important;
        font-weight: 700 !important;
      }
    }

    mat-form-field {
      width: 100%;
      margin-bottom: var(--space-2);
    }

    .submit-btn {
      width: 100%;
      height: 48px;
      font-size: var(--font-size-base);
      margin-top: var(--space-4);
    }

    .auth-link {
      text-align: center;
      margin-top: var(--space-4);
      color: var(--color-text-secondary);

      a {
        color: var(--color-primary);
        font-weight: 600;
      }
    }
  `],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = signal(false);
  hidePassword = signal(true);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.loginForm = this.fb.group({
      mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.translate.get('AUTH.LOGIN.SUCCESS').subscribe(msg => {
          this.snackBar.open(msg, '✕', { duration: 3000 });
        });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err.error?.error?.message;
        if (message) {
          this.snackBar.open(message, '✕', { duration: 5000 });
        } else {
          this.translate.get('AUTH.LOGIN.FAILED').subscribe(msg => {
            this.snackBar.open(msg, '✕', { duration: 5000 });
          });
        }
      },
    });
  }
}
