import { useRef, useState } from 'react';
import { FiImage, FiUploadCloud, FiX } from 'react-icons/fi';
import {
  IMAGE_ACCEPT,
  SOURCE_MAX_BYTES,
  formatBytes,
  uploadImage,
  validateImageFile,
} from '../../lib/storage';

export default function ImageUploadField({ id, bucket, value, onChange, error }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const validation = validateImageFile(file, SOURCE_MAX_BYTES);
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    setUploadError('');
    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadImage(bucket, file, setProgress);
      onChange(result.url);
    } catch (uploadFailure) {
      setUploadError(uploadFailure.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={IMAGE_ACCEPT}
        onChange={handleFile}
        className="sr-only"
      />

      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-[#d9e3d5] bg-[#fbfdf9] p-3 sm:flex-row sm:items-center">
        {value ? (
          <img
            src={value}
            alt="Selected upload preview"
            className="h-24 w-24 flex-none rounded-lg border border-[#ECECEC] object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 flex-none items-center justify-center rounded-lg bg-[#eef3ea] text-[#7b947c]">
            <FiImage className="h-8 w-8" aria-hidden="true" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#3FAE5C] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#359a4f] disabled:opacity-60"
            >
              <FiUploadCloud className="h-4 w-4" aria-hidden="true" />
              {value ? 'Replace image' : 'Upload image'}
            </button>

            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#ECECEC] bg-white px-3.5 py-2 text-xs font-semibold text-[#8a3b3b] transition hover:bg-red-50 disabled:opacity-60"
              >
                <FiX className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            )}
          </div>

          <p className="mt-2 text-xs text-muted">
            JPG, PNG, WebP, GIF or AVIF. Up to {formatBytes(SOURCE_MAX_BYTES)} before compression.
          </p>

          {uploading && (
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#e4ebdf]">
                <div
                  className="h-full rounded-full bg-[#3FAE5C] transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs font-medium text-[#45634c]" aria-live="polite">
                Uploading… {progress}%
              </p>
            </div>
          )}

          {value && !uploading && (
            <p className="mt-2 truncate text-xs text-[#6b7f70]" title={value}>
              {value}
            </p>
          )}
        </div>
      </div>

      {(uploadError || error) && (
        <p role="alert" className="mt-1.5 text-sm font-medium text-red-600">
          {uploadError || error}
        </p>
      )}
    </div>
  );
}
