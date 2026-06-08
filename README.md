# CV BLOG - Frontend Angular 21 + PrimeNG

Proyecto frontend profesional para un Blog Personal tipo Portfolio construido con Angular 21, PrimeNG y Quill Editor conectado a un backend Java Spring Boot mediante REST API.

---

# Objetivo del Proyecto

Construir una plataforma web moderna tipo blog/portfolio donde:

- Los usuarios puedan visualizar blogs y contenido público.
- El administrador autenticado pueda:
  - Crear blogs
  - Editar blogs
  - Eliminar blogs
  - Crear secciones
  - Editar secciones
  - Eliminar secciones
- El sistema registre visitas.
- El contenido enriquecido se gestione con Quill Editor.

---

# Tecnologías

## Frontend

- Angular 21 Standalone
- PrimeNG
- PrimeFlex
- PrimeIcons
- Angular Router
- Angular Signals
- RxJS
- SCSS/CSS moderno
- Quill Editor
- JWT Authentication

## Backend conectado

- Java 21
- Spring Boot
- MySQL
- JWT Authentication

---

# Versiones usadas

```bash
Angular CLI       : 21.1.4
Angular           : 21.1.4
Node.js           : 24.11.1
TypeScript        : 5.9.3
```

---

# IMPORTANTE

## Referencias del proyecto

Antes de generar componentes o lógica, revisar:

### Diseño UI/UX

Revisar el archivo:

```txt
Group909.pdf
```

Este archivo contiene:

- diseño visual esperado
- estructura de pantallas
- layout
- cards
- formularios
- login
- detalle de blogs
- estructura general del sitio

---

### APIs Backend

Revisar el archivo:

```txt
Santiagoback.postman_collection.json
```

Este archivo contiene:

- endpoints reales
- request bodies
- respuestas esperadas
- autenticación JWT
- CRUD de blogs
- CRUD de secciones
- upload imágenes
- visitas

TODOS los servicios Angular deben construirse usando exactamente esos endpoints.

---

# Arquitectura esperada

```txt
src/
  app/

    core/
      data/
      models/

    features/
      blogs/
      portfolio/

    services/

    shared/

    app.config.ts
    app.routes.ts
    app.ts

  assets/

  main.ts
  styles.css
```

---

# Arquitectura por capas

## core/

Contendrá:

- modelos
- configuración global
- utilidades
- constantes
- environment

---

## features/

Contendrá módulos funcionales:

### blogs/

- listado blogs
- detalle blog
- crear blog
- editar blog

### portfolio/

- información personal
- presentación profesional
- home principal

---

## services/

Servicios HTTP:

- auth.service.ts
- blog.service.ts
- section.service.ts
- image.service.ts
- visit.service.ts

---

## shared/

Componentes reutilizables:

- navbar
- footer
- cards
- loaders
- dialogs
- shared buttons

---

# Diseño esperado

El diseño debe verse:

- moderno
- minimalista
- elegante
- tipo Medium / Dev.to
- responsive
- clean UI
- enterprise
- tecnológico

Inspirado en:

- blogs de ingeniería
- portfolios modernos
- dashboards profesionales

---

# Flujo funcional

# 1. Home Page

La página principal debe mostrar:

- navbar
- logo "CV BLOG"
- botón iniciar sesión
- total visitas
- listado de blogs
- portfolio personal

Consumir:

```http
GET /api/blogs
```

Cada card debe mostrar:

- imagen
- titulo
- descripción corta
- duración lectura
- fecha publicación
- autor

Usar:

- PrimeNG Card
- PrimeNG Button
- PrimeNG Tag

---

# 2. Login

Pantalla moderna responsive.

Campos:

- username
- password

Consumir:

```http
POST /api/auth/login
```

Body:

```json
{
  "username": "testuser",
  "password": "testpass123"
}
```

Respuesta esperada:

```json
{
  "token": "jwt_token",
  "username": "testuser"
}
```

Guardar JWT en:

```txt
localStorage
```

Implementar:

- AuthService
- AuthGuard
- JWT Interceptor

---

# 3. Seguridad

## Rutas públicas

- /
- /blogs
- /blogs/:id
- /login

---

## Rutas privadas

- /admin/blogs/create
- /admin/blogs/edit/:id
- /admin/sections

---

# 4. Blog Detail

Consumir:

```http
GET /api/blogs/{id}
```

Mostrar:

- titulo
- imagen
- fecha publicación
- autor
- contenido
- secciones dinámicas
- visitas

Diseño tipo artículo profesional.

---

# 5. Crear Blog

Formulario usando PrimeNG.

Campos:

- title
- content
- sectionId
- imagesUrl

Consumir:

```http
POST /api/blogs
```

Usar:

- Reactive Forms
- InputText
- Dropdown
- FileUpload

---

# 6. Editor Quill

Las secciones usarán Quill Editor para guardar HTML enriquecido.

Debe soportar:

- negrilla
- cursiva
- títulos
- listas
- colores
- imágenes
- links

Guardar directamente el HTML generado.

Renderizar usando:

```html
<div [innerHTML]="section.description"></div>
```

---

# 7. Crear Secciones

Consumir:

```http
POST /api/sections
```

JSON:

```json
{
  "name": "Technology",
  "description": "<p>Contenido HTML Quill</p>",
  "imagesUrl": []
}
```

---

# 8. Upload Imágenes

Consumir:

```http
POST /api/images
```

multipart/form-data

Tipos permitidos:

- png
- jpg
- jpeg

Usar:

- PrimeNG FileUpload

Mostrar preview.

---

# 9. Gestión Blogs

Dashboard protegido.

Funciones:

- listar blogs
- crear
- editar
- eliminar

Usar:

- PrimeNG Table
- Dialog
- Toast
- ConfirmDialog

---

# 10. Gestión Secciones

Funciones:

- listar
- crear
- editar
- eliminar

Usar:

- PrimeNG Editor
- Dialog
- Table

---

# 11. Registro de Visitas

Consumir:

```http
POST /api/visits
```

JSON:

```json
{
  "ip": "dynamic",
  "blogId": 1
}
```

Mostrar contador total.

---

# Models esperados

## blog.model.ts

```ts
export interface Blog {
  id: number;
  title: string;
  content: string;
  sectionId: number;
  userId: number;
  imagesUrl: string[];
}
```

---

## section.model.ts

```ts
export interface Section {
  id: number;
  name: string;
  description: string;
  imagesUrl: string[];
}
```

---

## auth.model.ts

```ts
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
}
```

---

# Servicios Angular

## auth.service.ts

Funciones:

- login()
- logout()
- isAuthenticated()
- getToken()

---

## blog.service.ts

Funciones:

- getBlogs()
- getBlogById()
- createBlog()
- updateBlog()
- deleteBlog()

---

## section.service.ts

Funciones:

- getSections()
- createSection()
- updateSection()
- deleteSection()

---

## image.service.ts

Funciones:

- uploadImage()

---

## visit.service.ts

Funciones:

- registerVisit()

---

# Interceptor JWT

Agregar automáticamente:

```txt
Authorization: Bearer TOKEN
```

a las peticiones protegidas.

---

# PrimeNG Components requeridos

Instalar:

```bash
npm install primeng primeicons primeflex quill
```

Configurar:

- Button
- Card
- InputText
- Password
- Toolbar
- Menubar
- Dialog
- Toast
- ConfirmDialog
- Table
- Tag
- FileUpload
- Dropdown
- Editor
- Sidebar
- Avatar
- Skeleton
- ProgressSpinner

---

# UX/UI esperado

La aplicación debe incluir:

- loading spinners
- skeleton loading
- validaciones visuales
- manejo de errores
- responsive mobile
- animaciones suaves
- dark/light friendly

---

# Buenas prácticas Angular 21

Usar:

- Standalone Components
- Lazy Loading
- Signals
- Strong Typing
- Reactive Forms
- Modular Architecture

---

# Flujo final esperado

1. Usuario entra al blog
2. Visualiza portfolio
3. Visualiza blogs
4. Abre detalle blog
5. Sistema registra visita
6. Usuario inicia sesión
7. Se habilita dashboard admin
8. Puede crear blogs
9. Puede crear secciones con Quill
10. Puede editar/eliminar contenido

---

# APIs Backend

## Auth

```http
POST /api/auth/login
```

---

## Blogs

```http
GET /api/blogs
POST /api/blogs
GET /api/blogs/{id}
PUT /api/blogs/{id}
DELETE /api/blogs/{id}
```

---

## Sections

```http
GET /api/sections
POST /api/sections
GET /api/sections/{id}
PUT /api/sections/{id}
DELETE /api/sections/{id}
```

---

## Images

```http
POST /api/images
GET /images/{image_file_name}
```

---

## Visits

```http
POST /api/visits
```

---

# Resultado esperado

Generar:

- estructura Angular completa
- componentes completos
- HTML completo
- CSS moderno
- TypeScript completo
- integración PrimeNG
- integración Quill
- interceptors
- guards
- rutas
- dashboard admin
- manejo JWT
- responsive design
- arquitectura enterprise

Generar todos los archivos completos paso a paso.
