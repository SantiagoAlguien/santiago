import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'loading-skeleton',
  },
  template: `
    <div class="skeleton-grid">
      @for (item of items(); track item) {
        <article class="skeleton-card">
          <div class="skeleton skeleton-image"></div>
          <div class="skeleton-body">
            <div class="skeleton skeleton-tag"></div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text short"></div>
            <div class="skeleton skeleton-meta"></div>
          </div>
        </article>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .skeleton-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
    .skeleton-card {
      background: var(--surface-color);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-md);
    }
    .skeleton-image { height: 12rem; border-radius: 0; }
    .skeleton-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .skeleton-tag { width: 5rem; height: 1rem; }
    .skeleton-title { width: 80%; height: 1.5rem; }
    .skeleton-text { width: 100%; height: 1rem; }
    .skeleton-text.short { width: 70%; }
    .skeleton-meta { width: 60%; height: 0.875rem; }
  `,
})
export class LoadingSkeletonComponent {
  count = input(6);
  readonly items = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
