/**
 * Farmer-Centric Dashboard Component.
 * Optimized with weather updates, quick actions grid, priority warnings,
 * crop list cards, and responsive ChartJS price trends.
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
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
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    TranslateModule,
    ChartComponent,
  ],
  template: `
    <div class="page-container animate-fade-in-up">
      <!-- Welcome Header -->
      <div class="page-header header-with-avatar">
        <div class="header-text-block">
          <h1>{{ 'DASHBOARD.TITLE' | translate }}</h1>
          <p>{{ 'DASHBOARD.WELCOME_MESSAGE' | translate:{ name: authService.currentUser()?.name } }}</p>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="46" color="primary"></mat-spinner>
          <p>{{ 'DASHBOARD.LOADING' | translate }}</p>
        </div>
      } @else {
        <!-- Interactive Farming Alerts Panel (Weather & Market Drops) -->
        <div class="alert-banner warning animate-fade-in-up" *ngIf="hasAlerts()">
          <mat-icon class="alert-icon">warning</mat-icon>
          <div class="alert-content">
            <h4>{{ 'DASHBOARD.ALERT_WARNING_TITLE' | translate }}</h4>
            <p>{{ 'DASHBOARD.ALERT_WARNING_DESC' | translate }}</p>
          </div>
        </div>

        <!-- Upper Grid: Weather Widget & Quick Action Cards -->
        <div class="dashboard-upper-grid">
          <!-- Glassmorphic Agriculture Weather Card -->
          <div class="weather-widget animate-fade-in-up" style="animation-delay: 0.05s">
            <div class="weather-header">
              <span class="weather-location">
                <mat-icon style="font-size: 16px; width: 16px; height: 16px; vertical-align: middle;">location_on</mat-icon>
                {{ authService.currentUser()?.district || 'Solapur' }}, {{ authService.currentUser()?.state || 'Maharashtra' }}
              </span>
              <mat-icon class="weather-icon">wb_sunny</mat-icon>
            </div>
            
            <div class="weather-body">
              <div class="temperature">31°C</div>
              <div class="weather-condition">
                <span class="condition">Sunny & Warm</span>
                <span class="desc">Perfect humidity for sowing seeds</span>
              </div>
            </div>

            <div class="weather-footer">
              <div class="metric">
                <span class="metric-val">62%</span>
                <span class="metric-label">Humidity</span>
              </div>
              <div class="metric">
                <span class="metric-val">12 km/h</span>
                <span class="metric-label">Wind</span>
              </div>
              <div class="metric">
                <span class="metric-val">15%</span>
                <span class="metric-label">Rain Prob.</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions Grid for low tech users -->
          <div class="quick-actions-card animate-fade-in-up" style="animation-delay: 0.1s">
            <h3>{{ 'DASHBOARD.QUICK_ACTIONS' | translate }}</h3>
            <div class="quick-actions-grid">
              <div class="quick-action-btn" routerLink="/predictions">
                <div class="action-icon-wrapper" style="background-color: var(--color-primary-50); color: var(--color-primary);">
                  <mat-icon>online_prediction</mat-icon>
                </div>
                <h4>{{ 'NAV.PREDICTIONS' | translate }}</h4>
                <p>{{ 'DASHBOARD.ACTION_PREDICT_SUB' | translate }}</p>
              </div>

              <div class="quick-action-btn" routerLink="/profit-estimator">
                <div class="action-icon-wrapper" style="background-color: var(--color-accent-50); color: var(--color-accent);">
                  <mat-icon>calculate</mat-icon>
                </div>
                <h4>{{ 'NAV.PROFIT_ESTIMATOR' | translate }}</h4>
                <p>{{ 'DASHBOARD.ACTION_PROFIT_SUB' | translate }}</p>
              </div>

              <div class="quick-action-btn" routerLink="/crops">
                <div class="action-icon-wrapper" style="background-color: #eff6ff; color: #3b82f6;">
                  <mat-icon>grass</mat-icon>
                </div>
                <h4>{{ 'NAV.CROP_TRENDS' | translate }}</h4>
                <p>{{ 'DASHBOARD.ACTION_TRENDS_SUB' | translate }}</p>
              </div>

              <div class="quick-action-btn" routerLink="/profile">
                <div class="action-icon-wrapper" style="background-color: #f5f3ff; color: #8b5cf6;">
                  <mat-icon>person</mat-icon>
                </div>
                <h4>{{ 'NAV.PROFILE' | translate }}</h4>
                <p>{{ 'DASHBOARD.ACTION_PROFILE_SUB' | translate }}</p>
              </div>
            </div>
          </div>
        </div>


        <!-- Middle Stats Counter Grid -->
        <div class="stats-overview-grid">
          <div class="stat-card animate-fade-in-up" style="animation-delay: 0.15s">
            <div class="stat-icon-wrapper" style="background: var(--color-primary-50); color: var(--color-primary);">
              <mat-icon>agriculture</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ crops().length }}</div>
              <div class="stat-label">{{ 'DASHBOARD.TRACKED_CROPS' | translate }}</div>
            </div>
          </div>

          <div class="stat-card animate-fade-in-up" style="animation-delay: 0.2s">
            <div class="stat-icon-wrapper" style="background: rgba(59, 130, 246, 0.08); color: #3b82f6;">
              <mat-icon>store</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ districts().length }}</div>
              <div class="stat-label">{{ 'DASHBOARD.ACTIVE_MANDIS' | translate }}</div>
            </div>
          </div>

          <div class="stat-card animate-fade-in-up" style="animation-delay: 0.25s">
            <div class="stat-icon-wrapper" style="background: var(--color-accent-50); color: var(--color-accent);">
              <mat-icon>timeline</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">3+</div>
              <div class="stat-label">{{ 'DASHBOARD.YEARS_DATA' | translate }}</div>
            </div>
          </div>

          <div class="stat-card animate-fade-in-up" style="animation-delay: 0.3s">
            <div class="stat-icon-wrapper" style="background: var(--color-primary-50); color: var(--color-success);">
              <mat-icon>insights</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ 'DASHBOARD.LIVE' | translate }}</div>
              <div class="stat-label">{{ 'DASHBOARD.PREDICTIONS_STATUS' | translate }}</div>
            </div>
          </div>
        </div>

        <!-- Bottom Grid: Trends Chart & Crop Grid -->
        <div class="dashboard-main-grid">
          <!-- Mandi Price Trends Chart Card -->
          <mat-card class="chart-card animate-fade-in-up" style="animation-delay: 0.35s">
            <mat-card-header>
              <mat-card-title>{{ 'DASHBOARD.TREND_TITLE' | translate }}</mat-card-title>
              <mat-card-subtitle>{{ 'DASHBOARD.TREND_SUBTITLE' | translate }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content class="chart-content">
              @if (trendLabels().length > 0) {
                <app-chart type="line" [labels]="trendLabels()" [datasets]="trendDatasets()" height="320px"></app-chart>
              } @else {
                <div class="empty-chart">
                  <mat-icon>show_chart</mat-icon>
                  <p>{{ 'DASHBOARD.NO_TREND_DATA' | translate }}</p>
                </div>
              }
            </mat-card-content>
          </mat-card>

          <!-- Agriculture Advisories Card -->
          <mat-card class="advisory-card animate-fade-in-up" style="animation-delay: 0.4s">
            <mat-card-header>
              <mat-card-title>Weekly Farming Advisory</mat-card-title>
              <mat-card-subtitle>Expert recommendations for {{ authService.currentUser()?.district || 'Solapur' }} region</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="advisory-list">
                <div class="advisory-item">
                  <mat-icon class="advisory-bullet">tips_and_updates</mat-icon>
                  <div class="advisory-text">
                    <strong>Crop Rotation:</strong> Consider sowing pulses or legumes after rice harvest to restore nitrogen levels naturally and cut fertilizer costs by 20%.
                  </div>
                </div>
                <mat-divider></mat-divider>
                <div class="advisory-item">
                  <mat-icon class="advisory-bullet">water_drop</mat-icon>
                  <div class="advisory-text">
                    <strong>Drip Irrigation:</strong> For onion crops in Pune, utilize drip systems between 6 AM and 9 AM to reduce water wastage and boost yield size.
                  </div>
                </div>
                <mat-divider></mat-divider>
                <div class="advisory-item">
                  <mat-icon class="advisory-bullet">bug_report</mat-icon>
                  <div class="advisory-text">
                    <strong>Organic Pest Control:</strong> Spray neem-oil mix (10ml per litre of water) to protect young tomato leaves from thrips and whiteflies safely.
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Crops Section Title -->
        <div class="section-heading-container animate-fade-in-up" style="animation-delay: 0.45s">
          <h2 class="section-title">{{ 'DASHBOARD.TRACKED_CROPS' | translate }}</h2>
          <span class="badge-tag">{{ crops().length }} Available</span>
        </div>

        <!-- Crops Cards Grid -->
        <div class="card-grid animate-fade-in-up" style="animation-delay: 0.5s">
          @for (crop of crops(); track crop.id) {
            <mat-card class="crop-card" [routerLink]="['/crops', crop.id]">
              <mat-card-header class="crop-card-header">
                <div class="crop-icon-avatar">
                  <mat-icon>grass</mat-icon>
                </div>
                <div class="crop-header-titles">
                  <mat-card-title>{{ crop.name }}</mat-card-title>
                  <mat-card-subtitle>{{ crop.season }} {{ 'DASHBOARD.SEASON' | translate }}</mat-card-subtitle>
                </div>
              </mat-card-header>
              <mat-card-content class="crop-card-content">
                <p class="crop-desc">{{ crop.description || ('CROPS.DEFAULT_DESC' | translate) }}</p>
                <div class="crop-details-stats">
                  <div class="crop-detail-stat">
                    <span class="stat-num">{{ crop.average_growth_days || '–' }}</span>
                    <span class="stat-txt">{{ 'DASHBOARD.DAYS' | translate }}</span>
                  </div>
                  <div class="crop-detail-stat">
                    <span class="stat-num">Medium</span>
                    <span class="stat-txt">Water Need</span>
                  </div>
                </div>
              </mat-card-content>
              <mat-card-actions class="crop-card-actions">
                <button mat-button color="primary" class="view-details-btn">
                  {{ 'DASHBOARD.VIEW_DETAILS' | translate }}
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    /* ---------- Farmer-Centric Dashboard Grid Styles ---------- */
    
    .header-with-avatar {
      margin-bottom: var(--space-6);
    }
    
    /* Weather & Quick Actions Upper Grid */
    .dashboard-upper-grid {
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: var(--space-6);
      margin-bottom: var(--space-6);
      
      @media (max-width: 992px) {
        grid-template-columns: 1fr;
      }
    }
    
    /* Quick Actions panel styling */
    .quick-actions-card {
      background-color: var(--color-bg-card);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      padding: var(--space-6);
      box-shadow: var(--shadow-md);
      display: flex;
      flex-direction: column;
      
      h3 {
        font-size: var(--font-size-lg);
        font-weight: 700;
        margin-bottom: var(--space-4);
      }
    }
    
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-4);
      flex: 1;
      
      @media (max-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    /* Stat cards counters grid */
    .stats-overview-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-6);
      margin-bottom: var(--space-6);
      
      @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-4);
      }
      
      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }
    
    /* Main Layout Grid (Chart & Advisories) */
    .dashboard-main-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: var(--space-6);
      margin-bottom: var(--space-8);
      
      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }
    
    .chart-card {
      padding: 0 !important;
      display: flex;
      flex-direction: column;
      
      .chart-content {
        padding: var(--space-5) !important;
        flex: 1;
      }
    }
    
    /* Advisory card styling */
    .advisory-card {
      background-color: var(--color-bg-card);
      border: 1px solid var(--color-border);
      
      .advisory-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        padding-top: var(--space-2);
      }
      
      .advisory-item {
        display: flex;
        gap: var(--space-3);
        align-items: flex-start;
        padding: var(--space-2) 0;
      }
      
      .advisory-bullet {
        color: var(--color-primary);
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        margin-top: 2px;
      }
      
      .advisory-text {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        line-height: 1.5;
        
        strong {
          color: var(--color-text-primary);
        }
      }
    }
    
    /* Crop Section Heading */
    .section-heading-container {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
      
      .section-title {
        font-size: var(--font-size-xl);
        font-weight: 800;
        color: var(--color-text-primary);
      }
      
      .badge-tag {
        font-size: var(--font-size-xs);
        font-weight: 700;
        color: var(--color-primary-dark);
        background-color: var(--color-primary-100);
        padding: 4px 10px;
        border-radius: var(--radius-full);
      }
    }
    
    /* Enhanced Crop Cards Design */
    .crop-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      
      .crop-card-header {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-5) var(--space-5) var(--space-2) !important;
        
        .crop-icon-avatar {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background-color: var(--color-primary-50);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          
          mat-icon {
            font-size: 22px;
            width: 22px;
            height: 22px;
          }
        }
        
        .crop-header-titles {
          display: flex;
          flex-direction: column;
          
          mat-card-title {
            font-size: var(--font-size-lg);
            font-weight: 700;
            color: var(--color-text-primary);
          }
          
          mat-card-subtitle {
            font-size: var(--font-size-xs);
            color: var(--color-text-light);
          }
        }
      }
      
      .crop-card-content {
        padding: var(--space-3) var(--space-5) var(--space-4) !important;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        
        .crop-desc {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          line-height: 1.5;
          margin-bottom: var(--space-4);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .crop-details-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          background-color: var(--color-bg);
          border-radius: var(--radius-md);
          padding: var(--space-3);
          gap: var(--space-2);
          
          .crop-detail-stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            
            .stat-num {
              font-size: var(--font-size-base);
              font-weight: 700;
              color: var(--color-primary-dark);
            }
            
            .stat-txt {
              font-size: 0.7rem;
              color: var(--color-text-muted);
              text-transform: uppercase;
              font-weight: 600;
            }
          }
        }
      }
      
      .crop-card-actions {
        padding: 0 var(--space-5) var(--space-5) !important;
        
        .view-details-btn {
          width: 100%;
          height: 40px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          font-weight: 600;
          font-size: var(--font-size-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          transition: all var(--transition-fast);
          
          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
            transition: transform var(--transition-fast);
          }
          
          &:hover {
            border-color: var(--color-primary);
            color: var(--color-primary);
            background-color: var(--color-primary-50);
            
            mat-icon {
              transform: translateX(4px);
            }
          }
        }
      }
      
      &:hover {
        border-color: var(--color-primary-200);
      }
    }

    .empty-chart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 240px;
      color: var(--color-text-light);
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: var(--space-3);
      }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 360px;
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

  hasAlerts = computed(() => {
    // Show alerts for demo or based on district
    const userDistrict = this.authService.currentUser()?.district;
    return !!userDistrict; // Show alert banner if user has a district
  });

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
            { label: 'Avg Modal Price (₹/quintal)', data: trends.map((t) => t.avg_modal_price), borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.08)', fill: true, tension: 0.4 },
            { label: 'Avg Max Price', data: trends.map((t) => t.avg_max_price), borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.04)', fill: false, tension: 0.4 },
          ]);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
