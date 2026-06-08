import { Injectable, signal } from '@angular/core';

export const TOKEN_KEY = 'auth_token';
export const USERNAME_KEY = 'auth_username';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly tokenSignal = signal<string | null>(this.readToken());

  readonly token = this.tokenSignal.asReadonly();

  getToken(): string | null {
    const stored = this.readToken();
    if (stored !== this.tokenSignal()) {
      this.tokenSignal.set(stored);
    }
    return stored;
  }

  setToken(token: string, username: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USERNAME_KEY, username);
    this.tokenSignal.set(token);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    this.tokenSignal.set(null);
  }

  getUsername(): string | null {
    return localStorage.getItem(USERNAME_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private readToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }
}
