/**
 * Dashboard Component.
 * Main landing page with translated labels and farmer-friendly overview.
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { ChartComponent, ChartDataset } from '../shared/components/chart/chart.component';
import { CropService, Crop } from '../core/services/crop.service';
import { MandiService, MandiTrend } from '../core/services/mandi.service';
import { AuthService } from '../core/services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatIconModule,
    MatButtonModule, MatProgressSpinnerModule, TranslateModule, ChartComponent,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>{{ 'DASHBOARD.TITLE' | translate }}</h1>
        <p>{{ 'DASHBOARD.WELCOME_MESSAGE' | translate:{ name: authService.currentUser()?.name } }}</p>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>{{ 'DASHBOARD.LOADING' | translate }}</p>
        </div>
      } @else {
        <div class="card-grid stats-grid">
          <div class="stat-card animate-fade-in-up">
            <div class="stat-icon-wrapper" style="background: rgba(13, 158, 110, 0.1)">
              <mat-icon style="color: var(--color-primary)">grass</mat-icon>
            </div>
            <div class="stat-value">{{ crops().length }}</div>
            <div class="stat-label">{{ 'DASHBOARD.TRACKED_CROPS' | translate }}</div>
          </div>

          <div class="stat-card animate-fade-in-up" style="animation-delay: 0.1s">
            <div class="stat-icon-wrapper" style="background: rgba(59, 130, 246, 0.1)">
              <mat-icon style="color: var(--color-info)">store</mat-icon>
            </div>
            <div class="stat-value">{{ districts().length }}</div>
            <div class="stat-label">{{ 'DASHBOARD.ACTIVE_MANDIS' | translate }}</div>
          </div>

          <div class="stat-card animate-fade-in-up" style="animation-delay: 0.2s">
            <div class="stat-icon-wrapper" style="background: rgba(245, 158, 11, 0.1)">
              <mat-icon style="color: var(--color-accent)">trending_up</mat-icon>
            </div>
            <div class="stat-value">3+</div>
            <div class="stat-label">{{ 'DASHBOARD.YEARS_DATA' | translate }}</div>
          </div>

          <div class="stat-card animate-fade-in-up" style="animation-delay: 0.3s">
            <div class="stat-icon-wrapper" style="background: rgba(16, 185, 129, 0.1)">
              <mat-icon style="color: var(--color-success)">insights</mat-icon>
            </div>
            <div class="stat-value">{{ 'DASHBOARD.LIVE' | translate }}</div>
            <div class="stat-label">{{ 'DASHBOARD.PREDICTIONS_STATUS' | translate }}</div>
          </div>
        </div>

        <div class="charts-section">
          <mat-card class="chart-card animate-fade-in-up" style="animation-delay: 0.4s">
            <mat-card-header>
              <mat-card-title>{{ 'DASHBOARD.TREND_TITLE' | translate }}</mat-card-title>
              <mat-card-subtitle>{{ 'DASHBOARD.TREND_SUBTITLE' | translate }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              @if (trendLabels().length > 0) {
                <app-chart type="line" [labels]="trendLabels()" [datasets]="trendDatasets()" height="350px"></app-chart>
              } @else {
                <div class="empty-chart">
                  <mat-icon>show_chart</mat-icon>
                  <p>{{ 'DASHBOARD.NO_TREND_DATA' | translate }}</p>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <h2 class="section-title">{{ 'DASHBOARD.TRACKED_CROPS' | translate }}</h2>
        <div class="card-grid">
          @for (crop of crops(); track crop.id) {
            <mat-card class="crop-card animate-fade-in-up" [routerLink]="['/crops', crop.id]">
              <mat-card-header>
                <mat-icon mat-card-avatar class="crop-icon">eco</mat-icon>
                <mat-card-title>{{ crop.name }}</mat-card-title>
                <mat-card-subtitle>{{ crop.season }} {{ 'DASHBOARD.SEASON' | translate }} · {{ crop.average_growth_days || '–' }} {{ 'DASHBOARD.DAYS' | translate }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p class="crop-desc">{{ crop.description || ('CROPS.DEFAULT_DESC' | translate) }}</p>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button color="primary">
                  <mat-icon>arrow_forward</mat-icon> {{ 'DASHBOARD.VIEW_DETAILS' | translate }}
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .stats-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); margin-bottom: var(--space-8); }
    .stat-icon-wrapper { width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-4); mat-icon { font-size: 24px; } }
    .charts-section { margin-bottom: var(--space-8); }
    .chart-card { padding: var(--space-6) !important; }
    .section-title { font-size: var(--font-size-xl); font-weight: 700; margin-bottom: var(--space-4); color: var(--color-text-primary); }
    .crop-card { cursor: pointer; .crop-icon { color: var(--color-primary); font-size: 24px; } .crop-desc { color: var(--color-text-secondary); font-size: var(--font-size-sm); margin-top: var(--space-2); } }
    .empty-chart { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; color: var(--color-text-muted); mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: var(--space-4); } }
    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; gap: var(--space-4); color: var(--color-text-secondary); }
  `],
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  crops = signal<Crop[]>([]);
  districts = signal<string[]>([]);
  trendLabels = signal<string[]>([]);
  trendDatasets = signal<ChartDataset[]>([]);

  constructor(
    public authService: AuthService,
    private cropService: CropService,
    private mandiService: MandiService
  ) {}

  ngOnInit(): void {
    forkJoin({
      crops: this.cropService.getAll(),
      districts: this.mandiService.getDistricts(),
      trends: this.mandiService.getTrends('onion'),
    }).subscribe({
      next: ({ crops, districts, trends }) => {
        this.crops.set(crops.items);
        this.districts.set(districts);
        if (trends.length > 0) {
          this.trendLabels.set(trends.map((t) => `${t.month} ${t.year}`));
          this.trendDatasets.set([
            { label: 'Avg Modal Price (₹/quintal)', data: trends.map((t) => t.avg_modal_price), borderColor: '#0d9e6e', backgroundColor: 'rgba(13, 158, 110, 0.1)', fill: true, tension: 0.4 },
            { label: 'Avg Max Price', data: trends.map((t) => t.avg_max_price), borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.05)', fill: false, tension: 0.4 },
          ]);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
