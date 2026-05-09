/**
 * Dashboard Component.
 * Main landing page showing overview stats, crop trends, and predictions.
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChartComponent, ChartDataset } from '../shared/components/chart/chart.component';
import { CropService, Crop } from '../core/services/crop.service';
import { MandiService, MandiTrend } from '../core/services/mandi.service';
import { AuthService } from '../core/services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ChartComponent,
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {{ authService.currentUser()?.name }}. Here's your farming overview.</p>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading dashboard data...</p>
        </div>
      } @else {
        <!-- Stats Cards -->
        <div class="card-grid stats-grid">
          <div class="stat-card animate-fade-in-up">
            <div class="stat-icon-wrapper" style="background: rgba(13, 158, 110, 0.1)">
              <mat-icon style="color: var(--color-primary)">grass</mat-icon>
            </div>
            <div class="stat-value">{{ crops().length }}</div>
            <div class="stat-label">Tracked Crops</div>
          </div>

          <div class="stat-card animate-fade-in-up" style="animation-delay: 0.1s">
            <div class="stat-icon-wrapper" style="background: rgba(59, 130, 246, 0.1)">
              <mat-icon style="color: var(--color-info)">store</mat-icon>
            </div>
            <div class="stat-value">{{ districts().length }}</div>
            <div class="stat-label">Active Mandis</div>
          </div>

          <div class="stat-card animate-fade-in-up" style="animation-delay: 0.2s">
            <div class="stat-icon-wrapper" style="background: rgba(245, 158, 11, 0.1)">
              <mat-icon style="color: var(--color-accent)">trending_up</mat-icon>
            </div>
            <div class="stat-value">3+</div>
            <div class="stat-label">Years of Data</div>
          </div>

          <div class="stat-card animate-fade-in-up" style="animation-delay: 0.3s">
            <div class="stat-icon-wrapper" style="background: rgba(16, 185, 129, 0.1)">
              <mat-icon style="color: var(--color-success)">insights</mat-icon>
            </div>
            <div class="stat-value">Live</div>
            <div class="stat-label">Predictions</div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <mat-card class="chart-card animate-fade-in-up" style="animation-delay: 0.4s">
            <mat-card-header>
              <mat-card-title>Price Trends - Onion (Maharashtra)</mat-card-title>
              <mat-card-subtitle>Monthly average modal prices</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              @if (trendLabels().length > 0) {
                <app-chart
                  type="line"
                  [labels]="trendLabels()"
                  [datasets]="trendDatasets()"
                  height="350px"
                ></app-chart>
              } @else {
                <div class="empty-chart">
                  <mat-icon>show_chart</mat-icon>
                  <p>No trend data available yet. Import mandi data to see charts.</p>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Crops Quick Access -->
        <h2 class="section-title">Tracked Crops</h2>
        <div class="card-grid">
          @for (crop of crops(); track crop.id) {
            <mat-card class="crop-card animate-fade-in-up" [routerLink]="['/crops', crop.id]">
              <mat-card-header>
                <mat-icon mat-card-avatar class="crop-icon">eco</mat-icon>
                <mat-card-title>{{ crop.name }}</mat-card-title>
                <mat-card-subtitle>{{ crop.season }} Season · {{ crop.average_growth_days || '–' }} days</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p class="crop-desc">{{ crop.description || 'View trends, predictions, and market data for this crop.' }}</p>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button color="primary">
                  <mat-icon>arrow_forward</mat-icon> View Details
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .stats-grid {
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      margin-bottom: var(--space-8);
    }

    .stat-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);

      mat-icon { font-size: 24px; }
    }

    .charts-section {
      margin-bottom: var(--space-8);
    }

    .chart-card {
      padding: var(--space-6) !important;
    }

    .section-title {
      font-size: var(--font-size-xl);
      font-weight: 700;
      margin-bottom: var(--space-4);
      color: var(--color-text-primary);
    }

    .crop-card {
      cursor: pointer;

      .crop-icon {
        color: var(--color-primary);
        font-size: 24px;
      }

      .crop-desc {
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
        margin-top: var(--space-2);
      }
    }

    .empty-chart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--color-text-muted);

      mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: var(--space-4); }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      gap: var(--space-4);
      color: var(--color-text-secondary);
    }
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
            {
              label: 'Avg Modal Price (₹/quintal)',
              data: trends.map((t) => t.avg_modal_price),
              borderColor: '#0d9e6e',
              backgroundColor: 'rgba(13, 158, 110, 0.1)',
              fill: true,
              tension: 0.4,
            },
            {
              label: 'Avg Max Price',
              data: trends.map((t) => t.avg_max_price),
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.05)',
              fill: false,
              tension: 0.4,
            },
          ]);
        }

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
