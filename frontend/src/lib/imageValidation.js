export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

export const IMAGE_ACCEPT = IMAGE_MIME_TYPES.join(',');

export const BUCKET_MAX_BYTES = {
  'event-posters': 5 * 1024 * 1024,
  'team-photos': 5 * 1024 * 1024,
  'gallery-images': 7.5 * 1024 * 1024,
  'achievement-images': 5 * 1024 * 1024,
  'blog-images': 5 * 1024 * 1024,
  'announcement-images': 5 * 1024 * 1024,
};

export const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

export function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Pure validation shared by the uploader and the automated tests. */
export function validateImageFile(file, maxBytes = DEFAULT_MAX_BYTES) {
  if (!file) return { valid: false, error: 'Choose an image to upload.' };

  if (!IMAGE_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported file type. Use JPG, PNG, WebP, GIF or AVIF.',
    };
  }

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `Image is too large. Maximum size is ${formatBytes(maxBytes)}.`,
    };
  }

  return { valid: true, error: '' };
}
