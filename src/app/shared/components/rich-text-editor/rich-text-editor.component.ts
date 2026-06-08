import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { EditorModule } from 'primeng/editor';
import { TranslationService } from '../../../core/i18n/translation.service';
import { getErrorMessage } from '../../../core/utils/http-error.util';
import { ImageService } from '../../../services/image.service';
import {
  bindQuillContentSync,
  enableQuillImageResize,
  setupQuillImageUpload,
} from '../../utils/quill-image-handler.util';

@Component({
  selector: 'app-rich-text-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, EditorModule],
  template: `
    <p-editor
      [name]="name()"
      [style]="{ height: height() }"
      [ngModel]="content()"
      [ngModelOptions]="{ standalone: true }"
      (ngModelChange)="onContentChange($event)"
      (onInit)="onEditorInit($event)"
    />
  `,
})
export class RichTextEditorComponent {
  private readonly imageService = inject(ImageService);
  private readonly messageService = inject(MessageService);
  private readonly i18n = inject(TranslationService);

  inputId = input('editor');
  name = input('editor');
  content = input('');
  height = input('320px');

  contentChange = output<string>();

  onContentChange(value: string): void {
    this.contentChange.emit(value);
  }

  onEditorInit(event: { editor: import('quill').default }): void {
    const quill = event.editor;
    const sync = (html: string) => this.onContentChange(html);

    bindQuillContentSync(quill, sync);
    setupQuillImageUpload(quill, this.imageService, {
      onContentSync: sync,
      onSuccess: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.i18n.t('toast.success'),
          detail: this.i18n.t('toast.imageUploaded'),
        });
      },
      onError: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: this.i18n.t('toast.error'),
          detail: getErrorMessage(err, this.i18n.t('toast.imageFail')),
        });
      },
    });
    enableQuillImageResize(quill, sync);
  }
}
