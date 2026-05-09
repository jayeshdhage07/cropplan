/**
 * Crop List Component.
 * Displays all tracked crops in a card grid.
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Crop Trends</h1>
        <p>View historical trends and market data for tracked crops</p>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="card-grid">
          @for (crop of crops(); track crop.id) {
            <mat-card class="crop-card" [routerLink]="['/crops', crop.id]">
              <div class="crop-card-header">
                <div class="crop-emoji">🌾</div>
                <div>
                  <h3>{{ crop.name }}</h3>
                  <span class="season-badge">{{ crop.season }}</span>
                </div>
              </div>
              <mat-card-content>
                <p class="crop-info">
                  {{ crop.description || 'Click to view detailed market trends and price history.' }}
                </p>
                @if (crop.average_growth_days) {
                  <div class="growth-info">
                    <mat-icon>schedule</mat-icon>
                    <span>{{ crop.average_growth_days }} days growth period</span>
                  </div>
                }
              </mat-card-content>
              <mat-card-actions>
                <button mat-button color="primary">
                  <mat-icon>show_chart</mat-icon>
                  View Trends
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .crop-card {
      cursor: pointer;
      transition: all var(--transition-normal);
      padding: var(--space-6) !important;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl) !important;
      }
    }

    .crop-card-header {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      margin-bottom: var(--space-4);

      .crop-emoji { font-size: 2.5rem; }

      h3 {
        font-size: var(--font-size-xl);
        font-weight: 700;
        margin-bottom: var(--space-1);
      }
    }

    .season-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: var(--radius-full);
      background: var(--color-primary-50);
      color: var(--color-primary-dark);
      font-size: var(--font-size-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .crop-info {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      margin-bottom: var(--space-3);
    }

    .growth-info {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);

      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .loading-state {
      display: flex;
      justify-content: center;
      padding: var(--space-16);
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
}
