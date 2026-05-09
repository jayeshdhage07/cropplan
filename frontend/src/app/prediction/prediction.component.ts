import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { PredictionService, PredictionResult, CropRecommendation } from '../core/services/prediction.service';

@Component({
  selector: 'app-prediction',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatDividerModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Predictions & Recommendations</h1>
        <p>Get AI-powered crop price predictions and personalized recommendations</p>
      </div>

      <!-- Prediction Form -->
      <mat-card class="prediction-form-card">
        <mat-card-header><mat-card-title>Price Prediction</mat-card-title></mat-card-header>
        <mat-card-content>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Crop</mat-label>
              <mat-select [(ngModel)]="selectedCrop">
                @for (c of cropOptions; track c) { <mat-option [value]="c">{{ c }}</mat-option> }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>District</mat-label>
              <mat-select [(ngModel)]="selectedDistrict">
                @for (d of districtOptions; track d) { <mat-option [value]="d">{{ d }}</mat-option> }
              </mat-select>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="getPrediction()" [disabled]="loading()" class="predict-btn">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <ng-container>
                  <mat-icon>insights</mat-icon>
                  Get Prediction
                </ng-container>
              }
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Prediction Result -->
      @if (prediction()) {
        <mat-card class="result-card animate-fade-in-up">
          <mat-card-header>
            <mat-card-title>{{ prediction()!.crop }} - {{ prediction()!.district }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="result-grid">
              <div class="result-item">
                <div class="result-value">₹{{ prediction()!.predicted_price }}</div>
                <div class="result-label">Predicted Price / Quintal</div>
              </div>
              <div class="result-item">
                <div class="result-value" [class]="'trend-' + prediction()!.trend.toLowerCase()">
                  <mat-icon>{{ prediction()!.trend === 'UP' ? 'trending_up' : prediction()!.trend === 'DOWN' ? 'trending_down' : 'trending_flat' }}</mat-icon>
                  {{ prediction()!.trend }}
                </div>
                <div class="result-label">Price Trend</div>
              </div>
              <div class="result-item">
                <div class="result-value">{{ prediction()!.confidence }}%</div>
                <div class="result-label">Confidence Score</div>
              </div>
            </div>
            @if (prediction()!.recommendation) {
              <mat-divider style="margin:16px 0"></mat-divider>
              <p class="recommendation-text"><mat-icon>lightbulb</mat-icon> {{ prediction()!.recommendation }}</p>
            }
          </mat-card-content>
        </mat-card>
      }

      <!-- Recommendations Section -->
      <div style="margin-top:32px">
        <h2 class="section-title">Crop Recommendations</h2>
        <div class="form-row" style="margin-bottom:16px">
          <mat-form-field appearance="outline" style="width:250px">
            <mat-label>District</mat-label>
            <mat-select [(ngModel)]="recDistrict">
              @for (d of districtOptions; track d) { <mat-option [value]="d">{{ d }}</mat-option> }
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="accent" (click)="getRecommendations()">
            <mat-icon>recommend</mat-icon> Get Recommendations
          </button>
        </div>
        @if (recommendations().length) {
          <div class="card-grid">
            @for (rec of recommendations(); track rec.crop_name) {
              <mat-card class="rec-card">
                <div class="rec-header">
                  <span class="rec-score">{{ rec.recommendation_score | number:'1.0-0' }}</span>
                  <div>
                    <h3>{{ rec.crop_name }}</h3>
                    <span class="trend-badge" [class]="'trend-' + rec.trend.toLowerCase()">{{ rec.trend }}</span>
                  </div>
                </div>
                <p>₹{{ rec.predicted_price | number:'1.0-0' }}/quintal · {{ rec.confidence }}% confidence</p>
                <p class="rec-reason">{{ rec.reason }}</p>
              </mat-card>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .prediction-form-card { padding: 24px !important; margin-bottom: 24px; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-start; }
    .form-row mat-form-field { flex: 1; min-width: 200px; }
    .predict-btn { height: 56px; min-width: 180px; }
    .result-card { padding: 24px !important; margin-bottom: 24px; border-left: 4px solid var(--color-primary); }
    .result-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 24px; }
    .result-item { text-align: center; }
    .result-value { font-size: 1.75rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 4px; }
    .result-label { font-size: 0.8rem; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin-top: 4px; }
    .recommendation-text { display: flex; align-items: flex-start; gap: 8px; color: var(--color-text-secondary); mat-icon { color: var(--color-accent); flex-shrink: 0; } }
    .section-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 16px; }
    .rec-card { padding: 20px !important; }
    .rec-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; h3 { font-weight: 700; margin: 0; } }
    .rec-score { width: 48px; height: 48px; border-radius: 50%; background: var(--gradient-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; }
    .rec-reason { color: var(--color-text-secondary); font-size: 0.85rem; margin-top: 8px; }
    .trend-badge { font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 12px; }
    .trend-up { color: var(--color-success); }
    .trend-down { color: var(--color-danger); }
    .trend-stable { color: var(--color-info); }
  `],
})
export class PredictionComponent {
  selectedCrop = 'Onion';
  selectedDistrict = 'Nashik';
  recDistrict = 'Nashik';
  loading = signal(false);
  prediction = signal<PredictionResult | null>(null);
  recommendations = signal<CropRecommendation[]>([]);
  cropOptions = ['Onion', 'Tomato', 'Wheat'];
  districtOptions = ['Nashik', 'Pune', 'Nagpur', 'Aurangabad', 'Solapur'];

  constructor(private predictionService: PredictionService) {}

  getPrediction(): void {
    this.loading.set(true);
    this.predictionService.getPrediction(this.selectedCrop, this.selectedDistrict).subscribe({
      next: (r) => { this.prediction.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getRecommendations(): void {
    this.predictionService.getRecommendations(this.recDistrict).subscribe({
      next: (r) => this.recommendations.set(r),
    });
  }
}
