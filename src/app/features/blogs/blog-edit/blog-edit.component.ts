import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { BlogFormModel } from '../../../core/models/blog.model';
import { Section } from '../../../core/models/section.model';
import { TranslationService } from '../../../core/i18n/translation.service';
import { getErrorMessage } from '../../../core/utils/http-error.util';
import { BlogService } from '../../../services/blog.service';
import { ImageService } from '../../../services/image.service';
import { SectionService } from '../../../services/section.service';
import {
  ImagePreviewItem,
  ImagePreviewListComponent,
} from '../../../shared/components/image-preview-list/image-preview-list.component';
import { RichTextEditorComponent } from '../../../shared/components/rich-text-editor/rich-text-editor.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { buildDuracion, getBlogExcerpt } from '../../../shared/utils/blog.utils';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-blog-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    FormsModule,
    ButtonModule,
    FileUploadModule,
    InputTextModule,
    ToastModule,
    TranslatePipe,
    ImagePreviewListComponent,
    RichTextEditorComponent,
  ],
  templateUrl: './blog-edit.component.html',
  styleUrl: './blog-edit.component.scss',
})
export class BlogEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly blogService = inject(BlogService);
  private readonly sectionService = inject(SectionService);
  private readonly imageService = inject(ImageService);
  private readonly messageService = inject(MessageService);
  private readonly i18n = inject(TranslationService);

  readonly blogSections = signal<Section[]>([]);
  readonly submitting = signal(false);
  readonly uploading = signal(false);
  readonly loading = signal(true);
  readonly pendingImages = signal<ImagePreviewItem[]>([]);
  private blogId = 0;
  private userId = 1;

  readonly blogModel = signal<BlogFormModel>({
    title: '',
    content: '',
    sectionIds: [],
    imagesUrl: [],
    duracion: '',
  });

  readonly blogForm = form(this.blogModel, (schemaPath) => {
    required(schemaPath.title, { message: 'form.titleRequired' });
    required(schemaPath.content, { message: 'form.contentRequired' });
  });

  ngOnInit(): void {
    this.blogId = Number(this.route.snapshot.paramMap.get('id'));

    if (!isNaN(this.blogId)) {
      this.loadBlogData();
    }
  }

  loadBlogData(): void {
    this.blogService.getBlogById(this.blogId).subscribe({
      next: (blog) => {
        this.userId = blog.userId;
        this.blogModel.set({
          title: blog.title,
          content: blog.content,
          sectionIds: blog.sectionIds ?? [],
          imagesUrl: blog.imagesUrl ?? [],
          duracion: blog.duracion ?? buildDuracion(blog.content),
        });
        this.pendingImages.set(
          (blog.imagesUrl ?? []).map((fileName) => ({
            fileName,
            previewUrl: this.imageService.getImageUrl(fileName),
          }))
        );
        this.loading.set(false);
        this.loadBlogSections();
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

  loadBlogSections(): void {
    this.blogService.getBlogSections(this.blogId).subscribe({
      next: (sections) => {
        this.blogSections.set(sections);
        this.blogModel.update((m) => ({
          ...m,
          sectionIds: sections.map((s) => s.id),
        }));
      },
      error: () => this.blogSections.set([]),
    });
  }

  updateContent(content: string): void {
    this.blogForm.content().value.set(content);
    if (!this.blogForm.duracion().dirty()) {
      this.blogForm.duracion().value.set(buildDuracion(content));
    }
  }

  sectionExcerpt(description: string): string {
    return getBlogExcerpt(description, 100);
  }

  onImageSelect(event: { files: File[] }): void {
    const file = event.files[0];
    if (!file) return;

    this.uploading.set(true);
    this.imageService.uploadImageForPreview(file).subscribe({
      next: ({ fileName, previewUrl }) => {
        this.uploading.set(false);
        this.pendingImages.update((items) => [...items, { fileName, previewUrl }]);
        this.messageService.add({
          severity: 'success',
          summary: this.i18n.t('toast.success'),
          detail: this.i18n.t('toast.imageUploaded'),
        });
      },
      error: (err) => {
        this.uploading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: this.i18n.t('toast.error'),
          detail: getErrorMessage(err, this.i18n.t('toast.imageFail')),
        });
      },
    });
  }

  discardImage(fileName: string): void {
    this.pendingImages.update((items) => items.filter((item) => item.fileName !== fileName));
  }

  confirmedImageUrls(): string[] {
    return this.pendingImages().map((item) => item.fileName);
  }

  manageSections(): void {
    this.router.navigate(['/admin/blogs', this.blogId, 'sections']);
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    submit(this.blogForm, async () => {
      this.submitting.set(true);
      const model = this.blogModel();
      const sectionIds = this.blogSections().map((s) => s.id);
      const duracion = model.duracion || buildDuracion(model.content);
      try {
        await firstValueFrom(
          this.blogService.updateBlog(this.blogId, {
            title: model.title,
            content: model.content,
            sectionIds,
            userId: this.userId,
            imagesUrl: this.confirmedImageUrls(),
            duracion,
          })
        );
        this.messageService.add({
          severity: 'success',
          summary: this.i18n.t('toast.success'),
          detail: this.i18n.t('toast.blogUpdated'),
        });
        this.router.navigate(['/blogs', this.blogId]);
      } catch (err) {
        this.messageService.add({
          severity: 'error',
          summary: this.i18n.t('toast.error'),
          detail: getErrorMessage(err, this.i18n.t('toast.updateBlogFail')),
        });
        throw err;
      } finally {
        this.submitting.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/blogs', this.blogId]);
  }
}
