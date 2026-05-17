/**
 * Farmer Profile Component.
 * View and edit farmer personal/farming information.
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../core/services/auth.service';
import { LanguageService } from '../core/services/language.service';
import { LanguageSelectorComponent } from '../shared/components/language-selector/language-selector.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatDividerModule,
    MatProgressSpinnerModule, TranslateModule, LanguageSelectorComponent,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>{{ 'PROFILE.TITLE' | translate }}</h1>
        <p>{{ 'PROFILE.SUBTITLE' | translate }}</p>
      </div>

      @if (loading()) {
        <div class="loading-state"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <div class="profile-grid">
          <!-- Personal Info -->
          <mat-card class="profile-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>person</mat-icon>
              <mat-card-title>{{ 'PROFILE.PERSONAL_INFO' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="profileForm">
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'AUTH.REGISTER.NAME' | translate }}</mat-label>
                  <input matInput formControlName="name" />
                  <mat-icon matPrefix>person</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{ 'AUTH.REGISTER.MOBILE' | translate }}</mat-label>
                  <input matInput [value]="authService.currentUser()?.mobile" disabled />
                  <mat-icon matPrefix>phone</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{ 'AUTH.REGISTER.EMAIL' | translate }}</mat-label>
                  <input matInput formControlName="email" type="email" />
                  <mat-icon matPrefix>email</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{ 'AUTH.REGISTER.STATE' | translate }}</mat-label>
                  <mat-select formControlName="state">
                    @for (s of states; track s) { <mat-option [value]="s">{{ s }}</mat-option> }
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{ 'AUTH.REGISTER.DISTRICT' | translate }}</mat-label>
                  <mat-select formControlName="district">
                    @for (d of districts; track d) { <mat-option [value]="d">{{ d }}</mat-option> }
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{ 'AUTH.REGISTER.VILLAGE' | translate }}</mat-label>
                  <input matInput formControlName="village" />
                  <mat-icon matPrefix>home</mat-icon>
                </mat-form-field>
              </form>
            </mat-card-content>
          </mat-card>

          <!-- Farming Info -->
          <mat-card class="profile-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>agriculture</mat-icon>
              <mat-card-title>{{ 'PROFILE.FARMING_INFO' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="profileForm">
                <mat-form-field appearance="outline">
                  <mat-label>{{ 'AUTH.REGISTER.PRIMARY_CROPS' | translate }}</mat-label>
                  <input matInput formControlName="primary_crops" />
                  <mat-icon matPrefix>grass</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>{{ 'AUTH.REGISTER.LAND_SIZE' | translate }}</mat-label>
                  <input matInput formControlName="land_size_acres" type="number" />
                  <mat-icon matPrefix>landscape</mat-icon>
                </mat-form-field>

                <mat-divider style="margin: 16px 0"></mat-divider>

                <h3>{{ 'PROFILE.LANGUAGE_PREF' | translate }}</h3>
                <app-language-selector mode="dropdown" [persistToServer]="true"></app-language-selector>
              </form>

              <button mat-raised-button color="primary" class="save-btn" (click)="saveProfile()" [disabled]="saving()">
                @if (saving()) { <mat-spinner diameter="20"></mat-spinner> }
                @else { <ng-container><mat-icon>save</mat-icon> {{ 'PROFILE.SAVE' | translate }}</ng-container> }
              </button>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: var(--space-6); }
    .profile-card { padding: var(--space-6) !important; }
    .profile-card mat-form-field { width: 100%; margin-bottom: var(--space-1); }
    .save-btn { width: 100%; height: 48px; margin-top: var(--space-4); font-size: var(--font-size-base); }
    .loading-state { display: flex; justify-content: center; padding: var(--space-16); }
    h3 { font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-2); color: var(--color-text-secondary); }
    @media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } }
  `],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  loading = signal(true);
  saving = signal(false);

  states = ['Maharashtra', 'Karnataka', 'Madhya Pradesh', 'Gujarat', 'Rajasthan'];
  districts = ['Nashik', 'Pune', 'Nagpur', 'Aurangabad', 'Solapur', 'Kolhapur', 'Sangli', 'Satara', 'Ahmednagar', 'Jalgaon'];

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [''],
      state: ['Maharashtra'],
      district: [''],
      village: [''],
      primary_crops: [''],
      land_size_acres: [null],
    });
  }

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          state: user.state,
          district: user.district,
          village: user.village,
          primary_crops: user.primary_crops,
          land_size_acres: user.land_size_acres,
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  saveProfile(): void {
    this.saving.set(true);
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.saving.set(false);
        this.translate.get('PROFILE.SAVED').subscribe(msg => this.snackBar.open(msg, '✕', { duration: 3000 }));
      },
      error: () => {
        this.saving.set(false);
        this.translate.get('COMMON.ERROR').subscribe(msg => this.snackBar.open(msg, '✕', { duration: 5000 }));
      },
    });
  }
}
