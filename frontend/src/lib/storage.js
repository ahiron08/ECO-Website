import { slugify } from './contentMapper';
import {
  BUCKET_MAX_BYTES,
  DEFAULT_MAX_BYTES,
  IMAGE_ACCEPT,
  SOURCE_MAX_BYTES,
  formatBytes,
  validateImageFile,
} from './imageValidation';
import {
  isSupabaseConfigured,
  supabase,
  supabaseAnonKey,
  supabaseUrl,
} from './supabase';

export {
  BUCKET_MAX_BYTES,
  DEFAULT_MAX_BYTES,
  IMAGE_ACCEPT,
  SOURCE_MAX_BYTES,
  formatBytes,
  validateImageFile,
};

export function buildStoragePath(file) {
  const month = new Date().toISOString().slice(0, 7);
  const base = slugify(file.name.replace(/\.[^.]+$/, '')).slice(0, 48) || 'image';
  const unique = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${month}/${unique}-${base}.webp`;
}

const WEBP_QUALITY = 0.82;
const MAX_IMAGE_DIMENSION = 2400;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('The selected file could not be decoded as an image.'));
    };
    image.src = url;
  });
}

/**
 * Converts uploaded raster images to bounded WebP files before storage.
 * The source limit is intentionally higher than the storage limit because
 * compression happens before the bucket-size check.
 */
export async function compressImageToWebp(file, maxBytes = DEFAULT_MAX_BYTES) {
  if (!file || file.size > SOURCE_MAX_BYTES) {
    throw new Error(`Image is too large. Maximum source size is ${formatBytes(SOURCE_MAX_BYTES)}.`);
  }

  const image = await loadImage(file);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser cannot prepare this image for upload.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY);
  });
  if (!blob) throw new Error('The image could not be converted to WebP.');
  if (blob.size > maxBytes) {
    throw new Error(`Compressed image is still too large. Maximum is ${formatBytes(maxBytes)}.`);
  }

  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  });
}

export function publicUrlFor(bucket, path) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

function parseStorageError(responseText, status) {
  try {
    const body = JSON.parse(responseText);
    if (body?.message) return body.message;
    if (body?.error) return body.error;
  } catch {
    // Fall through to the generic message.
  }

  if (status === 401 || status === 403) {
    return 'You are not authorised to upload images. Sign in again as an administrator.';
  }

  if (status === 413) return 'The image is too large for this bucket.';

  return 'Image upload failed. Please try again.';
}

/**
 * Uploads with real progress events via XHR (supabase-js does not expose
 * upload progress). Requires an active administrator session; Storage RLS
 * enforces the same rule on the server.
 */
export async function uploadImage(bucket, file, onProgress) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Add the environment variables first.');
  }

  const maxBytes = BUCKET_MAX_BYTES[bucket] ?? DEFAULT_MAX_BYTES;
  const validation = validateImageFile(file, SOURCE_MAX_BYTES);
  if (!validation.valid) throw new Error(validation.error);
  const uploadFile = await compressImageToWebp(file, maxBytes);

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.access_token) {
    throw new Error('Your admin session has expired. Please sign in again.');
  }

  const path = buildStoragePath(uploadFile);
  const endpoint = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`;

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', endpoint);
    request.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
    request.setRequestHeader('apikey', supabaseAnonKey);
    request.setRequestHeader('Content-Type', uploadFile.type);
    request.setRequestHeader('Cache-Control', '31536000');
    request.setRequestHeader('x-upsert', 'false');

    request.upload.onprogress = (event) => {
      if (event.lengthComputable && typeof onProgress === 'function') {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        if (typeof onProgress === 'function') onProgress(100);
        resolve({ bucket, path, url: publicUrlFor(bucket, path) });
        return;
      }

      reject(new Error(parseStorageError(request.responseText, request.status)));
    };

    request.onerror = () => reject(new Error('Image upload failed. Check your connection.'));
    request.send(uploadFile);
  });
}

/** Returns { bucket, path } for images that live in our Supabase Storage. */
export function parseStoragePublicUrl(url) {
  if (!url || typeof url !== 'string') return null;

  const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!match) return null;

  const [, bucket, encodedPath] = match;
  try {
    return { bucket, path: decodeURIComponent(encodedPath.split('?')[0]) };
  } catch {
    return null;
  }
}

/** Best-effort cleanup so deleting a record does not leave orphaned uploads. */
export async function deleteStoredImage(url) {
  if (!supabase) return;

  const target = parseStoragePublicUrl(url);
  if (!target) return;

  try {
    await supabase.storage.from(target.bucket).remove([target.path]);
  } catch {
    // Cleanup is best-effort; the record change must still succeed.
  }
}
