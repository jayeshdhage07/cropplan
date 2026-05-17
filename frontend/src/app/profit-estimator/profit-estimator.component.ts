/**
 * Profit Estimator Component.
 * Calculates estimated profit based on costs and predicted market prices.
 */

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { PredictionService, ProfitResult } from '../core/services/prediction.service';

@Component({
  selector: 'app-profit-estimator',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatDividerModule, TranslateModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>{{ 'PROFIT.TITLE' | translate }}</h1>
        <p>{{ 'PROFIT.SUBTITLE' | translate }}</p>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'PROFIT.CROP_LABEL' | translate }}</mat-label>
              <mat-select [(ngModel)]="crop">
                @for (c of cropOptions; track c) { <mat-option [value]="c">{{ c }}</mat-option> }
              </mat-select>
              <mat-icon matPrefix>grass</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'PROFIT.SEED_COST' | translate }}</mat-label>
              <input matInput type="number" [(ngModel)]="seedCost" />
              <mat-icon matPrefix>spa</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'PROFIT.FERTILIZER_COST' | translate }}</mat-label>
              <input matInput type="number" [(ngModel)]="fertilizerCost" />
              <mat-icon matPrefix>science</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'PROFIT.LABOUR_COST' | translate }}</mat-label>
              <input matInput type="number" [(ngModel)]="labourCost" />
              <mat-icon matPrefix>engineering</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'PROFIT.IRRIGATION_COST' | translate }}</mat-label>
              <input matInput type="number" [(ngModel)]="irrigationCost" />
              <mat-icon matPrefix>water_drop</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ 'PROFIT.LAND_SIZE' | translate }}</mat-label>
              <input matInput type="number" [(ngModel)]="landSize" />
              <mat-icon matPrefix>landscape</mat-icon>
            </mat-form-field>
          </div>

          <button mat-raised-button color="primary" class="calc-btn" (click)="calculate()" [disabled]="loading()">
            @if (loading()) { <mat-spinner diameter="20"></mat-spinner> }
            @else { <ng-container><mat-icon>calculate</mat-icon> {{ 'PROFIT.CALCULATE' | translate }}</ng-container> }
          </button>
        </mat-card-content>
      </mat-card>

      @if (result()) {
        <mat-card class="result-card animate-fade-in-up">
          <mat-card-header>
            <mat-card-title>{{ 'PROFIT.RESULT_TITLE' | translate }} — {{ result()!.crop }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="result-grid">
              <div class="result-item">
                <div class="result-value cost">₹{{ result()!.total_cost | number:'1.0-0' }}</div>
                <div class="result-label">{{ 'PROFIT.TOTAL_COST' | translate }}</div>
              </div>
              <div class="result-item">
                <div class="result-value revenue">₹{{ result()!.expected_revenue | number:'1.0-0' }}</div>
                <div class="result-label">{{ 'PROFIT.EXPECTED_REVENUE' | translate }}</div>
              </div>
              <div class="result-item">
                <div class="result-value" [class.profit]="result()!.estimated_profit > 0" [class.loss]="result()!.estimated_profit < 0">
                  ₹{{ result()!.estimated_profit | number:'1.0-0' }}
                </div>
                <div class="result-label">{{ 'PROFIT.ESTIMATED_PROFIT' | translate }}</div>
              </div>
              <div class="result-item">
                <div class="result-value">{{ result()!.profit_margin_percent }}%</div>
                <div class="result-label">{{ 'PROFIT.PROFIT_MARGIN' | translate }}</div>
              </div>
              <div class="result-item">
                <div class="result-value">₹{{ result()!.predicted_price_per_quintal | number:'1.0-0' }}</div>
                <div class="result-label">{{ 'PROFIT.PRICE_PER_QUINTAL' | translate }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .form-card { padding: var(--space-6) !important; margin-bottom: var(--space-6); }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: var(--space-4); }
    .calc-btn { width: 100%; height: 56px; font-size: var(--font-size-lg); margin-top: var(--space-4); }
    .result-card { padding: var(--space-6) !important; border-left: 4px solid var(--color-primary); }
    .result-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-6); margin-top: var(--space-4); }
    .result-item { text-align: center; }
    .result-value { font-size: 1.75rem; font-weight: 800; }
    .result-label { font-size: 0.8rem; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin-top: 4px; }
    .cost { color: var(--color-danger); }
    .revenue { color: var(--color-info); }
    .profit { color: var(--color-success); }
    .loss { color: var(--color-danger); }
  `],
})
export class ProfitEstimatorComponent {
  crop = 'Onion';
  seedCost = 5000;
  fertilizerCost = 3000;
  labourCost = 8000;
  irrigationCost = 2000;
  landSize = 2;
  loading = signal(false);
  result = signal<ProfitResult | null>(null);

  cropOptions = ['Onion', 'Tomato', 'Wheat'];

  constructor(private predictionService: PredictionService) {}

  calculate(): void {
    this.loading.set(true);
    this.predictionService.calculateProfit({
      crop: this.crop,
      seed_cost: this.seedCost,
      fertilizer_cost: this.fertilizerCost,
      labour_cost: this.labourCost,
      irrigation_cost: this.irrigationCost,
      land_size_acres: this.landSize,
    }).subscribe({
      next: (r) => { this.result.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
