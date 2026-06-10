import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'app_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly theme = signal<Theme>(this.readStoredTheme());

  readonly currentTheme = this.theme.asReadonly();
  readonly isDark = this.theme.asReadonly();

  constructor() {
    effect(() => {
      const theme = this.theme();
      document.documentElement.setAttribute('data-theme', theme);
    });
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  private readStoredTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' ? 'light' : 'dark';
  }
}