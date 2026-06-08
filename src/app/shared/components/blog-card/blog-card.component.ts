import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Blog } from '../../../core/models/blog.model';
import { TranslationService } from '../../../core/i18n/translation.service';
import { AuthService } from '../../../services/auth.service';
import { ImageService } from '../../../services/image.service';
import { getBlogDuration, getBlogExcerpt, getBlogImageUrl } from '../../utils/blog.utils';

@Component({
  selector: 'app-blog-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'blog-card-host',
  },
  imports: [RouterLink, DatePipe],
  templateUrl: './blog-card.component.html',
  styleUrl: './blog-card.component.scss',
})
export class BlogCardComponent {
  private readonly imageService = inject(ImageService);
  private readonly i18n = inject(TranslationService);
  private readonly authService = inject(AuthService);

  blog = input.required<Blog>();
  sectionName = input('General');
  showAdminActions = input(false);

  edit = output<number>();
  delete = output<number>();

  readonly imageUrl = computed(() => getBlogImageUrl(this.blog(), this.imageService));
  readonly readTime = computed(() => getBlogDuration(this.blog()));
  readonly excerpt = computed(() => getBlogExcerpt(this.blog().content));
  readonly author = computed(() => {
    const blog = this.blog();
    if (blog.author) {
      return blog.author;
    }
    const username = this.authService.currentUsername();
    if (username) {
      return `${this.i18n.t('blog.by')} ${username}`;
    }
    return `${this.i18n.t('blog.by')} ${blog.userId}`;
  });

  onEdit(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.edit.emit(this.blog().id);
  }

  onDelete(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.delete.emit(this.blog().id);
  }
}
