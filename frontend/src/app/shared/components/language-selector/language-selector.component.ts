/**
 * Reusable Language Selector Component.
 * Displays a dropdown to switch between supported languages.
 * Used on login, register, and navbar.
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  template: `
    @if (mode === 'dropdown') {
      <!-- Dropdown mode for forms (login/register) -->
      <mat-form-field appearance="outline" class="lang-field">
        <mat-label>
          <mat-icon>language</mat-icon>
          {{ langService.getCurrentLanguageLabel() }}
        </mat-label>
        <mat-select
          [value]="langService.currentLang()"
          (selectionChange)="onLanguageChange($event.value)"
          id="language-selector"
        >
          @for (lang of langService.languages; track lang.code) {
            <mat-option [value]="lang.code">
              {{ lang.nativeLabel }} ({{ lang.label }})
            </mat-option>
          }
        </mat-select>
      </mat-form-field>
    } @else {
      <!-- Icon-button mode for navbar -->
      <button
        mat-icon-button
        [matMenuTriggerFor]="langMenu"
        class="lang-btn"
        id="language-menu-trigger"
      >
        <mat-icon>translate</mat-icon>
      </button>
      <mat-menu #langMenu="matMenu">
        @for (lang of langService.languages; track lang.code) {
          <button
            mat-menu-item
            (click)="onLanguageChange(lang.code)"
            [class.active-lang]="lang.code === langService.currentLang()"
          >
            <span class="lang-option">
              <span class="lang-native">{{ lang.nativeLabel }}</span>
              <span class="lang-label">{{ lang.label }}</span>
            </span>
            @if (lang.code === langService.currentLang()) {
              <mat-icon class="check-icon">check</mat-icon>
            }
          </button>
        }
      </mat-menu>
    }
  `,
  styles: [`
    .lang-field {
      width: 100%;
      margin-bottom: 8px;
    }

    .lang-btn {
      color: inherit;
    }

    .lang-option {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .lang-native {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .lang-label {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .active-lang {
      background: rgba(13, 158, 110, 0.08) !important;
    }

    .check-icon {
      color: var(--color-primary);
      margin-left: 8px;
    }
  `],
})
export class LanguageSelectorComponent {
  /**
   * 'dropdown' for forms (login/register), 'menu' for navbar icon-button.
   */
  @Input() mode: 'dropdown' | 'menu' = 'dropdown';

  /**
   * If true, persist language change to backend API.
   */
  @Input() persistToServer = false;

  constructor(public langService: LanguageService) {}

  onLanguageChange(langCode: string): void {
    if (this.persistToServer) {
      this.langService.switchLanguageAndPersist(langCode);
    } else {
      this.langService.switchLanguage(langCode);
    }
  }
}
