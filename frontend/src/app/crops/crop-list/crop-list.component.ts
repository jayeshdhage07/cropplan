/**
 * Redesigned Crop List Component.
 * Displays tracked crops using organic outline cards, touch-friendly hover motions,
 * localized season tags, and schedule sub-metrics.
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { CropService, Crop } from '../../core/services/crop.service';

@Component({
  selector: 'app-crop-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  template: `
    <div class="crops-container animate-fade-in-up">
      <div class="crops-header-section">
        <div class="crops-title-badge">
          <mat-icon>grass</mat-icon>
          <span>{{ 'CROPS.TITLE' | translate }}</span>
        </div>
        <h1>{{ 'CROPS.TITLE' | translate }}</h1>
        <p>{{ 'CROPS.SUBTITLE' | translate }}</p>
      </div>

      @if (loading()) {
        <div class="spinner-container">
          <mat-spinner diameter="48" strokeWidth="4"></mat-spinner>
          <span>Loading market crops...</span>
        </div>
      } @else {
        <div class="crops-grid">
          @for (crop of crops(); track crop.id) {
            <div class="premium-crop-card" [routerLink]="['/crops', crop.id]">
              <div class="card-inner-overlay"></div>
              
              <div class="card-top-row">
                <div class="crop-visual">
                  <span class="emoji-container animate-pulse">{{ getCropEmoji(crop.name) }}</span>
                </div>
                <span class="crop-tag season-tag-badge">{{ crop.season || 'Kharif' }}</span>
              </div>

              <div class="card-main-content">
                <h3 class="crop-name-title">{{ crop.name }}</h3>
                <p class="crop-desc-text">
                  {{ crop.description || ('CROPS.DEFAULT_DESC' | translate) }}
                </p>
              </div>

              <div class="card-footer-metrics">
                @if (crop.average_growth_days) {
                  <div class="metric-widget">
                    <mat-icon class="metric-icon">timer</mat-icon>
                    <span class="metric-value">
                      {{ 'CROPS.GROWTH_PERIOD' | translate:{ days: crop.average_growth_days } }}
                    </span>
                  </div>
                }
                
                <div class="action-trigger">
                  <span class="action-label">{{ 'CROPS.VIEW_TRENDS' | translate }}</span>
                  <mat-icon class="action-arrow">arrow_forward</mat-icon>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .crops-container {
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
      max-width: 1200px;
      margin: 0 auto;
    }

    .crops-header-section {
      background: white;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-8);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 150px;
        height: 150px;
        background: radial-gradient(circle, rgba(13,158,110,0.05) 0%, transparent 70%);
        border-radius: 50%;
      }

      .crops-title-badge {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        background: rgba(13, 158, 110, 0.08);
        color: var(--color-primary);
        padding: var(--space-1) var(--space-3);
        border-radius: var(--radius-full);
        font-weight: 700;
        font-size: var(--font-size-xs);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        align-self: flex-start;

        mat-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
        }
      }

      h1 {
        font-size: var(--font-size-3xl);
        font-weight: 800;
        color: var(--color-text-primary);
        margin: var(--space-1) 0 0 0;
      }

      p {
        color: var(--color-text-light);
        font-size: var(--font-size-base);
        margin: 0;
      }
    }

    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-4);
      padding: var(--space-16);
      color: var(--color-text-light);
      font-weight: 500;
    }

    .crops-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-6);

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    .premium-crop-card {
      background: white;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      .card-inner-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(13,158,110,0.03) 0%, transparent 60%);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover {
        transform: translateY(-4px);
        border-color: var(--color-primary);
        box-shadow: var(--shadow-md);

        .card-inner-overlay {
          opacity: 1;
        }

        .emoji-container {
          transform: scale(1.15) rotate(5deg);
        }

        .action-trigger {
          color: var(--color-primary-dark);
          
          .action-arrow {
            transform: translateX(4px);
          }
        }
      }

      .card-top-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        z-index: 2;

        .crop-visual {
          width: 52px;
          height: 52px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset var(--shadow-sm);

          .emoji-container {
            font-size: 1.8rem;
            display: inline-block;
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
        }

        .season-tag-badge {
          background: rgba(245, 158, 11, 0.08);
          color: var(--color-accent-dark);
          border: 1px solid rgba(245, 158, 11, 0.15);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-size: var(--font-size-xs);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      }

      .card-main-content {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        position: relative;
        z-index: 2;
        flex: 1;

        .crop-name-title {
          font-size: var(--font-size-xl);
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }

        .crop-desc-text {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .card-footer-metrics {
        border-top: 1px solid var(--color-border);
        padding-top: var(--space-4);
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        z-index: 2;

        .metric-widget {
          display: flex;
          align-items: center;
          gap: var(--space-1-5);
          color: var(--color-text-light);

          .metric-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
            color: var(--color-primary);
          }

          .metric-value {
            font-size: var(--font-size-xs);
            font-weight: 500;
          }
        }

        .action-trigger {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          color: var(--color-text-light);
          font-size: var(--font-size-xs);
          font-weight: 700;
          transition: color 0.2s ease;

          .action-arrow {
            font-size: 14px;
            width: 14px;
            height: 14px;
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
        }
      }
    }
  `],
})
export class CropListComponent implements OnInit {
  crops = signal<Crop[]>([]);
  loading = signal(true);

  constructor(private cropService: CropService) {}

  ngOnInit(): void {
    this.cropService.getAll().subscribe({
      next: (res) => {
        this.crops.set(res.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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
