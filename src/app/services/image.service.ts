import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE, IMAGES_DOWNLOAD_BASE, IMAGES_PUBLIC_BASE } from '../core/config/api.config';
import { ImageUploadResponse } from '../core/models/image.model';

export interface UploadedImage {
  fileName: string;
  previewUrl: string;
}

@Injectable({ providedIn: 'root' })
export class ImageService {
  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post(`${API_BASE}/images`, formData, { responseType: 'text' })
      .pipe(map((response) => this.normalizeFileName(this.parseUploadResponse(response))));
  }

  uploadImageForPreview(file: File): Observable<UploadedImage> {
    return this.uploadImage(file).pipe(
      map((fileName) => ({
        fileName,
        previewUrl: this.getImageUrl(fileName),
      }))
    );
  }

  getImageUrl(urlOrFileName: string): string {
    if (!urlOrFileName) {
      return '';
    }
    if (urlOrFileName.startsWith('http')) {
      return urlOrFileName;
    }
    if (urlOrFileName.startsWith('/backend/')) {
      return urlOrFileName;
    }
    if (urlOrFileName.startsWith('/api/images/download/')) {
      return `/backend${urlOrFileName}`;
    }
    if (urlOrFileName.startsWith('/api/')) {
      return `/backend${urlOrFileName}`;
    }
    if (urlOrFileName.startsWith('/images/')) {
      return `/backend${urlOrFileName}`;
    }
    const fileName = this.normalizeFileName(urlOrFileName);
    return `${IMAGES_PUBLIC_BASE}/${fileName}`;
  }

  getImageUrlCandidates(urlOrFileName: string): string[] {
    const fileName = this.normalizeFileName(urlOrFileName);
    return [
      `${IMAGES_PUBLIC_BASE}/${fileName}`,
      `${IMAGES_DOWNLOAD_BASE}/${fileName}`,
      `/backend/api/images/${fileName}`,
    ];
  }

  private parseUploadResponse(response: string): string {
    const trimmed = response.trim();
    if (!trimmed) {
      return '';
    }
    if (trimmed.startsWith('{')) {
      try {
        const json = JSON.parse(trimmed) as ImageUploadResponse;
        return json.downloadUrl ?? json.fileName ?? trimmed;
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }

  normalizeFileName(value: string): string {
    const normalized = value.replace(/\\/g, '/').trim();
    const segments = normalized.split('/');
    return segments[segments.length - 1] ?? normalized;
  }
}
