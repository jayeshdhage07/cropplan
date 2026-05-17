/**
 * Settings Component.
 * Language preferences and application settings.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../shared/components/language-selector/language-selector.component';
import { LanguageService } from '../core/services/language.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatDividerModule,
    TranslateModule, LanguageSelectorComponent,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>{{ 'SETTINGS.TITLE' | translate }}</h1>
        <p>{{ 'SETTINGS.SUBTITLE' | translate }}</p>
      </div>

      <mat-card class="settings-card">
        <div class="setting-section">
          <div class="setting-header">
            <mat-icon>translate</mat-icon>
            <div>
              <h3>{{ 'SETTINGS.LANGUAGE_SECTION' | translate }}</h3>
              <p>{{ 'SETTINGS.LANGUAGE_DESC' | translate }}</p>
            </div>
          </div>
          <app-language-selector mode="dropdown" [persistToServer]="true"></app-language-selector>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .settings-card {
      padding: var(--space-8) !important;
      max-width: 600px;
    }
    .setting-section { margin-bottom: var(--space-6); }
    .setting-header {
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      margin-bottom: var(--space-4);

      mat-icon { font-size: 28px; width: 28px; height: 28px; color: var(--color-primary); margin-top: 2px; }
      h3 { font-size: var(--font-size-lg); font-weight: 700; margin-bottom: var(--space-1); }
      p { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
    }
  `],
})
export class SettingsComponent {
  constructor(public langService: LanguageService) {}
}
