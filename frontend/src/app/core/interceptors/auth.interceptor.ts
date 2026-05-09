/**
 * JWT Auth Interceptor.
 * Automatically attaches the JWT token to outgoing API requests.
 * Redirects to login on 401 responses.
 */

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Clone request and add authorization header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 and not already a refresh request, try refreshing
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return authService.refreshToken().pipe(
          switchMap((tokenResponse) => {
            // Retry the failed request with the new token
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });
            return next(newReq);
          }),
          catchError((refreshErr) => {
            // If refresh fails, log out completely
            authService.logout();
            return throwError(() => refreshErr);
          })
        );
      } else if (error.status === 401) {
        // If it was already a refresh request that failed, logout
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
