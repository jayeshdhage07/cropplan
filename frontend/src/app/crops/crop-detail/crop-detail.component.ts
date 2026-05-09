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
import { ChartComponent, ChartDataset } from '../../shared/components/chart/chart.component';
import { CropService, Crop } from '../../core/services/crop.service';
import { MandiService } from '../../core/services/mandi.service';

@Component({
  selector: 'app-crop-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule, MatSelectModule, MatFormFieldModule, MatProgressSpinnerModule, ChartComponent],
  template: `
    <div class="page-container">
      @if (crop()) {
        <div class="page-header">
          <button mat-button routerLink="/crops"><mat-icon>arrow_back</mat-icon> Back</button>
          <h1>{{ crop()!.name }}</h1>
          <p>{{ crop()!.description || 'Price trends and analysis' }}</p>
        </div>
        <mat-form-field appearance="outline" style="width:250px;margin-bottom:24px">
          <mat-label>District</mat-label>
          <mat-select [(ngModel)]="selectedDistrict" (selectionChange)="loadTrends()">
            <mat-option value="">All</mat-option>
            @for (d of districts(); track d) { <mat-option [value]="d">{{ d }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-card style="padding:24px;margin-bottom:24px">
          <mat-card-title>Price Trend</mat-card-title>
          @if (chartLabels().length) {
            <app-chart type="line" [labels]="chartLabels()" [datasets]="chartDatasets()" height="400px"></app-chart>
          } @else { <p style="text-align:center;padding:48px;color:gray">No data available</p> }
        </mat-card>
      } @else { <mat-spinner diameter="40" style="margin:auto"></mat-spinner> }
    </div>
  `,
  styles: [``],
})
export class CropDetailComponent implements OnInit {
  crop = signal<Crop | null>(null);
  districts = signal<string[]>([]);
  selectedDistrict = '';
  chartLabels = signal<string[]>([]);
  chartDatasets = signal<ChartDataset[]>([]);

  constructor(private route: ActivatedRoute, private cropService: CropService, private mandiService: MandiService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cropService.getById(id).subscribe((c) => { this.crop.set(c); this.loadTrends(); });
      this.mandiService.getDistricts().subscribe((d) => this.districts.set(d));
    }
  }

  loadTrends(): void {
    const name = this.crop()?.name;
    if (!name) return;
    this.mandiService.getTrends(name, this.selectedDistrict || undefined).subscribe((trends) => {
      this.chartLabels.set(trends.map((t) => `${t.month} ${t.year}`));
      this.chartDatasets.set([{ label: 'Modal Price (₹)', data: trends.map((t) => t.avg_modal_price), borderColor: '#0d9e6e', backgroundColor: 'rgba(13,158,110,0.1)', fill: true, tension: 0.4 }]);
    });
  }
}
