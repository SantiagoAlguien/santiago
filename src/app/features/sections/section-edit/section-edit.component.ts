import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { ImageService } from '../../../services/image.service';
import { SectionService } from '../../../services/section.service';
import { RichTextEditorComponent } from '../../../shared/components/rich-text-editor/rich-text-editor.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { extractImageFileNames, mergeImageFileNames, removeImageFromHtml } from '../../../shared/utils/html-images.util';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-section-edit',
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
  templateUrl: './section-edit.component.html',
  styleUrl: './section-edit.component.scss',
})
export class SectionEditComponent implements OnInit {
  private readonly sectionService = inject(SectionService);
  private readonly imageService = inject(ImageService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(TranslationService);

  readonly submitting = signal(false);
  readonly loading = signal(true);
  private sectionId = 0;
  private returnUrl = '/admin/sections';

  readonly sectionModel = signal<SectionFormModel>({
    name: '',
    description: '',
    blogIds: [],
    imagesUrl: [],
  });

  readonly sectionImages = computed(() => {
    const model = this.sectionModel();
    const fileNames = mergeImageFileNames(model.description, model.imagesUrl);
    return fileNames.map((fileName) => ({
      url: fileName,
      previewUrl: this.imageService.getImageUrl(fileName),
    }));
  });

  readonly sectionForm = form(this.sectionModel, (schemaPath) => {
    required(schemaPath.name, { message: 'form.nameRequired' });
    required(schemaPath.description, { message: 'form.descriptionRequired' });
  });

  ngOnInit(): void {
    this.sectionId = Number(this.route.snapshot.paramMap.get('id'));
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      this.returnUrl = returnUrl;
    }

    if (!isNaN(this.sectionId)) {
      this.sectionService.getSectionById(this.sectionId).subscribe({
        next: (section) => {
          this.sectionModel.set({
            name: section.name,
            description: section.description,
            blogIds: section.blogIds ?? [],
            imagesUrl: section.imagesUrl ?? [],
          });
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: this.i18n.t('toast.error'),
            detail: getErrorMessage(err, this.i18n.t('toast.loadSectionFail')),
          });
        },
      });
    }
  }

  updateDescription(description: string): void {
    const imagesUrl = extractImageFileNames(description);
    this.sectionModel.update((m) => ({ ...m, description, imagesUrl }));
    this.sectionForm.description().value.set(description);
  }

  discardImage(url: string): void {
    const description = removeImageFromHtml(this.sectionModel().description, url);
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
        await firstValueFrom(
          this.sectionService.updateSection(this.sectionId, {
            name: model.name,
            description: model.description,
            blogIds: model.blogIds,
            imagesUrl,
          })
        );
        this.messageService.add({
          severity: 'success',
          summary: this.i18n.t('toast.success'),
          detail: this.i18n.t('toast.sectionUpdated'),
        });
        this.navigateBack();
      } catch (err) {
        this.messageService.add({
          severity: 'error',
          summary: this.i18n.t('toast.error'),
          detail: getErrorMessage(err, this.i18n.t('toast.updateSectionFail')),
        });
        throw err;
      } finally {
        this.submitting.set(false);
      }
    });
  }

  navigateBack(): void {
    this.router.navigateByUrl(this.returnUrl);
  }
}
