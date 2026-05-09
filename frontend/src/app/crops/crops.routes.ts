import { Routes } from '@angular/router';

export const CROPS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./crop-list/crop-list.component').then((m) => m.CropListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./crop-detail/crop-detail.component').then(
        (m) => m.CropDetailComponent
      ),
  },
];
