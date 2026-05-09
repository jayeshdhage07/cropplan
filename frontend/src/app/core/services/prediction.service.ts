/**
 * Prediction Service - API calls for predictions and recommendations.
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface PredictionResult {
  crop: string;
  district: string;
  predicted_price: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  confidence: number;
  prediction_month: string;
  method: string;
  recommendation?: string;
}

export interface CropRecommendation {
  crop_name: string;
  predicted_price: number;
  trend: string;
  confidence: number;
  expected_profit_per_acre?: number;
  recommendation_score: number;
  reason: string;
}

export interface ProfitEstimate {
  crop: string;
  seed_cost: number;
  fertilizer_cost: number;
  labour_cost: number;
  irrigation_cost: number;
  land_size_acres: number;
}

export interface ProfitResult {
  crop: string;
  total_cost: number;
  expected_revenue: number;
  estimated_profit: number;
  profit_margin_percent: number;
  predicted_price_per_quintal: number;
}

@Injectable({ providedIn: 'root' })
export class PredictionService {
  constructor(private api: ApiService) {}

  getPrediction(crop: string, district: string): Observable<PredictionResult> {
    return this.api.get<PredictionResult>('/api/predictions', { crop, district });
  }

  getRecommendations(
    district: string,
    season?: string
  ): Observable<CropRecommendation[]> {
    const params: Record<string, string> = { district };
    if (season) params['season'] = season;
    return this.api.get<CropRecommendation[]>(
      '/api/predictions/recommendations',
      params
    );
  }

  calculateProfit(estimate: ProfitEstimate): Observable<ProfitResult> {
    return this.api.post<ProfitResult>('/api/predictions/profit', estimate);
  }
}
