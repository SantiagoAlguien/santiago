import { Blog } from '../../core/models/blog.model';
import { ImageService } from '../../services/image.service';

export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / wordsPerMinute));
}

export function getBlogDuration(blog: Blog): string {
  if (blog.duracion) {
    return blog.duracion;
  }
  return `${calculateReadTime(blog.content)} min`;
}

export function getBlogImageUrl(blog: Blog, imageService: ImageService): string | null {
  if (!blog.imagesUrl?.length) {
    return null;
  }
  return imageService.getImageUrl(blog.imagesUrl[0]);
}

export function htmlToPlainText(html: string): string {
  if (!html) {
    return '';
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function getBlogExcerpt(content: string, maxLength = 120): string {
  const plain = htmlToPlainText(content);
  if (plain.length <= maxLength) {
    return plain;
  }
  return `${plain.slice(0, maxLength)}...`;
}

export function buildDuracion(content: string): string {
  return `${calculateReadTime(content)} min read`;
}
