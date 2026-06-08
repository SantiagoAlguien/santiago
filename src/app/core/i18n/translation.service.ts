import { Injectable, computed, signal } from '@angular/core';
import { EN_TRANSLATIONS } from './en';
import { ES_TRANSLATIONS } from './es';

export type Language = 'es' | 'en';

const STORAGE_KEY = 'app_language';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly language = signal<Language>(this.readStoredLanguage());

  readonly currentLanguage = this.language.asReadonly();

  readonly dictionary = computed(() =>
    this.language() === 'es' ? ES_TRANSLATIONS : EN_TRANSLATIONS
  );

  t(key: string): string {
    return this.dictionary()[key] ?? key;
  }

  setLanguage(lang: Language): void {
    this.language.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }

  toggleLanguage(): void {
    this.setLanguage(this.language() === 'es' ? 'en' : 'es');
  }

  private readStoredLanguage(): Language {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'en' ? 'en' : 'es';
  }
}
