/**
 * Redesigned Layout Component.
 * Supports desktop collapsibility, high-contrast mobile drawers,
 * modern agriculture themes, role-based nav, and localized quick profile widgets.
 */

import { Component, OnInit, ViewChild, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { LanguageSelectorComponent } from '../components/language-selector/language-selector.component';

export interface NavItem {
  route: string;
  icon: string;
  labelKey: string;
  tooltipKey: string;
}

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
    MatTooltipModule,
    MatBadgeModule,
    TranslateModule,
    LanguageSelectorComponent,
  ],
  template: `
    <mat-sidenav-container class="layout-container">
      <!-- Collapsible Responsive Sidebar (Sidenav) -->
      @if (authService.isAuthenticated()) {
        <mat-sidenav
          #sidenav
          [mode]="isMobile() ? 'over' : 'side'"
          [opened]="!isMobile()"
          [class.sidebar-collapsed]="isCollapsed() && !isMobile()"
          class="sidebar"
          id="app-sidebar"
        >
          <!-- Sidebar Header Branding -->
          <div class="sidebar-header">
            <div class="logo">
              <mat-icon class="logo-icon">eco</mat-icon>
              @if (!isCollapsed() || isMobile()) {
                <span class="logo-text">{{ 'APP.NAME' | translate }}</span>
              }
            </div>
            <!-- Collapsible arrow (desktop only) -->
            @if (!isMobile()) {
              <button
                mat-icon-button
                class="collapse-toggle-btn"
                (click)="toggleSidebar()"
                [matTooltip]="(isCollapsed() ? 'COMMON.NEXT' : 'COMMON.BACK') | translate"
              >
                <mat-icon>{{ isCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
              </button>
            }
          </div>

          <!-- Quick Profile Widget -->
          <div class="profile-widget" [class.profile-widget-collapsed]="isCollapsed() && !isMobile()">
            <div class="avatar-wrapper">
              <div class="avatar-circle">
                {{ authService.currentUser()?.name?.charAt(0) || 'F' }}
              </div>
              <span class="status-indicator"></span>
            </div>
            @if (!isCollapsed() || isMobile()) {
              <div class="profile-info">
                <span class="profile-name">{{ authService.currentUser()?.name || 'Farmer' }}</span>
                <span class="profile-meta">
                  <mat-icon>home</mat-icon>
                  {{ authService.currentUser()?.village || 'Village' }}
                </span>
              </div>
            }
          </div>

          <mat-divider class="sidebar-divider"></mat-divider>

          <!-- Sidebar Scrollable Navigation -->
          <div class="sidebar-navigation">
            <!-- Group 1: Core Farming Activities -->
            <div class="nav-group">
              @if (!isCollapsed() || isMobile()) {
                <span class="nav-group-title">Core Farming</span>
              }
              <mat-nav-list class="nav-list">
                @for (item of coreNavItems; track item.route) {
                  <a
                    mat-list-item
                    [routerLink]="item.route"
                    routerLinkActive="active-link"
                    [matTooltip]="isCollapsed() && !isMobile() ? (item.tooltipKey | translate) : ''"
                    matTooltipPosition="right"
                    (click)="onNavItemClick()"
                  >
                    <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                    @if (!isCollapsed() || isMobile()) {
                      <span matListItemTitle>{{ item.labelKey | translate }}</span>
                    }
                  </a>
                }
              </mat-nav-list>
            </div>

            <!-- Group 2: Account & Settings -->
            <div class="nav-group">
              @if (!isCollapsed() || isMobile()) {
                <span class="nav-group-title">Account & Settings</span>
              }
              <mat-nav-list class="nav-list">
                @for (item of settingsNavItems; track item.route) {
                  <a
                    mat-list-item
                    [routerLink]="item.route"
                    routerLinkActive="active-link"
                    [matTooltip]="isCollapsed() && !isMobile() ? (item.tooltipKey | translate) : ''"
                    matTooltipPosition="right"
                    (click)="onNavItemClick()"
                  >
                    <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                    @if (!isCollapsed() || isMobile()) {
                      <span matListItemTitle>{{ item.labelKey | translate }}</span>
                    }
                  </a>
                }
              </mat-nav-list>
            </div>
          </div>

          <!-- Sidebar Footer (Logout) -->
          <div class="sidebar-footer">
            <mat-nav-list class="nav-list">
              <a
                mat-list-item
                class="logout-link"
                (click)="authService.logout()"
                [matTooltip]="isCollapsed() && !isMobile() ? ('NAV.LOGOUT' | translate) : ''"
                matTooltipPosition="right"
              >
                <mat-icon matListItemIcon class="logout-icon">logout</mat-icon>
                @if (!isCollapsed() || isMobile()) {
                  <span matListItemTitle class="logout-text">{{ 'NAV.LOGOUT' | translate }}</span>
                }
              </a>
            </mat-nav-list>
          </div>
        </mat-sidenav>
      }

      <!-- Main Sidenav Content Shell -->
      <mat-sidenav-content class="content-area">
        <!-- Modern Sticky Topbar Header -->
        @if (authService.isAuthenticated()) {
          <mat-toolbar class="topbar sticky-header" id="app-header">
            <!-- Mobile Menu Toggle Button -->
            <button
              mat-icon-button
              (click)="sidenav.toggle()"
              class="mobile-toggle-btn"
              [class.visible-mobile]="isMobile()"
            >
              <mat-icon>menu</mat-icon>
            </button>

            <!-- Page Title Shortcut for Farmers -->
            <div class="brand-shortcut" *ngIf="isMobile()">
              <mat-icon class="brand-icon">eco</mat-icon>
              <span class="brand-name">CropPredict</span>
            </div>

            <span class="toolbar-spacer"></span>

            <!-- Agriculture Mock Alerts Icon -->
            <button
              mat-icon-button
              [matMenuTriggerFor]="alertsMenu"
              class="topbar-icon-btn alert-badge"
              matBadge="3"
              matBadgeColor="accent"
              matTooltip="Farming Alerts"
            >
              <mat-icon>notifications</mat-icon>
            </button>

            <mat-menu #alertsMenu="matMenu" class="alerts-dropdown">
              <div class="alerts-header">
                <h3>Farming Alerts & Tips</h3>
                <span class="alerts-count">3 New Alerts</span>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item class="alert-item warning">
                <mat-icon>wb_cloudy</mat-icon>
                <div class="alert-info">
                  <span class="alert-title">Heavy Rain Warning</span>
                  <span class="alert-desc">Secure onion harvest in Nashik; rains expected within 12h.</span>
                </div>
              </button>
              <button mat-menu-item class="alert-item success">
                <mat-icon>trending_up</mat-icon>
                <div class="alert-info">
                  <span class="alert-title">Market Price Spike</span>
                  <span class="alert-desc">Wheat modal prices spiked by ₹120/quintal in Solapur.</span>
                </div>
              </button>
              <button mat-menu-item class="alert-item info">
                <mat-icon>tips_and_updates</mat-icon>
                <div class="alert-info">
                  <span class="alert-title">Farming Advisory</span>
                  <span class="alert-desc">Ideal time to sow Rabi crops. Check profit insights.</span>
                </div>
              </button>
            </mat-menu>

            <!-- Language Switcher Selector widget -->
            <app-language-selector mode="menu" [persistToServer]="true" class="topbar-lang-selector"></app-language-selector>

            <!-- User Quick Dropdown menu widget -->
            <div class="user-dropdown-wrapper">
              <button
                mat-button
                [matMenuTriggerFor]="userMenu"
                class="user-menu-trigger"
              >
                <div class="avatar-small">
                  {{ authService.currentUser()?.name?.charAt(0) || 'F' }}
                </div>
                <span class="user-trigger-name" *ngIf="!isMobile()">
                  {{ authService.currentUser()?.name }}
                </span>
                <mat-icon class="arrow-icon" *ngIf="!isMobile()">keyboard_arrow_down</mat-icon>
              </button>

              <mat-menu #userMenu="matMenu" class="profile-dropdown">
                <div class="profile-dropdown-header">
                  <span class="header-name">{{ authService.currentUser()?.name }}</span>
                  <span class="header-role">{{ authService.currentUser()?.role | titlecase }}</span>
                  <span class="header-mobile">{{ authService.currentUser()?.mobile }}</span>
                </div>
                <mat-divider></mat-divider>
                <button mat-menu-item routerLink="/profile">
                  <mat-icon>person</mat-icon>
                  <span>{{ 'NAV.PROFILE' | translate }}</span>
                </button>
                <button mat-menu-item routerLink="/settings">
                  <mat-icon>settings</mat-icon>
                  <span>{{ 'NAV.SETTINGS' | translate }}</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="authService.logout()" class="dropdown-logout">
                  <mat-icon>logout</mat-icon>
                  <span>{{ 'NAV.LOGOUT' | translate }}</span>
                </button>
              </mat-menu>
            </div>
          </mat-toolbar>
        }

        <!-- Main Page Route Rendering Area -->
        <main [class.page-content]="authService.isAuthenticated()">
          <ng-content></ng-content>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .layout-container {
      height: 100vh;
      background-color: var(--color-bg);
    }

    /* ---------- Collapsible Responsive Sidebar ---------- */
    .sidebar {
      width: 280px;
      background: var(--color-bg-sidebar);
      border-right: none;
      box-shadow: var(--shadow-xl);
      display: flex;
      flex-direction: column;
      transition: width var(--transition-normal) !important;
      overflow-x: hidden !important;
      
      &.sidebar-collapsed {
        width: 80px;
      }
    }

    /* Sidebar Header Branding */
    .sidebar-header {
      padding: var(--space-5) var(--space-4);
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
      
      .logo {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        color: #ffffff;
      }
      
      .logo-icon {
        color: var(--color-primary-light);
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .logo-text {
        font-family: 'Outfit', sans-serif;
        font-size: 1.35rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        white-space: nowrap;
        background: linear-gradient(135deg, #ffffff 0%, var(--color-primary-light) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .collapse-toggle-btn {
        color: var(--color-text-light);
        transition: all var(--transition-fast);
        
        &:hover {
          color: #ffffff;
          background-color: rgba(255, 255, 255, 0.05);
        }
      }
    }

    /* Quick Profile Widget */
    .profile-widget {
      padding: var(--space-4);
      margin: var(--space-2) var(--space-4);
      background: rgba(255, 255, 255, 0.03);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: var(--space-3);
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all var(--transition-normal);
      
      &.profile-widget-collapsed {
        padding: var(--space-2);
        margin: var(--space-2) auto;
        border: none;
        background: transparent;
      }
      
      .avatar-wrapper {
        position: relative;
        flex-shrink: 0;
      }

      .avatar-circle {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-full);
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Outfit', sans-serif;
        font-weight: 700;
        font-size: 1.15rem;
        box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
      }

      .status-indicator {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 12px;
        height: 12px;
        border-radius: var(--radius-full);
        background-color: var(--color-success);
        border: 2px solid var(--color-bg-sidebar);
      }

      .profile-info {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .profile-name {
        color: #ffffff;
        font-weight: 700;
        font-size: var(--font-size-sm);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .profile-meta {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        gap: 3px;
        
        mat-icon {
          font-size: 12px;
          width: 12px;
          height: 12px;
        }
      }
    }

    .sidebar-divider {
      border-top-color: rgba(255, 255, 255, 0.06);
      margin: var(--space-2) var(--space-4) !important;
    }

    /* Sidebar Navigation Groupings */
    .sidebar-navigation {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      padding: var(--space-4) 0;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .nav-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .nav-group-title {
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: rgba(255, 255, 255, 0.5);
      padding: 0 var(--space-6);
      margin-bottom: 2px;
    }

    .nav-list {
      padding: 0 !important;
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      a {
        color: rgba(255, 255, 255, 0.7) !important;
        margin: 0 var(--space-4) !important;
        height: 48px !important;
        border-radius: var(--radius-md) !important;
        display: flex !important;
        align-items: center !important;
        padding-left: var(--space-4) !important;
        position: relative;
        transition: all var(--transition-normal);
        
        /* Fix Angular Material 15+ MDC styling overriding local colors */
        ::ng-deep .mdc-list-item__primary-text {
          color: inherit !important;
          font-weight: inherit !important;
        }
        
        &:hover {
          color: #ffffff !important;
          background: rgba(255, 255, 255, 0.04) !important;
          
          mat-icon {
            color: #ffffff !important;
          }
        }
        
        mat-icon {
          color: rgba(255, 255, 255, 0.5) !important;
          transition: color var(--transition-fast);
          margin-right: var(--space-4) !important;
          font-size: 22px;
          width: 22px;
          height: 22px;
        }

        &.active-link {
          background: rgba(16, 185, 129, 0.15) !important;
          color: var(--color-primary-light) !important;
          font-weight: 700 !important;
          border: 1px solid rgba(16, 185, 129, 0.2);
          
          mat-icon {
            color: var(--color-primary-light) !important;
          }
          
          /* Emerald Active left indicator bar */
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 15%;
            height: 70%;
            width: 3px;
            background-color: var(--color-primary-light);
            border-radius: var(--radius-full);
          }
        }
      }
    }

    /* Sidebar Footer Logout */
    .sidebar-footer {
      padding: var(--space-4) 0;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      
      .logout-link {
        color: #ef4444 !important;
        
        &:hover {
          background: rgba(239, 68, 68, 0.08) !important;
          color: #f87171 !important;
          
          mat-icon {
            color: #f87171 !important;
          }
        }
        
        mat-icon {
          color: #fca5a5;
        }
      }
    }

    /* ---------- Modern Sticky Topbar ---------- */
    .topbar {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--color-border);
      color: var(--color-text-primary);
      height: 70px;
      display: flex;
      align-items: center;
      padding: 0 var(--space-6) !important;
      z-index: 10;
      transition: all var(--transition-normal);
    }

    .sticky-header {
      position: sticky;
      top: 0;
    }

    .mobile-toggle-btn {
      display: none;
      color: var(--color-text-primary);
      
      &.visible-mobile {
        display: flex;
        margin-right: var(--space-2);
      }
    }

    .brand-shortcut {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      
      .brand-icon {
        color: var(--color-primary);
      }
      
      .brand-name {
        font-family: 'Outfit', sans-serif;
        font-weight: 800;
        font-size: var(--font-size-lg);
        color: var(--color-text-primary);
      }
    }

    .toolbar-spacer {
      flex: 1;
    }

    .topbar-icon-btn {
      color: var(--color-text-secondary);
      margin-right: var(--space-2);
      transition: all var(--transition-fast);
      
      &:hover {
        color: var(--color-text-primary);
        background-color: rgba(15, 23, 42, 0.03);
      }
    }

    /* Alerts Dropdown Styling */
    .alerts-dropdown {
      width: 320px;
      max-width: 90vw;
      border-radius: var(--radius-lg) !important;
      
      .alerts-header {
        padding: var(--space-4);
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        h3 {
          font-size: var(--font-size-base);
          font-weight: 700;
        }
        
        .alerts-count {
          font-size: 0.75rem;
          color: var(--color-primary);
          font-weight: 700;
          background-color: var(--color-primary-50);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }
      }

      .alert-item {
        padding: var(--space-4) !important;
        display: flex !important;
        gap: var(--space-3);
        align-items: flex-start !important;
        height: auto !important;
        white-space: normal !important;
        
        mat-icon {
          margin-right: 0 !important;
          margin-top: 2px;
          flex-shrink: 0;
        }

        &.warning mat-icon { color: var(--color-warning); }
        &.success mat-icon { color: var(--color-success); }
        &.info mat-icon { color: var(--color-info); }

        .alert-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .alert-title {
          font-weight: 700;
          font-size: var(--font-size-sm);
        }

        .alert-desc {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          line-height: 1.4;
        }
      }
    }

    /* Topbar user dropdown */
    .user-menu-trigger {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: 4px var(--space-3) !important;
      border-radius: var(--radius-full) !important;
      border: 1px solid var(--color-border) !important;
      background-color: var(--color-bg-card);
      transition: all var(--transition-fast) !important;
      height: 44px !important;

      &:hover {
        background-color: var(--color-border);
        border-color: var(--color-border-hover) !important;
      }
      
      .avatar-small {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-full);
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
        color: #ffffff;
        font-family: 'Outfit', sans-serif;
        font-weight: 700;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .user-trigger-name {
        font-size: var(--font-size-sm);
        font-weight: 600;
        color: var(--color-text-primary);
      }

      .arrow-icon {
        margin: 0 !important;
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--color-text-secondary);
      }
    }

    .profile-dropdown {
      width: 240px;
      border-radius: var(--radius-lg) !important;
      
      .profile-dropdown-header {
        padding: var(--space-4);
        display: flex;
        flex-direction: column;
        
        .header-name {
          font-weight: 700;
          font-size: var(--font-size-base);
          color: var(--color-text-primary);
        }
        
        .header-role {
          font-size: var(--font-size-xs);
          color: var(--color-primary);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 1px;
        }

        .header-mobile {
          font-size: 0.75rem;
          color: var(--color-text-light);
          margin-top: 2px;
        }
      }
      
      .dropdown-logout {
        color: #ef4444 !important;
        
        mat-icon {
          color: #ef4444 !important;
        }
      }
    }

    /* ---------- Content Area Layout ---------- */
    .content-area {
      background-color: var(--color-bg);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .page-content {
      padding: var(--space-6);
      flex: 1;
      
      @media (max-width: 768px) {
        padding: var(--space-4);
      }
    }

    /* Responsive mobile configurations */
    @media (max-width: 768px) {
      .topbar {
        padding: 0 var(--space-4) !important;
      }
    }
  `],
})
export class LayoutComponent implements OnInit {
  isMobile = signal<boolean>(false);
  isCollapsed = signal<boolean>(false);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(
    public authService: AuthService,
    private breakpointObserver: BreakpointObserver,
    private router: Router
  ) {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isMobile.set(result.matches);
      });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.getProfile().subscribe({
        error: () => console.warn('Failed to load user profile on layout init')
      });
    }
  }

  coreNavItems: NavItem[] = [
    { route: '/dashboard', icon: 'dashboard', labelKey: 'NAV.DASHBOARD', tooltipKey: 'NAV.DASHBOARD' },
    { route: '/crops', icon: 'grass', labelKey: 'NAV.CROP_TRENDS', tooltipKey: 'NAV.CROP_TRENDS' },
    { route: '/predictions', icon: 'trending_up', labelKey: 'NAV.PREDICTIONS', tooltipKey: 'NAV.PREDICTIONS' },
    { route: '/profit-estimator', icon: 'calculate', labelKey: 'NAV.PROFIT_ESTIMATOR', tooltipKey: 'NAV.PROFIT_ESTIMATOR' },
  ];

  settingsNavItems: NavItem[] = [
    { route: '/profile', icon: 'person', labelKey: 'NAV.PROFILE', tooltipKey: 'NAV.PROFILE' },
    { route: '/settings', icon: 'settings', labelKey: 'NAV.SETTINGS', tooltipKey: 'NAV.SETTINGS' },
  ];

  toggleSidebar(): void {
    this.isCollapsed.set(!this.isCollapsed());
  }

  onNavItemClick(): void {
    if (this.isMobile()) {
      this.sidenav.close();
    }
  }
}
