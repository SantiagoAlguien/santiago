import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface ImagePreviewItem {
  fileName: string;
  previewUrl: string;
}

@Component({
  selector: 'app-image-preview-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, TranslatePipe],
  templateUrl: './image-preview-list.component.html',
  styleUrl: './image-preview-list.component.scss',
})
export class ImagePreviewListComponent {
  images = input.required<ImagePreviewItem[]>();

  discard = output<string>();

  onDiscard(fileName: string): void {
    this.discard.emit(fileName);
  }
}
