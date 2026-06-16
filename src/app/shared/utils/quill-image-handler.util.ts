import Quill from 'quill';
import { ImageService } from '../../services/image.service';

export interface QuillImageUploadHandlers {
  onSuccess?: () => void;
  onError?: (message: string) => void;
  onContentSync?: (html: string) => void;
}

export function setupQuillImageUpload(
  quill: Quill,
  imageService: ImageService,
  handlers: QuillImageUploadHandlers = {}
): void {
  const toolbar = quill.getModule('toolbar') as
    | { addHandler: (name: string, handler: () => void) => void }
    | undefined;
  if (!toolbar) {
    return;
  }

  toolbar.addHandler('image', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/jpg';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        return;
      }
      uploadQuillImage(quill, imageService, file, handlers);
    };
    input.click();
  });
}

function syncQuillContent(quill: Quill, handlers: QuillImageUploadHandlers): void {
  handlers.onContentSync?.(quill.root.innerHTML);
}

function uploadQuillImage(
  quill: Quill,
  imageService: ImageService,
  file: File,
  handlers: QuillImageUploadHandlers
): void {
  imageService.uploadImageForPreview(file).subscribe({
    next: ({ previewUrl }) => {
      const range = quill.getSelection(true);
      const index = range?.index ?? quill.getLength();
      quill.insertEmbed(index, 'image', previewUrl);
      quill.insertText(index + 1, '\n');
      quill.setSelection(index + 2);
      syncQuillContent(quill, handlers);
      handlers.onSuccess?.();
    },
    error: (err) => {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : 'Image upload failed';
      handlers.onError?.(message);
    },
  });
}

export interface ResizePrompt {
  ask(initialWidth: number, initialHeight: number): Promise<{ width: number; height: number | null } | null>;
}

export function enableQuillImageResize(
  quill: Quill,
  onContentSync?: (html: string) => void,
  resizePrompt?: ResizePrompt
): void {
  quill.root.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement;
    if (target.tagName !== 'IMG') {
      return;
    }
    const img = target as HTMLImageElement;
    const currentWidth = img.style.width
      ? parseInt(img.style.width)
      : img.width || img.naturalWidth;
    const currentHeight = img.style.height && img.style.height !== 'auto'
      ? parseInt(img.style.height)
      : img.height || img.naturalHeight;

    if (resizePrompt) {
      const result = await resizePrompt.ask(currentWidth, currentHeight);
      if (!result) {
        return;
      }
      img.style.width = `${result.width}px`;
      img.style.height = result.height != null ? `${result.height}px` : 'auto';
      img.removeAttribute('width');
      img.removeAttribute('height');
      onContentSync?.(quill.root.innerHTML);
      return;
    }

    const widthInput = window.prompt('Ancho de imagen (px):', String(currentWidth));
    if (!widthInput) {
      return;
    }
    const width = parseInt(widthInput, 10);
    if (isNaN(width) || width <= 0) {
      return;
    }

    const heightInput = window.prompt('Alto     de imagen (px, vacío = automático):', String(currentHeight));
    const height = heightInput ? parseInt(heightInput, 10) : NaN;

    img.style.width = `${width}px`;
    img.style.height = !isNaN(height) && height > 0 ? `${height}px` : 'auto';
    img.removeAttribute('width');
    img.removeAttribute('height');
    onContentSync?.(quill.root.innerHTML);
  });
}


