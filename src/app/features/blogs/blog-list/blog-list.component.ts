import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Blog } from '../../../core/models/blog.model';
import { Section } from '../../../core/models/section.model';
import { TranslationService } from '../../../core/i18n/translation.service';
import { getErrorMessage } from '../../../core/utils/http-error.util';
import { AuthService } from '../../../services/auth.service';
import { BlogService } from '../../../services/blog.service';
import { SectionService } from '../../../services/section.service';
import { BlogCardComponent } from '../../../shared/components/blog-card/blog-card.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-blog-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BlogCardComponent,
    LoadingSkeletonComponent,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    TranslatePipe,
  ],
  providers: [ConfirmationService],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss',
})
export class BlogListComponent implements OnInit {
  private readonly blogService = inject(BlogService);
  private readonly sectionService = inject(SectionService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly i18n = inject(TranslationService);

  readonly blogs = signal<Blog[]>([]);
  readonly sections = signal<Section[]>([]);
  readonly loading = signal(true);
  readonly isAdmin = this.authService.isAuthenticated;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.sectionService.getSections().subscribe({
      next: (sections) => this.sections.set(sections),
      error: () => this.sections.set([]),
    });

    this.blogService.getBlogs().subscribe({
      next: (blogs) => {
        this.blogs.set(blogs);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: this.i18n.t('toast.error'),
          detail: getErrorMessage(err, this.i18n.t('toast.loadBlogsFail')),
        });
      },
    });
  }

  sectionName(sectionIds: number[]): string {
    if (!sectionIds?.length) {
      return this.i18n.t('common.general');
    }
    const names = this.sections()
      .filter((s) => sectionIds.includes(s.id))
      .map((s) => s.name);
    return names.length ? names.join(', ') : this.i18n.t('common.general');
  }

  createBlog(): void {
    this.router.navigate(['/admin/blogs/create']);
  }

  editBlog(id: number): void {
    this.router.navigate(['/admin/blogs/edit', id]);
  }

  deleteBlog(id: number): void {
    this.confirmationService.confirm({
      message: this.i18n.t('common.confirmDelete'),
      header: this.i18n.t('common.confirmHeader'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.i18n.t('common.accept'),
      rejectLabel: this.i18n.t('common.reject'),
      accept: () => {
        this.blogService.deleteBlog(id).subscribe({
          next: () => {
            this.blogs.update((list) => list.filter((b) => b.id !== id));
            this.messageService.add({
              severity: 'success',
              summary: this.i18n.t('toast.success'),
              detail: this.i18n.t('toast.blogDeleted'),
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: this.i18n.t('toast.error'),
              detail: getErrorMessage(err, this.i18n.t('toast.deleteBlogFail')),
            });
          },
        });
      },
    });
  }
}
