import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { ImageService } from '../../../services/image.service';
import { SectionService } from '../../../services/section.service';
import { VisitService } from '../../../services/visit';
import { BlogCardComponent } from '../../../shared/components/blog-card/blog-card.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { getBlogDuration, getBlogExcerpt } from '../../../shared/utils/blog.utils';
import { resolveHtmlImageSources } from '../../../shared/utils/html-images.util';

@Component({
  selector: 'app-blog-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    RouterLink,
    SafeHtmlPipe,
    TranslatePipe,
    BlogCardComponent,
    LoadingSkeletonComponent,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './blog-view.component.html',
  styleUrl: './blog-view.component.scss',
})
export class BlogViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly blogService = inject(BlogService);
  private readonly sectionService = inject(SectionService);
  private readonly visitService = inject(VisitService);
  private readonly imageService = inject(ImageService);
  private readonly authService = inject(AuthService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly i18n = inject(TranslationService);

  readonly blog = signal<Blog | null>(null);
  readonly blogSections = signal<Section[]>([]);
  readonly allSections = signal<Section[]>([]);
  readonly relatedBlogs = signal<Blog[]>([]);
  readonly loading = signal(true);
  readonly isAdmin = this.authService.isAuthenticated;

  ngOnInit(): void {
    this.sectionService.getSections().subscribe({
      next: (sections) => this.allSections.set(sections),
      error: () => this.allSections.set([]),
    });

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const blogId = Number(params.get('id'));
      if (isNaN(blogId)) {
        this.loading.set(false);
        this.blog.set(null);
        return;
      }

      this.loading.set(true);
      this.blog.set(null);
      this.blogSections.set([]);
      this.relatedBlogs.set([]);
      this.loadBlog(blogId);
      this.visitService.registerVisit(blogId).subscribe({ error: () => undefined });
      window.scrollTo(0, 0);
    });
  }

  loadBlog(id: number): void {
    this.blogService.getBlogById(id).subscribe({
      next: (blog) => {
        this.blog.set(blog);
        this.loading.set(false);
        this.loadBlogSections(id);
        this.loadRelated(id);
      },
      error: (err) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: this.i18n.t('toast.error'),
          detail: getErrorMessage(err, this.i18n.t('toast.loadBlogFail')),
        });
      },
    });
  }

  loadBlogSections(blogId: number): void {
    this.blogService.getBlogSections(blogId).subscribe({
      next: (sections) => this.blogSections.set(sections),
      error: () => this.blogSections.set([]),
    });
  }

  loadRelated(currentId: number): void {
    const currentBlog = this.blog();
    const currentSectionIds = currentBlog?.sectionIds ?? [];

    this.blogService.getBlogs().subscribe({
      next: (blogs) => {
        const others = blogs.filter((b) => b.id !== currentId);
        const shared = others.filter((b) =>
          b.sectionIds?.some((id) => currentSectionIds.includes(id))
        );
        const related = (shared.length > 0 ? shared : others).slice(0, 2);
        this.relatedBlogs.set(related);
      },
      error: () => this.relatedBlogs.set([]),
    });
  }

  excerpt(content: string): string {
    return getBlogExcerpt(content, 200);
  }

  readTime(): string {
    const blog = this.blog();
    return blog ? getBlogDuration(blog) : '';
  }

  heroImage(): string | null {
    const blog = this.blog();
    if (!blog?.imagesUrl?.length) {
      return null;
    }
    const first = blog.imagesUrl.find(Boolean);
    return first ? this.imageService.getImageUrl(first) : null;
  }

  sectionHtml(description: string): string {
    return resolveHtmlImageSources(description, (ref) => this.imageService.getImageUrl(ref));
  }

  author(): string {
    const blog = this.blog();
    if (blog?.author) {
      return blog.author;
    }
    const username = this.authService.currentUsername();
    if (username) {
      return `${this.i18n.t('blog.by')} ${username}`;
    }
    return `${this.i18n.t('blog.by')} ${blog?.userId ?? ''}`;
  }

  sectionNames(sectionIds: number[]): string {
    const names = this.allSections()
      .filter((s) => sectionIds.includes(s.id))
      .map((s) => s.name);
    return names.length ? names.join(', ') : this.i18n.t('common.general');
  }

  editBlog(): void {
    const id = this.blog()?.id;
    if (id) {
      this.router.navigate(['/admin/blogs/edit', id]);
    }
  }

  deleteBlog(): void {
    const id = this.blog()?.id;
    if (!id) return;

    this.confirmationService.confirm({
      message: this.i18n.t('common.confirmDelete'),
      header: this.i18n.t('common.confirmHeader'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.i18n.t('common.accept'),
      rejectLabel: this.i18n.t('common.reject'),
      accept: () => {
        this.blogService.deleteBlog(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.i18n.t('toast.success'),
              detail: this.i18n.t('toast.blogDeleted'),
            });
            this.router.navigate(['/blogs']);
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

  manageSections(): void {
    const id = this.blog()?.id;
    if (id) {
      this.router.navigate(['/admin/blogs', id, 'sections']);
    }
  }
}
