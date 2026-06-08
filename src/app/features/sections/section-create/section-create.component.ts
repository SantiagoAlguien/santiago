import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { SectionFormModel } from '../../../core/models/section.model';
import { TranslationService } from '../../../core/i18n/translation.service';
import { getErrorMessage } from '../../../core/utils/http-error.util';
import { BlogService } from '../../../services/blog.service';
import { SectionService } from '../../../services/section.service';
import { RichTextEditorComponent } from '../../../shared/components/rich-text-editor/rich-text-editor.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { extractImageFileNames, mergeImageFileNames } from '../../../shared/utils/html-images.util';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-section-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    FormsModule,
    ToastModule,
    InputTextModule,
    ButtonModule,
    TranslatePipe,
    RichTextEditorComponent,
  ],
  templateUrl: './section-create.component.html',
  styleUrl: './section-create.component.scss',
})
export class SectionCreateComponent implements OnInit {
  private readonly sectionService = inject(SectionService);
  private readonly blogService = inject(BlogService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(TranslationService);

  readonly submitting = signal(false);
  private returnUrl = '/admin/sections';
  private contextBlogId: number | null = null;

  readonly sectionModel = signal<SectionFormModel>({
    name: '',
    description: '',
    blogIds: [],
    imagesUrl: [],
  });

  readonly sectionForm = form(this.sectionModel, (schemaPath) => {
    required(schemaPath.name, { message: 'form.nameRequired' });
    required(schemaPath.description, { message: 'form.descriptionRequired' });
  });

  ngOnInit(): void {
    const blogId = Number(this.route.snapshot.queryParamMap.get('blogId'));
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      this.returnUrl = returnUrl;
    }
    if (!isNaN(blogId)) {
      this.contextBlogId = blogId;
      this.sectionModel.update((m) => ({ ...m, blogIds: [blogId] }));
    }
  }

  updateDescription(description: string): void {
    const imagesUrl = extractImageFileNames(description);
    this.sectionModel.update((m) => ({ ...m, description, imagesUrl }));
    this.sectionForm.description().value.set(description);
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    submit(this.sectionForm, async () => {
      this.submitting.set(true);
      const model = this.sectionModel();
      const imagesUrl = mergeImageFileNames(model.description, model.imagesUrl);
      try {
        const section = await firstValueFrom(
          this.sectionService.createSection({
            name: model.name,
            description: model.description,
            blogIds: model.blogIds,
            imagesUrl,
          })
        );

        if (this.contextBlogId) {
          await this.linkSectionToBlog(this.contextBlogId, section.id);
        }

        this.messageService.add({
          severity: 'success',
          summary: this.i18n.t('toast.success'),
          detail: this.i18n.t('toast.sectionCreated'),
        });
        this.navigateBack();
      } catch (err) {
        this.messageService.add({
          severity: 'error',
          summary: this.i18n.t('toast.error'),
          detail: getErrorMessage(err, this.i18n.t('toast.createSectionFail')),
        });
        throw err;
      } finally {
        this.submitting.set(false);
      }
    });
  }

  private async linkSectionToBlog(blogId: number, sectionId: number): Promise<void> {
    const blog = await firstValueFrom(this.blogService.getBlogById(blogId));
    const sectionIds = [...new Set([...(blog.sectionIds ?? []), sectionId])];
    await firstValueFrom(
      this.blogService.updateBlog(blogId, {
        title: blog.title,
        content: blog.content,
        sectionIds,
        userId: blog.userId,
        imagesUrl: blog.imagesUrl ?? [],
        duracion: blog.duracion ?? '',
      })
    );
  }

  navigateBack(): void {
    this.router.navigateByUrl(this.returnUrl);
  }
}
