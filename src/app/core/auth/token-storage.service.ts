import { Injectable, signal } from '@angular/core';

export const TOKEN_KEY = 'auth_token';
export const USERNAME_KEY = 'auth_username';
export const ROLE_KEY = 'auth_role';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly tokenSignal = signal<string | null>(this.readToken());

  readonly token = this.tokenSignal.asReadonly();
  private readonly roleSignal = signal<string | null>(this.readRole());

  readonly role = this.roleSignal.asReadonly();

  getToken(): string | null {
    const stored = this.readToken();
    if (stored !== this.tokenSignal()) {
      this.tokenSignal.set(stored);
    }
    return stored;
  }

  setToken(token: string, username: string, role?: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USERNAME_KEY, username);
    if (role) {
      localStorage.setItem(ROLE_KEY, role);
    }
    this.tokenSignal.set(token);
    this.roleSignal.set(role ?? null);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(ROLE_KEY);
    this.tokenSignal.set(null);
    this.roleSignal.set(null);
  }

  getUsername(): string | null {
    return localStorage.getItem(USERNAME_KEY);
  }

  getRole(): string | null {
    return this.roleSignal();
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

  private readRole(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(ROLE_KEY);
  }
}
