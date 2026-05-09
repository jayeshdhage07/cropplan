/**
 * Reusable Chart Component using Chart.js.
 * Supports line, bar, pie, and doughnut chart types.
 * Designed for displaying mandi price trends and prediction data.
 */

import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
  tension?: number;
}

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-wrapper" [style.height]="height">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-wrapper {
      position: relative;
      width: 100%;
      background: var(--color-bg-card);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
    }

    canvas {
      width: 100% !important;
      height: 100% !important;
    }
  `],
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() type: ChartType = 'line';
  @Input() labels: string[] = [];
  @Input() datasets: ChartDataset[] = [];
  @Input() height = '300px';
  @Input() title = '';
  @Input() showLegend = true;

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart && (changes['labels'] || changes['datasets'] || changes['type'])) {
      this.chart.destroy();
      this.createChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private createChart(): void {
    if (!this.canvasRef) return;

    const config: ChartConfiguration = {
      type: this.type,
      data: {
        labels: this.labels,
        datasets: this.datasets.map((ds) => ({
          label: ds.label,
          data: ds.data,
          borderColor: ds.borderColor || '#0d9e6e',
          backgroundColor: ds.backgroundColor || 'rgba(13, 158, 110, 0.1)',
          fill: ds.fill ?? (this.type === 'line'),
          tension: ds.tension ?? 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: this.showLegend,
            position: 'top',
            labels: {
              font: { family: 'Inter', size: 12 },
              padding: 16,
            },
          },
          title: {
            display: !!this.title,
            text: this.title,
            font: { family: 'Inter', size: 16, weight: 'bold' as const },
            padding: { bottom: 16 },
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleFont: { family: 'Inter' },
            bodyFont: { family: 'Inter' },
            cornerRadius: 8,
            padding: 12,
          },
        },
        scales:
          this.type === 'line' || this.type === 'bar'
            ? {
                x: {
                  grid: { color: 'rgba(0,0,0,0.05)' },
                  ticks: { font: { family: 'Inter', size: 11 } },
                },
                y: {
                  grid: { color: 'rgba(0,0,0,0.05)' },
                  ticks: {
                    font: { family: 'Inter', size: 11 },
                    callback: (value) => `₹${value}`,
                  },
                },
              }
            : undefined,
      },
    };

    this.chart = new Chart(this.canvasRef.nativeElement, config);
  }
}
