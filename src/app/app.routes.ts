import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { PortfolioComponent } from './features/portfolio/portfolio.component';
import { SectionListComponent } from './features/sections/section-list/section-list.component';
import { SectionCreateComponent } from './features/sections/section-create/section-create.component';
import { SectionEditComponent } from './features/sections/section-edit/section-edit.component';
import { BlogListComponent } from './features/blogs/blog-list/blog-list.component';
import { BlogViewComponent } from './features/blogs/blog-view/blog-view.component';
import { BlogCreateComponent } from './features/blogs/blog-create/blog-create.component';
import { BlogEditComponent } from './features/blogs/blog-edit/blog-edit.component';
import { BlogSectionsComponent } from './features/blogs/blog-sections/blog-sections.component';
import { LoginComponent } from './features/auth/login/login.component';

export const routes: Routes = [
  { path: '', component: PortfolioComponent },
  { path: 'blogs', component: BlogListComponent },
  { path: 'blogs/:id', component: BlogViewComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin/blogs/create', component: BlogCreateComponent, canActivate: [authGuard] },
  { path: 'admin/blogs/edit/:id', component: BlogEditComponent, canActivate: [authGuard] },
  { path: 'admin/blogs/:id/sections', component: BlogSectionsComponent, canActivate: [authGuard] },
  { path: 'admin/sections', component: SectionListComponent, canActivate: [authGuard] },
  { path: 'admin/sections/create', component: SectionCreateComponent, canActivate: [authGuard] },
  { path: 'admin/sections/edit/:id', component: SectionEditComponent, canActivate: [authGuard] },
];
