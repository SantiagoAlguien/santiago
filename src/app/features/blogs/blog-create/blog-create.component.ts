import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { BlogFormModel } from '../../../core/models/blog.model';
import { TranslationService } from '../../../core/i18n/translation.service';
import { getErrorMessage } from '../../../core/utils/http-error.util';
import { BlogService } from '../../../services/blog.service';
import { ImageService } from '../../../services/image.service';
import {
  ImagePreviewItem,
  ImagePreviewListComponent,
} from '../../../shared/components/image-preview-list/image-preview-list.component';
import { RichTextEditorComponent } from '../../../shared/components/rich-text-editor/rich-text-editor.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { buildDuracion } from '../../../shared/utils/blog.utils';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-blog-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    FormsModule,
    ButtonModule,
    InputTextModule,
    FileUploadModule,
    ToastModule,
    TranslatePipe,
    ImagePreviewListComponent,
    RichTextEditorComponent,
  ],
  templateUrl: './blog-create.component.html',
  styleUrl: './blog-create.component.scss',
})
export class BlogCreateComponent {
  private readonly blogService = inject(BlogService);
  private readonly imageService = inject(ImageService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly i18n = inject(TranslationService);

  readonly submitting = signal(false);
  readonly uploading = signal(false);
  readonly pendingImages = signal<ImagePreviewItem[]>([]);

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

  updateContent(content: string): void {
    this.blogForm.content().value.set(content);
    this.blogForm.duracion().value.set(buildDuracion(content));
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

  onSubmit(event: Event): void {
    event.preventDefault();

    submit(this.blogForm, async () => {
      this.submitting.set(true);
      const model = this.blogModel();
      const duracion = model.duracion || buildDuracion(model.content);
      try {
        await firstValueFrom(
          this.blogService.createBlog({
            title: model.title,
            content: model.content,
            sectionIds: model.sectionIds.length ? model.sectionIds : [],
            userId: 1,
            imagesUrl: this.confirmedImageUrls(),
            duracion,
          })
        );
        this.messageService.add({
          severity: 'success',
          summary: this.i18n.t('toast.success'),
          detail: this.i18n.t('toast.blogCreated'),
        });
        this.router.navigate(['/blogs']);
      } catch (err) {
        this.messageService.add({
          severity: 'error',
          summary: this.i18n.t('toast.error'),
          detail: getErrorMessage(err, this.i18n.t('toast.createBlogFail')),
        });
        throw err;
      } finally {
        this.submitting.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/blogs']);
  }
}
