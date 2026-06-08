import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Blog } from '../../core/models/blog.model';
import { Section } from '../../core/models/section.model';
import { BlogService } from '../../services/blog.service';
import { SectionService } from '../../services/section.service';
import { BlogCardComponent } from '../../shared/components/blog-card/blog-card.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/i18n/translation.service';

@Component({
  selector: 'app-portfolio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage, BlogCardComponent, LoadingSkeletonComponent, TranslatePipe],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent implements OnInit {
  private readonly blogService = inject(BlogService);
  private readonly sectionService = inject(SectionService);
  private readonly i18n = inject(TranslationService);

  readonly blogs = signal<Blog[]>([]);
  readonly sections = signal<Section[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.sectionService.getSections().subscribe({
      next: (sections) => this.sections.set(sections),
      error: () => this.sections.set([]),
    });

    this.blogService.getBlogs().subscribe({
      next: (blogs) => {
        this.blogs.set(blogs.slice(0, 3));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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
}
