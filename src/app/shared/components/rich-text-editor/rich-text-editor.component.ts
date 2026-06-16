import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { EditorModule } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';
import { TranslationService } from '../../../core/i18n/translation.service';
import { getErrorMessage } from '../../../core/utils/http-error.util';
import { ImageService } from '../../../services/image.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import {
  enableQuillImageResize,
  ResizePrompt,
  setupQuillImageUpload,
} from '../../utils/quill-image-handler.util';

@Component({
  selector: 'app-rich-text-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DialogModule, InputTextModule, CheckboxModule, ButtonModule, EditorModule, TranslatePipe],
  template: `
    <p-editor
      [name]="name()"
      [style]="{ height: height() }"
      (onInit)="onEditorInit($event)"
    />
    <p-dialog
      [visible]="resizeVisible()"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '360px' }"
      styleClass="resize-dialog"
      (visibleChange)="onResizeCancel()"
    >
      <ng-template pTemplate="header">
        <span>{{ 'editor.resizeTitle' | translate }}</span>
      </ng-template>
      <div class="resize-grid">
        <div class="field">
          <label for="resizeWidth">{{ 'editor.width' | translate }} (px)</label>
          <input
            id="resizeWidth"
            type="number"
            pInputText
            class="w-full"
            [ngModel]="resizeWidth()"
            (ngModelChange)="onResizeWidthChange($event)"
          />
        </div>
        <div class="field">
          <label for="resizeHeight">{{ 'editor.height' | translate }} (px)</label>
          <input
            id="resizeHeight"
            type="number"
            pInputText
            class="w-full"
            [ngModel]="resizeHeight()"
            (ngModelChange)="onResizeHeightChange($event)"
            [placeholder]="'editor.heightHint' | translate"
          />
        </div>
      </div>
      <div class="resize-aspect">
        <p-checkbox
          [ngModel]="keepAspectRatio()"
          (ngModelChange)="keepAspectRatio.set($event)"
          inputId="keepAspectRatio"
          [binary]="true"
        />
        <label for="keepAspectRatio">{{ 'editor.keepAspect' | translate }}</label>
      </div>
      <div class="resize-actions">
        <button
          pButton
          type="button"
          [label]="'blog.cancel' | translate"
          severity="secondary"
          (click)="onResizeCancel()"
        ></button>
        <button
          pButton
          type="button"
          [label]="'blog.accept' | translate"
          (click)="onResizeAccept()"
        ></button>
      </div>
    </p-dialog>
  `,
  styles: `
    :host :host ::ng-deep .resize-dialog .p-dialog-content { padding: 1.25rem; }
    .resize-grid { display: flex; flex-direction: column; gap: 1rem; }
    .resize-aspect { display: flex; align-items: center; gap: 0.5rem; margin: 0.75rem 0; }
    .resize-aspect label { cursor: pointer; }
    .resize-actions { display: flex; justify-content: center; gap: 0.75rem; margin-top: 1rem; }
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

  private quill: import('quill').default | null = null;

  readonly resizeVisible = signal(false);
  readonly resizeWidth = signal(400);
  readonly resizeHeight = signal<number | null>(null);
  readonly keepAspectRatio = signal(true);

  private resizePromiseResolve: ((value: { width: number; height: number | null } | null) => void) | null = null;
  private originalAspectRatio = 1;

  private readonly resizePrompt: ResizePrompt = {
    ask: (initialWidth: number, initialHeight: number) =>
      new Promise((resolve) => {
        this.resizePromiseResolve = resolve;
        this.originalAspectRatio = initialHeight > 0 ? initialWidth / initialHeight : 1;
        this.keepAspectRatio.set(true);
        this.resizeWidth.set(initialWidth);
        this.resizeHeight.set(initialHeight);
        this.resizeVisible.set(true);
      }),
  };

  constructor() {
    effect(() => {
      const html = this.content();
      if (this.quill && html !== this.quill.root.innerHTML) {
        this.quill.root.innerHTML = html;
      }
    });
  }

  onResizeWidthChange(value: number): void {
    const width = value || 0;
    this.resizeWidth.set(width);
    if (this.keepAspectRatio() && width > 0 && this.originalAspectRatio > 0) {
      this.resizeHeight.set(Math.round(width / this.originalAspectRatio));
    }
  }

  onResizeHeightChange(value: number): void {
    const height = isNaN(value) ? null : value;
    this.resizeHeight.set(height);
    if (this.keepAspectRatio() && height != null && height > 0 && this.originalAspectRatio > 0) {
      this.resizeWidth.set(Math.round(height * this.originalAspectRatio));
    }
  }

  onResizeAccept(): void {
    const width = this.resizeWidth();
    const height = this.resizeHeight();
    if (width > 0) {
      this.resizePromiseResolve?.({ width, height: height != null && height > 0 ? height : null });
    } else {
      this.resizePromiseResolve?.(null);
    }
    this.resizeVisible.set(false);
    this.resizePromiseResolve = null;
  }

  onResizeCancel(): void {
    this.resizePromiseResolve?.(null);
    this.resizeVisible.set(false);
    this.resizePromiseResolve = null;
  }

  onEditorInit(event: { editor: import('quill').default }): void {
    const quill = event.editor;
    this.quill = quill;

    quill.root.innerHTML = this.content();

    const sync = (html: string) => this.contentChange.emit(html);

    quill.on('text-change', () => {
      sync(quill.root.innerHTML);
    });

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
    enableQuillImageResize(quill, sync, this.resizePrompt);
  }
}
