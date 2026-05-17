/**
 * Language Service - Manages i18n language state, persistence, and API sync.
 * Uses ngx-translate under the hood.
 * Persists to localStorage before login, syncs to backend API after login.
 */

import { Injectable, signal, computed, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from './api.service';

export interface Language {
  code: string;
  label: string;
  nativeLabel: string;
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'crop_predict_language';

  /** Available languages */
  readonly languages: Language[] = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
    { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
  ];

  /** Current language signal */
  private _currentLang = signal<string>(this.getStoredLanguage());
  readonly currentLang = computed(() => this._currentLang());

  constructor(
    private translate: TranslateService,
    private injector: Injector
  ) {
    // Configure ngx-translate
    this.translate.addLangs(['en', 'hi', 'mr']);
    this.translate.setDefaultLang('en');

    // Initialize with stored or default language
    const lang = this.getStoredLanguage();
    this.translate.use(lang);
    this._currentLang.set(lang);
  }

  /**
   * Switch language (before login - localStorage only).
   */
  switchLanguage(langCode: string): void {
    if (!this.languages.find((l) => l.code === langCode)) return;
    this.translate.use(langCode);
    this._currentLang.set(langCode);
    localStorage.setItem(this.STORAGE_KEY, langCode);
  }

  /**
   * Switch language AND persist to backend (after login).
   */
  switchLanguageAndPersist(langCode: string): void {
    this.switchLanguage(langCode);
    const api = this.injector.get(ApiService);
    api.patch<any>('/auth/language', { preferred_language: langCode }).subscribe({
      error: () => {
        // Language still switched locally even if API fails
        console.warn('Failed to persist language preference to server');
      },
    });
  }

  /**
   * Load language from user profile (called after login).
   */
  loadUserLanguage(langCode: string): void {
    if (langCode && this.languages.find((l) => l.code === langCode)) {
      this.switchLanguage(langCode);
    }
  }

  /**
   * Get current language label for display.
   */
  getCurrentLanguageLabel(): string {
    const lang = this.languages.find((l) => l.code === this._currentLang());
    return lang?.nativeLabel || 'English';
  }

  private getStoredLanguage(): string {
    return localStorage.getItem(this.STORAGE_KEY) || 'en';
  }
}
