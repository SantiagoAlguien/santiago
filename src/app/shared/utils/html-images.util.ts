export function extractImageUrls(html: string): string[] {
  if (!html) {
    return [];
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const urls = Array.from(doc.querySelectorAll('img'))
    .map((img) => img.getAttribute('src') ?? '')
    .filter(Boolean);
  return [...new Set(urls)];
}

export function extractImageFileNames(html: string): string[] {
  return [...new Set(extractImageUrls(html).map((url) => normalizeImageReference(url)))];
}

export function normalizeImageReference(value: string): string {
  const normalized = value.replace(/\\/g, '/').trim();
  if (!normalized) {
    return '';
  }
  if (normalized.startsWith('http')) {
    const segments = normalized.split('/');
    return segments[segments.length - 1] ?? normalized;
  }
  const segments = normalized.split('/');
  return segments[segments.length - 1] ?? normalized;
}

export function removeImageFromHtml(html: string, url: string): string {
  if (!html || !url) {
    return html;
  }
  const target = normalizeImageReference(url);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') ?? '';
    const srcFile = normalizeImageReference(src);
    if (src === url || srcFile === target || src.endsWith(url) || url.endsWith(src)) {
      img.remove();
    }
  });
  return doc.body.innerHTML;
}

export function resolveHtmlImageSources(
  html: string,
  resolveUrl: (reference: string) => string
): string {
  if (!html) {
    return html;
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (src) {
      img.setAttribute('src', resolveUrl(src));
    }
  });
  return doc.body.innerHTML;
}

export function mergeImageFileNames(html: string, existing: string[]): string[] {
  const fromHtml = extractImageFileNames(html);
  const normalizedExisting = existing.map((item) => normalizeImageReference(item));
  return [...new Set([...normalizedExisting, ...fromHtml])].filter(Boolean);
}
