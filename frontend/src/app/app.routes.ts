import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'crops',
    loadChildren: () =>
      import('./crops/crops.routes').then((m) => m.CROPS_ROUTES),
    canActivate: [authGuard],
  },
  {
    path: 'predictions',
    loadComponent: () =>
      import('./prediction/prediction.component').then(
        (m) => m.PredictionComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'profit-estimator',
    loadComponent: () =>
      import('./profit-estimator/profit-estimator.component').then(
        (m) => m.ProfitEstimatorComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/settings.component').then((m) => m.SettingsComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
