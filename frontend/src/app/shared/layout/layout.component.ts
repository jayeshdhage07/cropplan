/**
 * Main Layout Component with responsive sidebar navigation.
 * Wraps all authenticated pages with header, sidebar, and content area.
 * Includes language switcher in the toolbar.
 */

import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { LanguageSelectorComponent } from '../components/language-selector/language-selector.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    TranslateModule,
    LanguageSelectorComponent,
  ],
  template: `
    <mat-sidenav-container class="layout-container">
      <!-- Sidebar Navigation (Only for authenticated users) -->
      @if (authService.isAuthenticated()) {
        <mat-sidenav
          #sidenav
          [mode]="isMobile ? 'over' : 'side'"
          [opened]="!isMobile"
          class="sidebar"
        >
          <div class="sidebar-header">
            <div class="logo">
              <mat-icon class="logo-icon">eco</mat-icon>
              <span class="logo-text">{{ 'APP.NAME' | translate }}</span>
            </div>
          </div>

          <mat-nav-list class="nav-list">
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>{{ 'NAV.DASHBOARD' | translate }}</span>
            </a>
            <a mat-list-item routerLink="/crops" routerLinkActive="active-link">
              <mat-icon matListItemIcon>grass</mat-icon>
              <span matListItemTitle>{{ 'NAV.CROP_TRENDS' | translate }}</span>
            </a>
            <a mat-list-item routerLink="/predictions" routerLinkActive="active-link">
              <mat-icon matListItemIcon>trending_up</mat-icon>
              <span matListItemTitle>{{ 'NAV.PREDICTIONS' | translate }}</span>
            </a>
            <a mat-list-item routerLink="/profit-estimator" routerLinkActive="active-link">
              <mat-icon matListItemIcon>calculate</mat-icon>
              <span matListItemTitle>{{ 'NAV.PROFIT_ESTIMATOR' | translate }}</span>
            </a>

            <mat-divider></mat-divider>

            <a mat-list-item routerLink="/profile" routerLinkActive="active-link">
              <mat-icon matListItemIcon>person</mat-icon>
              <span matListItemTitle>{{ 'NAV.PROFILE' | translate }}</span>
            </a>
            <a mat-list-item routerLink="/settings" routerLinkActive="active-link">
              <mat-icon matListItemIcon>settings</mat-icon>
              <span matListItemTitle>{{ 'NAV.SETTINGS' | translate }}</span>
            </a>

            <mat-divider></mat-divider>

            <a mat-list-item (click)="authService.logout()">
              <mat-icon matListItemIcon>logout</mat-icon>
              <span matListItemTitle>{{ 'NAV.LOGOUT' | translate }}</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>
      }

      <!-- Main Content -->
      <mat-sidenav-content class="content-area">
        <!-- Top Toolbar (Only for authenticated users) -->
        @if (authService.isAuthenticated()) {
          <mat-toolbar class="top-toolbar">
            <button mat-icon-button (click)="sidenav.toggle()" class="menu-btn">
              <mat-icon>menu</mat-icon>
            </button>

            <span class="toolbar-spacer"></span>

            <span class="welcome-text">
              {{ 'TOOLBAR.WELCOME' | translate }}, {{ authService.currentUser()?.name || 'Farmer' }}
            </span>

            <!-- Language Switcher in Toolbar -->
            <app-language-selector mode="menu" [persistToServer]="true"></app-language-selector>

            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </button>

            <mat-menu #userMenu="matMenu">
              <button mat-menu-item disabled>
                <mat-icon>person</mat-icon>
                <span>{{ authService.currentUser()?.name }}</span>
              </button>
              <button mat-menu-item disabled>
                <mat-icon>badge</mat-icon>
                <span>{{ authService.currentUser()?.role | titlecase }}</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item routerLink="/profile">
                <mat-icon>manage_accounts</mat-icon>
                <span>{{ 'NAV.PROFILE' | translate }}</span>
              </button>
              <button mat-menu-item routerLink="/settings">
                <mat-icon>settings</mat-icon>
                <span>{{ 'NAV.SETTINGS' | translate }}</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="authService.logout()">
                <mat-icon>logout</mat-icon>
                <span>{{ 'AUTH.LOGOUT' | translate }}</span>
              </button>
            </mat-menu>
          </mat-toolbar>
        }

        <!-- Page Content -->
        <main [class.page-content]="authService.isAuthenticated()">
          <ng-content></ng-content>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .layout-container { height: 100vh; }
    .sidebar { width: 260px; background: var(--gradient-dark); border-right: none; }
    .sidebar-header { padding: 20px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
    .logo { display: flex; align-items: center; gap: 12px; }
    .logo-icon { color: var(--color-primary-light); font-size: 32px; width: 32px; height: 32px; }
    .logo-text { font-size: 1.4rem; font-weight: 800; color: white; letter-spacing: -0.02em; }
    .nav-list { padding-top: 8px; }
    .nav-list a {
      color: rgba(255, 255, 255, 0.7) !important;
      margin: 4px 8px;
      border-radius: var(--radius-md);
      transition: all var(--transition-normal);
      &:hover {
        color: white !important;
        background: rgba(255, 255, 255, 0.08) !important;
      }
      mat-icon { color: rgba(255, 255, 255, 0.5); }
    }
    .active-link {
      background: rgba(13, 158, 110, 0.25) !important;
      color: var(--color-primary-light) !important;
      mat-icon { color: var(--color-primary-light) !important; }
    }
    .content-area { background: var(--color-bg); }
    .top-toolbar {
      background: white;
      color: var(--color-text-primary);
      border-bottom: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
      height: 56px;
    }
    .menu-btn { margin-right: 8px; }
    .toolbar-spacer { flex: 1; }
    .welcome-text { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-right: 8px; }
    .page-content { padding: var(--space-6); min-height: calc(100vh - 56px); }

    @media (max-width: 768px) {
      .welcome-text { display: none; }
      .page-content { padding: var(--space-4); }
    }
  `],
})
export class LayoutComponent {
  isMobile = false;
  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(
    public authService: AuthService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
  }
}
