import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Blog } from '../../../core/models/blog.model';
import { Section } from '../../../core/models/section.model';
import { TranslationService } from '../../../core/i18n/translation.service';
import { getErrorMessage } from '../../../core/utils/http-error.util';
import { BlogService } from '../../../services/blog.service';
import { SectionService } from '../../../services/section.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { getBlogExcerpt } from '../../../shared/utils/blog.utils';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-blog-sections',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, ToastModule, ConfirmDialogModule, TranslatePipe],
  providers: [ConfirmationService],
  templateUrl: './blog-sections.component.html',
  styleUrl: './blog-sections.component.scss',
})
export class BlogSectionsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly blogService = inject(BlogService);
  private readonly sectionService = inject(SectionService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly i18n = inject(TranslationService);

  readonly blog = signal<Blog | null>(null);
  readonly sections = signal<Section[]>([]);
  readonly loading = signal(true);
  private blogId = 0;
  private userId = 1;

  ngOnInit(): void {
    this.blogId = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(this.blogId)) {
      this.loadData();
    } else {
      this.loading.set(false);
    }
  }

  loadData(): void {
    this.loading.set(true);
    this.blogService.getBlogById(this.blogId).subscribe({
      next: (blog) => {
        this.blog.set(blog);
        this.userId = blog.userId;
        this.loadSections();
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

  loadSections(): void {
    this.blogService.getBlogSections(this.blogId).subscribe({
      next: (sections) => {
        this.sections.set(sections);
        this.loading.set(false);
      },
      error: () => {
        this.sections.set([]);
        this.loading.set(false);
      },
    });
  }

  sectionExcerpt(description: string): string {
    return getBlogExcerpt(description, 120);
  }

  createSection(): void {
    this.router.navigate(['/admin/sections/create'], {
      queryParams: {
        blogId: this.blogId,
        returnUrl: `/admin/blogs/${this.blogId}/sections`,
      },
    });
  }

  editSection(sectionId: number): void {
    this.router.navigate(['/admin/sections/edit', sectionId], {
      queryParams: { returnUrl: `/admin/blogs/${this.blogId}/sections` },
    });
  }

  deleteSection(section: Section): void {
    this.confirmationService.confirm({
      message: this.i18n.t('common.confirmDelete'),
      header: this.i18n.t('common.confirmHeader'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.i18n.t('common.accept'),
      rejectLabel: this.i18n.t('common.reject'),
      accept: async () => {
        try {
          await firstValueFrom(this.sectionService.deleteSection(section.id));
          const blog = this.blog();
          if (blog) {
            const sectionIds = (blog.sectionIds ?? []).filter((id) => id !== section.id);
            await firstValueFrom(
              this.blogService.updateBlog(this.blogId, {
                title: blog.title,
                content: blog.content,
                sectionIds,
                userId: this.userId,
                imagesUrl: blog.imagesUrl ?? [],
                duracion: blog.duracion ?? '',
              })
            );
          }
          this.sections.update((items) => items.filter((s) => s.id !== section.id));
          this.messageService.add({
            severity: 'success',
            summary: this.i18n.t('toast.success'),
            detail: this.i18n.t('toast.sectionDeleted'),
          });
        } catch (err) {
          this.messageService.add({
            severity: 'error',
            summary: this.i18n.t('toast.error'),
            detail: getErrorMessage(err, this.i18n.t('toast.deleteSectionFail')),
          });
        }
      },
    });
  }

  backToBlogEdit(): void {
    this.router.navigate(['/admin/blogs/edit', this.blogId]);
  }

  backToBlogView(): void {
    this.router.navigate(['/blogs', this.blogId]);
  }
}
