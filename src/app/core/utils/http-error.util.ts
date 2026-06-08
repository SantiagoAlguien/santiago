import { HttpErrorResponse } from '@angular/common/http';

interface SpringErrorBody {
  message?: string;
  error?: string;
}

export function getErrorMessage(error: unknown, fallback = 'Unexpected error'): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  const body = error.error as SpringErrorBody | string | null;

  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (body && typeof body === 'object' && body.message) {
    return body.message;
  }

  if (body && typeof body === 'object' && body.error) {
    return body.error;
  }

  switch (error.status) {
    case 400:
      return 'Invalid request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Access denied';
    case 404:
      return 'Resource not found';
    default:
      return fallback;
  }
}
