/**
 * Crop Service - API calls for crop data.
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Crop {
  id: string;
  name: string;
  season: string;
  average_growth_days?: number;
  description?: string;
  image_url?: string;
}

export interface CropListResponse {
  items: Crop[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class CropService {
  constructor(private api: ApiService) {}

  getAll(skip = 0, limit = 50): Observable<CropListResponse> {
    return this.api.get<CropListResponse>('/api/crops', { skip, limit });
  }

  getById(id: string): Observable<Crop> {
    return this.api.get<Crop>(`/api/crops/${id}`);
  }

  create(data: Partial<Crop>): Observable<Crop> {
    return this.api.post<Crop>('/api/crops', data);
  }
}
