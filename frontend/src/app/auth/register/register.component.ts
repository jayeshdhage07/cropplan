/**
 * Register Page Component.
 * Enhanced registration form for farmers with language selection,
 * all farmer-specific fields, and full i18n support.
 */

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatProgressSpinnerModule, MatSnackBarModule,
    TranslateModule, LanguageSelectorComponent,
  ],
  template: `
    <div class="auth-page">
      <div class="auth-container animate-fade-in-up">
        <!-- Language Selector -->
        <div class="pre-auth-lang">
          <app-language-selector mode="dropdown"></app-language-selector>
        </div>

        <div class="auth-branding">
          <mat-icon class="brand-icon">eco</mat-icon>
          <h1>{{ 'APP.NAME' | translate }}</h1>
          <p>{{ 'AUTH.REGISTER.TAGLINE' | translate }}</p>
        </div>

        <mat-card class="auth-card">
          <mat-card-header>
            <mat-card-title>{{ 'AUTH.REGISTER.TITLE' | translate }}</mat-card-title>
            <mat-card-subtitle>{{ 'AUTH.REGISTER.SUBTITLE' | translate }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'AUTH.REGISTER.NAME' | translate }}</mat-label>
                <input matInput formControlName="name" [placeholder]="'AUTH.REGISTER.NAME_PLACEHOLDER' | translate" id="register-name" />
                <mat-icon matPrefix>person</mat-icon>
                @if (f('name')?.hasError('required') && f('name')?.touched) {
                  <mat-error>{{ 'AUTH.VALIDATION.REQUIRED' | translate }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'AUTH.REGISTER.MOBILE' | translate }}</mat-label>
                <input matInput formControlName="mobile" type="tel" [placeholder]="'AUTH.REGISTER.MOBILE_PLACEHOLDER' | translate" id="register-mobile" />
                <mat-icon matPrefix>phone</mat-icon>
                @if (f('mobile')?.hasError('required') && f('mobile')?.touched) {
                  <mat-error>{{ 'AUTH.VALIDATION.REQUIRED' | translate }}</mat-error>
                }
                @if (f('mobile')?.hasError('pattern') && f('mobile')?.touched) {
                  <mat-error>{{ 'AUTH.VALIDATION.MOBILE_INVALID' | translate }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'AUTH.REGISTER.PASSWORD' | translate }}</mat-label>
                <input matInput formControlName="password" [type]="hidePassword() ? 'password' : 'text'" [placeholder]="'AUTH.REGISTER.PASSWORD_PLACEHOLDER' | translate" id="register-password" />
                <mat-icon matPrefix>lock</mat-icon>
                <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (f('password')?.hasError('required') && f('password')?.touched) {
                  <mat-error>{{ 'AUTH.VALIDATION.REQUIRED' | translate }}</mat-error>
                }
                @if (f('password')?.hasError('minlength') && f('password')?.touched) {
                  <mat-error>{{ 'AUTH.VALIDATION.PASSWORD_MIN' | translate }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'AUTH.REGISTER.CONFIRM_PASSWORD' | translate }}</mat-label>
                <input matInput formControlName="confirm_password" [type]="hidePassword() ? 'password' : 'text'" [placeholder]="'AUTH.REGISTER.CONFIRM_PASSWORD_PLACEHOLDER' | translate" id="register-confirm-password" />
                <mat-icon matPrefix>lock_outline</mat-icon>
                @if (f('confirm_password')?.hasError('required') && f('confirm_password')?.touched) {
                  <mat-error>{{ 'AUTH.VALIDATION.REQUIRED' | translate }}</mat-error>
                }
                @if (registerForm.hasError('passwordMismatch') && f('confirm_password')?.touched) {
                  <mat-error>{{ 'AUTH.VALIDATION.PASSWORD_MISMATCH' | translate }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'AUTH.REGISTER.STATE' | translate }}</mat-label>
                <mat-select formControlName="state" id="register-state">
                  @for (s of states; track s) { <mat-option [value]="s">{{ s }}</mat-option> }
                </mat-select>
                <mat-icon matPrefix>map</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'AUTH.REGISTER.DISTRICT' | translate }}</mat-label>
                <mat-select formControlName="district" id="register-district">
                  @for (d of districts; track d) { <mat-option [value]="d">{{ d }}</mat-option> }
                </mat-select>
                <mat-icon matPrefix>location_on</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'AUTH.REGISTER.VILLAGE' | translate }}</mat-label>
                <input matInput formControlName="village" [placeholder]="'AUTH.REGISTER.VILLAGE_PLACEHOLDER' | translate" id="register-village" />
                <mat-icon matPrefix>home</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'AUTH.REGISTER.EMAIL' | translate }}</mat-label>
                <input matInput formControlName="email" type="email" [placeholder]="'AUTH.REGISTER.EMAIL_PLACEHOLDER' | translate" id="register-email" />
                <mat-icon matPrefix>email</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'AUTH.REGISTER.PRIMARY_CROPS' | translate }}</mat-label>
                <input matInput formControlName="primary_crops" [placeholder]="'AUTH.REGISTER.PRIMARY_CROPS_PLACEHOLDER' | translate" id="register-crops" />
                <mat-icon matPrefix>grass</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>{{ 'AUTH.REGISTER.LAND_SIZE' | translate }}</mat-label>
                <input matInput formControlName="land_size_acres" type="number" [placeholder]="'AUTH.REGISTER.LAND_SIZE_PLACEHOLDER' | translate" id="register-land" />
                <mat-icon matPrefix>landscape</mat-icon>
              </mat-form-field>

              <button mat-raised-button color="primary" type="submit" class="submit-btn" [disabled]="loading()" id="register-submit">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ 'AUTH.REGISTER.SUBMIT' | translate }}
                }
              </button>
            </form>
          </mat-card-content>

          <mat-card-actions>
            <p class="auth-link">
              {{ 'AUTH.REGISTER.HAS_ACCOUNT' | translate }}
              <a routerLink="/auth/login">{{ 'AUTH.REGISTER.LOGIN_LINK' | translate }}</a>
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
    .auth-container { width: 100%; max-width: 480px; }
    .pre-auth-lang {
      margin-bottom: var(--space-4);
      ::ng-deep .mat-mdc-form-field {
        .mdc-text-field--outlined { background: rgba(255,255,255,0.15); border-radius: var(--radius-md); }
        .mat-mdc-select-value, .mat-mdc-floating-label, mat-icon { color: white !important; }
      }
    }
    .auth-branding {
      text-align: center; margin-bottom: var(--space-6); color: white;
      .brand-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: var(--space-2); }
      h1 { font-size: var(--font-size-3xl); font-weight: 800; margin-bottom: var(--space-1); }
      p { opacity: 0.8; }
    }
    .auth-card { padding: var(--space-6) !important; border-radius: var(--radius-xl) !important; box-shadow: var(--shadow-xl) !important; }
    mat-card-header { margin-bottom: var(--space-4); }
    mat-card-title { font-size: var(--font-size-2xl) !important; font-weight: 700 !important; }
    mat-form-field { width: 100%; margin-bottom: var(--space-1); }
    .submit-btn { width: 100%; height: 48px; font-size: var(--font-size-base); margin-top: var(--space-4); }
    .auth-link {
      text-align: center; margin-top: var(--space-4); color: var(--color-text-secondary);
      a { color: var(--color-primary); font-weight: 600; }
    }
  `],
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = signal(false);
  hidePassword = signal(true);

  states = ['Maharashtra', 'Karnataka', 'Madhya Pradesh', 'Gujarat', 'Rajasthan'];
  districts = [
    'Nashik', 'Pune', 'Nagpur', 'Aurangabad', 'Solapur',
    'Kolhapur', 'Sangli', 'Satara', 'Ahmednagar', 'Jalgaon',
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private langService: LanguageService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      email: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required]],
      state: ['Maharashtra'],
      district: [''],
      village: [''],
      primary_crops: [''],
      land_size_acres: [null],
    }, { validators: this.passwordMatchValidator });
  }

  /** Helper to access form controls in template */
  f(name: string): AbstractControl | null {
    return this.registerForm.get(name);
  }

  /** Cross-field validator for password matching */
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirm_password')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formValue = { ...this.registerForm.value };
    // Add current language as preferred_language
    formValue.preferred_language = this.langService.currentLang();
    // Convert land_size_acres to number or null
    if (!formValue.land_size_acres) {
      delete formValue.land_size_acres;
    }
    // Delete empty email to prevent DB unique constraint violation
    if (!formValue.email || formValue.email.trim() === '') {
      delete formValue.email;
    }

    this.authService.register(formValue).subscribe({
      next: () => {
        this.translate.get('AUTH.REGISTER.SUCCESS').subscribe(msg => {
          this.snackBar.open(msg, '✕', { duration: 3000 });
        });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err.error?.error?.message;
        if (message) {
          this.snackBar.open(message, '✕', { duration: 5000 });
        } else {
          this.translate.get('AUTH.REGISTER.FAILED').subscribe(msg => {
            this.snackBar.open(msg, '✕', { duration: 5000 });
          });
        }
      },
    });
  }
}
