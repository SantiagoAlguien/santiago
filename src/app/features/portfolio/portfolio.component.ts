import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { Blog } from '../../core/models/blog.model';
import { Section } from '../../core/models/section.model';
import { BlogService } from '../../services/blog.service';
import { SectionService } from '../../services/section.service';
import { VisitService } from '../../services/visit.service';
import { BlogCardComponent } from '../../shared/components/blog-card/blog-card.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/i18n/translation.service';
import { ExperienceComponent } from './components/experience/experience.component';
import { EducationComponent } from './components/education/education.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ContactComponent } from './components/contact/contact.component';

@Component({
  selector: 'app-portfolio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage, BlogCardComponent, LoadingSkeletonComponent, TranslatePipe, ExperienceComponent, EducationComponent, SkillsComponent, ContactComponent],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent implements OnInit {
  private readonly blogService = inject(BlogService);
  private readonly sectionService = inject(SectionService);
  private readonly visitService = inject(VisitService);
  private readonly i18n = inject(TranslationService);

  readonly blogs = signal<Blog[]>([]);
  readonly sections = signal<Section[]>([]);
  readonly loading = signal(true);
  readonly cvVisitCount = signal<number | null>(null);

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

    this.visitService.registerBlogVisit(4).subscribe({ error: () => undefined });
    this.visitService.getBlogVisitCount(4).subscribe({
      next: (count) => this.cvVisitCount.set(count),
      error: () => undefined,
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
