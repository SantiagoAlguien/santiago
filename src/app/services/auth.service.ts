import { Injectable, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE } from '../core/config/api.config';
import { TokenStorageService } from '../core/auth/token-storage.service';
import { LoginRequest, LoginResponse } from '../core/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly isAuthenticated = computed(() => !!this.tokenStorage.token());
  readonly currentUsername = computed(() => this.tokenStorage.getUsername());

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE}/auth/login`, credentials).pipe(
      tap((response) => {
        const token = response.token?.trim();
        if (!token) {
          throw new Error('Login response missing token');
        }
        this.tokenStorage.setToken(token, response.username, response.role);
      })
    );
  }

  logout(): void {
    this.tokenStorage.clear();
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }
}
