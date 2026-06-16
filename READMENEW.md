# Cambios de Seguridad y API - santiagoback

## Resumen de Cambios

### 1. Autenticación JWT Activada

`JwtAuthenticationFilter.java` ahora activo. Bearer token requerido en endpoints protegidos.

### 2. Reglas de Autorización

| Método | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/blogs/**` | ❌ No |
| GET | `/api/sections/**` | ❌ No |
| GET | `/images/**` | ❌ No |
| POST | `/api/auth/login` | ❌ No |
| POST | `/api/users/register` | ❌ No |
| POST | `/api/visits` | ❌ No |
| POST | `/api/blogs` | ✅ Sí |
| PUT | `/api/blogs/{id}` | ✅ Sí |
| DELETE | `/api/blogs/{id}` | ✅ Sí |
| POST | `/api/sections` | ✅ Sí |
| PUT | `/api/sections/{id}` | ✅ Sí |
| DELETE | `/api/sections/{id}` | ✅ Sí |
| POST | `/api/images` | ✅ Sí |

### 3. CORS Configurado

Permite cualquier origen (`*`) con métodos GET, POST, PUT, DELETE, OPTIONS.

---

## Implementación en Angular

### Login y Almacenamiento del Token

```typescript
// auth.service.ts
login(username: string, password: string): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { username, password });
}

// Guardar token después del login
login(username: string, password: string) {
  this.authService.login(username, password).subscribe({
    next: (res) => {
      localStorage.setItem('token', res.token);
      localStorage.setItem('username', res.username);
      localStorage.setItem('role', res.role);
    }
  });
}
```

### Interceptor HTTP para Adjuntar Token

```typescript
// jwt.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = localStorage.getItem('token');
    const excludedPaths = [
      '/api/auth/login',
      '/api/users/register',
      '/api/visits'
    ];

    const isExcluded = excludedPaths.some(path => req.url.includes(path));
    const isGetRequest = req.method === 'GET';

    if (token && !isExcluded && !isGetRequest) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req);
  }
}
```

### Registrar el Interceptor

```typescript
// app.module.ts o app.config.ts
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
]
```

### Endpoint de Visitas

```typescript
// visit.service.ts
export class VisitService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  recordVisit(blogId: number): Observable<void> {
    const ip = '0.0.0.0'; // backend detecta IP real, enviar placeholder
    return this.http.post<void>(`${this.apiUrl}/visits`, { ip, blogId });
  }
}
```

Uso en componente de blog:

```typescript
// blog-detail.component.ts
ngOnInit() {
  this.blogService.getBlogById(this.id).subscribe(blog => {
    this.blog = blog;
    this.visitService.recordVisit(blog.id).subscribe();
  });
}
```

### Llamadas a Endpoints Protegidos

```typescript
// blog.service.ts - métodos que requieren token
@Injectable({ providedIn: 'root' })
export class BlogService {
  constructor(private http: HttpClient) {}

  // GET - público, no necesita token
  getBlogs(): Observable<BlogResponse[]> {
    return this.http.get<BlogResponse[]>(`${this.apiUrl}/blogs`);
  }

  // POST - requiere token (interceptor lo agrega automáticamente)
  createBlog(data: BlogRequest): Observable<BlogResponse> {
    return this.http.post<BlogResponse>(`${this.apiUrl}/blogs`, data);
  }

  // PUT - requiere token
  updateBlog(id: number, data: BlogRequest): Observable<BlogResponse> {
    return this.http.put<BlogResponse>(`${this.apiUrl}/blogs/${id}`, data);
  }

  // DELETE - requiere token
  deleteBlog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/blogs/${id}`);
  }

  // GET público
  getBlogById(id: number): Observable<BlogResponse> {
    return this.http.get<BlogResponse>(`${this.apiUrl}/blogs/${id}`);
  }
}
```

---

## Flujo Completo

```
1. Usuario visita blog (GET /api/blogs) → público
2. Usuario ve detalle (GET /api/blogs/1) → público
3. Se registra visita (POST /api/visits) → público
4. Admin hace login (POST /api/auth/login) → recibe token
5. Admin crea blog (POST /api/blogs) → Bearer token en header
6. Admin sube imagen (POST /api/images) → Bearer token en header
7. Admin edita blog (PUT /api/blogs/1) → Bearer token en header
```
