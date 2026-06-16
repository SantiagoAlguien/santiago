import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenStorageService } from '../auth/token-storage.service';
import { AuthService } from '../../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const injector = inject(Injector);
  const token = tokenStorage.getToken();

  const excludedPaths = ['/auth/login', '/users/register', '/visits'];
  const isExcluded = excludedPaths.some(p => req.url.includes(p));
  const isGet = req.method === 'GET';

  const authReq =
    token && !isExcluded && !isGet
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isExcluded) {
        injector.get(AuthService).logout();
        injector.get(Router).navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
