import { useRef, useState } from 'react';
import { FiEye, FiEyeOff, FiImage, FiUploadCloud } from 'react-icons/fi';
import ContentBlocks from '../../components/ContentBlocks';
import { IMAGE_ACCEPT, uploadImage, validateImageFile } from '../../lib/storage';

export default function MarkdownField({ id, field, value, onChange, error }) {
  const textareaRef = useRef(null);
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  const insertText = (text) => {
    const textarea = textareaRef.current;
    const current = String(value ?? '');
    const start = textarea?.selectionStart ?? current.length;
    const end = textarea?.selectionEnd ?? current.length;
    const next = `${current.slice(0, start)}${text}${current.slice(end)}`;

    onChange(next);

    if (textarea) {
      window.requestAnimationFrame(() => {
        textarea.focus();
        const caret = start + text.length;
        textarea.setSelectionRange(caret, caret);
      });
    }
  };

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    setUploadError('');
    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadImage(field.bucket ?? 'blog-images', file, setProgress);
      const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
      const prefix = String(value ?? '').trim() ? '\n\n' : '';
      insertText(`${prefix}![${alt}](${result.url})\n\n`);
    } catch (uploadFailure) {
      setUploadError(uploadFailure.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#ECECEC] bg-white px-3 py-1.5 text-xs font-semibold text-[#31523a] transition hover:border-[#3FAE5C] disabled:opacity-60"
          >
            <FiImage className="h-3.5 w-3.5" aria-hidden="true" />
            Insert image
          </button>
          <button
            type="button"
            onClick={() => setPreview((current) => !current)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#ECECEC] bg-white px-3 py-1.5 text-xs font-semibold text-[#31523a] transition hover:border-[#3FAE5C]"
          >
            {preview ? <FiEyeOff className="h-3.5 w-3.5" aria-hidden="true" /> : <FiEye className="h-3.5 w-3.5" aria-hidden="true" />}
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>

        {uploading && (
          <span className="inline-flex items-center gap-2 text-xs font-medium text-[#45634c]">
            <FiUploadCloud className="h-3.5 w-3.5" aria-hidden="true" />
            Uploading {progress}%
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        onChange={handleImage}
        className="sr-only"
        aria-label="Upload image for article"
      />

      {preview ? (
        <div className="min-h-48 rounded-xl border border-[#ECECEC] bg-[#fbfdf9] p-4">
          {String(value ?? '').trim() ? (
            <ContentBlocks content={value} className="space-y-3 text-sm leading-7 text-muted" />
          ) : (
            <p className="text-sm text-muted">Nothing to preview yet.</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          id={id}
          rows={field.rows ?? 12}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className={`w-full rounded-xl border bg-white px-3.5 py-3 font-mono text-sm leading-6 text-[#222] outline-none transition focus:ring-2 focus:ring-[#3FAE5C]/30 ${
            error ? 'border-red-400' : 'border-[#ECECEC] focus:border-[#3FAE5C]'
          }`}
        />
      )}

      <p className="mt-1.5 text-xs text-muted">
        Separate paragraphs with a blank line. Use <code>## Heading</code>, <code>&gt; quote</code> and
        the image button to add photos.
      </p>

      {(uploadError || error) && (
        <p role="alert" className="mt-1.5 text-sm font-medium text-red-600">
          {uploadError || error}
        </p>
      )}
    </div>
  );
}
