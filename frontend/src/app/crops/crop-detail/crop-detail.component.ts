import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ChartComponent, ChartDataset } from '../../shared/components/chart/chart.component';
import { CropService, Crop } from '../../core/services/crop.service';
import { MandiService, MandiPrice } from '../../core/services/mandi.service';

@Component({
  selector: 'app-crop-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    TranslateModule,
    ChartComponent,
  ],
  template: `
    <div class="crop-detail-container animate-fade-in-up">
      @if (crop()) {
        <!-- Back Navigation & Header Section -->
        <div class="crop-detail-header-card">
          <button mat-button class="organic-back-btn" routerLink="/crops">
            <mat-icon>arrow_back</mat-icon> 
            <span>{{ 'CROPS.DETAIL.BACK' | translate }}</span>
          </button>
          
          <div class="header-branding-row">
            <div class="emoji-bubble">{{ getCropEmoji(crop()!.name) }}</div>
            <div class="header-text-block">
              <h1>{{ crop()!.name }}</h1>
              <p>{{ crop()!.description || ('CROPS.DEFAULT_DESC' | translate) }}</p>
            </div>
          </div>
        </div>

        <!-- Filter Area -->
        <div class="filter-actions-bar">
          <mat-form-field appearance="outline" class="organic-district-select">
            <mat-label>{{ 'CROPS.DETAIL.DISTRICT_LABEL' | translate }}</mat-label>
            <mat-icon matPrefix class="select-icon">place</mat-icon>
            <mat-select [(ngModel)]="selectedDistrict" (selectionChange)="onFilterChange()">
              <mat-option value="">{{ 'CROPS.DETAIL.ALL_DISTRICTS' | translate }}</mat-option>
              @for (d of districts(); track d) {
                <mat-option [value]="d">{{ d }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="detail-grids-wrapper">
          <!-- Glassmorphic Trend Chart -->
          <div class="glass-section-card chart-container-card">
            <div class="section-card-header">
              <mat-icon class="section-icon color-primary">analytics</mat-icon>
              <h3>{{ 'CROPS.DETAIL.PRICE_TREND' | translate }}</h3>
            </div>
            
            <div class="chart-wrapper">
              @if (chartLabels().length) {
                <app-chart 
                  type="line" 
                  [labels]="chartLabels()" 
                  [datasets]="chartDatasets()" 
                  height="360px">
                </app-chart>
              } @else {
                <div class="no-data-placeholder">
                  <mat-icon>trending_down</mat-icon>
                  <p>{{ 'CROPS.DETAIL.NO_DATA' | translate }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Active Mandi Rates Table -->
          <div class="glass-section-card rates-container-card">
            <div class="section-card-header">
              <mat-icon class="section-icon color-accent">monetization_on</mat-icon>
              <h3>Live Mandi Rates</h3>
            </div>

            <div class="mandi-table-wrapper">
              @if (loadingPrices()) {
                <div class="mandi-spinner-box">
                  <mat-spinner diameter="32"></mat-spinner>
                  <span>Loading mandi prices...</span>
                </div>
              } @else if (mandiPrices().length) {
                <div class="responsive-table-scroll">
                  <table class="mandi-prices-table">
                    <thead>
                      <tr>
                        <th>Mandi</th>
                        <th>District</th>
                        <th>Min / Max Price</th>
                        <th class="text-right">Modal Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (price of mandiPrices(); track price.id) {
                        <tr class="table-row-hover">
                          <td>
                            <div class="mandi-name-col">
                              <span class="mandi-bullet"></span>
                              <span class="mandi-name-text">{{ price.mandi_name }}</span>
                            </div>
                          </td>
                          <td>
                            <span class="district-badge">{{ price.district }}</span>
                          </td>
                          <td>
                            <span class="min-max-text">₹{{ price.min_price }} - ₹{{ price.max_price }}</span>
                          </td>
                          <td class="text-right">
                            <span class="modal-price-chip">₹{{ price.modal_price }}</span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="no-data-placeholder">
                  <mat-icon>storefront</mat-icon>
                  <p>No active Mandi rate listings found for this crop in the selected district.</p>
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="outer-spinner-box">
          <mat-spinner diameter="48" strokeWidth="4"></mat-spinner>
          <span>Fetching crop details...</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .crop-detail-container {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      max-width: 1200px;
      margin: 0 auto;
    }

    .crop-detail-header-card {
      background: white;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      box-shadow: var(--shadow-sm);

      .organic-back-btn {
        align-self: flex-start;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        color: var(--color-text-secondary);
        font-weight: 600;
        background: var(--color-bg);
        transition: all 0.2s ease;

        &:hover {
          background: rgba(13, 158, 110, 0.05);
          border-color: var(--color-primary);
          color: var(--color-primary-dark);
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .header-branding-row {
        display: flex;
        align-items: center;
        gap: var(--space-4);

        .emoji-bubble {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--color-primary-50);
          border: 1px solid rgba(13, 158, 110, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          box-shadow: var(--shadow-sm);
        }

        .header-text-block {
          h1 {
            font-size: var(--font-size-3xl);
            font-weight: 800;
            color: var(--color-text-primary);
            margin: 0 0 var(--space-1) 0;
          }

          p {
            color: var(--color-text-light);
            font-size: var(--font-size-sm);
            margin: 0;
            line-height: 1.5;
          }
        }
      }
    }

    .filter-actions-bar {
      display: flex;
      justify-content: flex-start;

      .organic-district-select {
        width: 280px;

        ::ng-deep .mat-mdc-text-field-wrapper {
          background: white !important;
          border-radius: var(--radius-lg);
        }

        .select-icon {
          color: var(--color-primary);
          margin-right: var(--space-1);
        }
      }
    }

    .detail-grids-wrapper {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-6);

      @media (min-width: 1024px) {
        grid-template-columns: 3fr 2fr;
      }
    }

    .glass-section-card {
      background: white;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);

      .section-card-header {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        border-bottom: 1px solid var(--color-border);
        padding-bottom: var(--space-3);

        .section-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;

          &.color-primary {
            color: var(--color-primary);
          }

          &.color-accent {
            color: var(--color-accent);
          }
        }

        h3 {
          font-size: var(--font-size-lg);
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }
      }
    }

    .chart-wrapper {
      min-height: 360px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    .no-data-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      color: var(--color-text-muted);
      padding: var(--space-12) 0;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        opacity: 0.5;
      }

      p {
        margin: 0;
        font-size: var(--font-size-sm);
        text-align: center;
        max-width: 240px;
      }
    }

    /* Mandi Rates Table Styling */
    .mandi-table-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .mandi-spinner-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      padding: var(--space-12) 0;
      color: var(--color-text-light);
    }

    .responsive-table-scroll {
      overflow-x: auto;
      width: 100%;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }

    .mandi-prices-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: var(--font-size-sm);

      thead {
        background: var(--color-bg);
        border-bottom: 1px solid var(--color-border);

        th {
          padding: var(--space-3) var(--space-4);
          font-weight: 700;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }
      }

      tbody {
        tr {
          border-bottom: 1px solid var(--color-border);

          &:last-child {
            border-bottom: none;
          }
        }
      }

      td {
        padding: var(--space-4);
        vertical-align: middle;
        color: var(--color-text-primary);
      }

      .mandi-name-col {
        display: flex;
        align-items: center;
        gap: var(--space-2);

        .mandi-bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-primary);
        }

        .mandi-name-text {
          font-weight: 600;
        }
      }

      .district-badge {
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        color: var(--color-text-secondary);
        padding: 2px 8px;
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
        font-weight: 500;
      }

      .min-max-text {
        color: var(--color-text-light);
        font-size: var(--font-size-xs);
      }

      .modal-price-chip {
        display: inline-block;
        background: rgba(13, 158, 110, 0.08);
        border: 1px solid rgba(13, 158, 110, 0.15);
        color: var(--color-primary-dark);
        padding: 4px 10px;
        border-radius: var(--radius-full);
        font-weight: 700;
      }

      .text-right {
        text-align: right;
      }

      .table-row-hover {
        transition: background-color 0.2s ease;

        &:hover {
          background-color: rgba(13, 158, 110, 0.02);
        }
      }
    }

    .outer-spinner-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-4);
      padding: var(--space-16);
      color: var(--color-text-light);
    }
  `],
})
export class CropDetailComponent implements OnInit {
  crop = signal<Crop | null>(null);
  districts = signal<string[]>([]);
  selectedDistrict = '';
  chartLabels = signal<string[]>([]);
  chartDatasets = signal<ChartDataset[]>([]);
  mandiPrices = signal<MandiPrice[]>([]);
  loadingPrices = signal<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private cropService: CropService,
    private mandiService: MandiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cropService.getById(id).subscribe((c) => {
        this.crop.set(c);
        this.loadTrends();
        this.loadPrices();
      });
      this.mandiService.getDistricts().subscribe((d) => this.districts.set(d));
    }
  }

  onFilterChange(): void {
    this.loadTrends();
    this.loadPrices();
  }

  loadTrends(): void {
    const name = this.crop()?.name;
    if (!name) return;
    this.mandiService.getTrends(name, this.selectedDistrict || undefined).subscribe((trends) => {
      this.chartLabels.set(trends.map((t) => `${t.month} ${t.year}`));
      this.chartDatasets.set([
        {
          label: 'Modal Price (₹)',
          data: trends.map((t) => t.avg_modal_price),
          borderColor: '#0d9e6e',
          backgroundColor: 'rgba(13,158,110,0.1)',
          fill: true,
          tension: 0.4,
        },
      ]);
    });
  }

  loadPrices(): void {
    const name = this.crop()?.name;
    if (!name) return;
    this.loadingPrices.set(true);
    this.mandiService
      .getPrices({
        crop: name,
        district: this.selectedDistrict || undefined,
        page_size: 5,
      })
      .subscribe({
        next: (res) => {
          this.mandiPrices.set(res.items);
          this.loadingPrices.set(false);
        },
        error: () => this.loadingPrices.set(false),
      });
  }

  getCropEmoji(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('wheat')) return '🌾';
    if (n.includes('rice') || n.includes('paddy')) return '🍚';
    if (n.includes('sugar')) return '🎋';
    if (n.includes('cotton')) return '☁️';
    if (n.includes('onion')) return '🧅';
    if (n.includes('potato')) return '🥔';
    if (n.includes('tomato')) return '🍅';
    if (n.includes('soyabean') || n.includes('soy')) return '🌱';
    if (n.includes('maize') || n.includes('corn')) return '🌽';
    if (n.includes('gram') || n.includes('chana')) return '🫘';
    return '🍃';
  }
}
