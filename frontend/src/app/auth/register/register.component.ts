/**
 * Register Page Component.
 * Multi-field registration form for new farmers.
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
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="auth-page">
      <div class="auth-container animate-fade-in-up">
        <div class="auth-branding">
          <mat-icon class="brand-icon">eco</mat-icon>
          <h1>CropPredict</h1>
          <p>Join the smarter farming revolution</p>
        </div>

        <mat-card class="auth-card">
          <mat-card-header>
            <mat-card-title>Create Account</mat-card-title>
            <mat-card-subtitle>Register to get started</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="name" placeholder="Enter your full name" id="register-name" />
                <mat-icon matPrefix>person</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Mobile Number</mat-label>
                <input matInput formControlName="mobile" type="tel" placeholder="10-digit mobile" id="register-mobile" />
                <mat-icon matPrefix>phone</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email (Optional)</mat-label>
                <input matInput formControlName="email" type="email" placeholder="email@example.com" id="register-email" />
                <mat-icon matPrefix>email</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>District</mat-label>
                <mat-select formControlName="district" id="register-district">
                  @for (d of districts; track d) {
                    <mat-option [value]="d">{{ d }}</mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix>location_on</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Password</mat-label>
                <input
                  matInput
                  formControlName="password"
                  [type]="hidePassword() ? 'password' : 'text'"
                  placeholder="Min 6 characters"
                  id="register-password"
                />
                <mat-icon matPrefix>lock</mat-icon>
                <button mat-icon-button matSuffix type="button" (click)="hidePassword.set(!hidePassword())">
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>

              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="submit-btn"
                [disabled]="loading()"
                id="register-submit"
              >
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  Create Account
                }
              </button>
            </form>
          </mat-card-content>

          <mat-card-actions>
            <p class="auth-link">
              Already have an account?
              <a routerLink="/auth/login">Login here</a>
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

    .auth-container { width: 100%; max-width: 420px; }

    .auth-branding {
      text-align: center;
      margin-bottom: var(--space-6);
      color: white;

      .brand-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: var(--space-2); }
      h1 { font-size: var(--font-size-3xl); font-weight: 800; margin-bottom: var(--space-1); }
      p { opacity: 0.8; }
    }

    .auth-card {
      padding: var(--space-6) !important;
      border-radius: var(--radius-xl) !important;
      box-shadow: var(--shadow-xl) !important;
    }

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

  districts = [
    'Nashik', 'Pune', 'Nagpur', 'Aurangabad', 'Solapur',
    'Kolhapur', 'Sangli', 'Satara', 'Ahmednagar', 'Jalgaon',
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      mobile: ['', [Validators.required, Validators.minLength(10)]],
      email: [''],
      district: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.snackBar.open('Account created successfully! Please login.', 'Close', { duration: 3000 });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err.error?.error?.message || 'Registration failed. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      },
    });
  }
}
