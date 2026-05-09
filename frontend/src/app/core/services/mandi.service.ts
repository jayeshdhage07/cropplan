/**
 * Mandi Service - API calls for historical price and trend data.
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface MandiPrice {
  id: string;
  crop_id: string;
  state: string;
  district: string;
  mandi_name: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
}

export interface MandiPriceListResponse {
  items: MandiPrice[];
  total: number;
}

export interface MandiTrend {
  month: string;
  year: number;
  avg_min_price: number;
  avg_max_price: number;
  avg_modal_price: number;
  record_count: number;
}

@Injectable({ providedIn: 'root' })
export class MandiService {
  constructor(private api: ApiService) {}

  getPrices(params: {
    crop?: string;
    district?: string;
    state?: string;
    page?: number;
    page_size?: number;
  }): Observable<MandiPriceListResponse> {
    return this.api.get<MandiPriceListResponse>('/api/mandi/prices', params as Record<string, string | number>);
  }

  getTrends(crop: string, district?: string, years = 3): Observable<MandiTrend[]> {
    const params: Record<string, string | number> = { crop, years };
    if (district) params['district'] = district;
    return this.api.get<MandiTrend[]>('/mandi/trends', params);
  }

  getDistricts(): Observable<string[]> {
    return this.api.get<string[]>('/mandi/districts');
  }
}
