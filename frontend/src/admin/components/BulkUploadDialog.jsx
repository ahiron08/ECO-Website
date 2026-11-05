import { useEffect, useRef, useState } from 'react';
import { FiImage, FiUploadCloud, FiX } from 'react-icons/fi';
import {
  BUCKET_MAX_BYTES,
  IMAGE_ACCEPT,
  deleteStoredImage,
  formatBytes,
  uploadImage,
  validateImageFile,
} from '../../lib/storage';
import { supabase } from '../../lib/supabase';
import { invalidateContentCache } from '../../hooks/useContent';
import { useToast } from '../useToast';
import Modal from './Modal';

const GALLERY_BUCKET = 'gallery-images';
const maxBytes = BUCKET_MAX_BYTES[GALLERY_BUCKET];

export default function BulkUploadDialog({ open, onClose, onUploaded, albums = [], events = [] }) {
  const { notify } = useToast();
  const inputRef = useRef(null);
  const [items, setItems] = useState([]);
  const [albumId, setAlbumId] = useState('');
  const [eventId, setEventId] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('published');
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (!open) return;
    setItems([]);
    setSummary('');
    setUploading(false);
  }, [open]);

  const updateItem = (id, changes) => {
    setItems((current) => current.map((item) => (
      item.id === id ? { ...item, ...changes } : item
    )));
  };

  const addFiles = (event) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (selected.length === 0) return;

    const accepted = [];
    selected.forEach((file) => {
      const validation = validateImageFile(file, maxBytes);
      if (!validation.valid) {
        notify(`${file.name}: ${validation.error}`, 'error');
        return;
      }

      accepted.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        caption: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
        progress: 0,
        error: '',
        done: false,
      });
    });

    if (accepted.length > 0) {
      setItems((current) => [...current, ...accepted]);
      setSummary('');
    }
  };

  const removeItem = (item) => {
    if (item.preview) URL.revokeObjectURL(item.preview);
    setItems((current) => current.filter((candidate) => candidate.id !== item.id));
  };

  const resetAndClose = () => {
    if (uploading) return;
    items.forEach((item) => item.preview && URL.revokeObjectURL(item.preview));
    setItems([]);
    setSummary('');
    onClose();
  };

  const handleUpload = async () => {
    if (!supabase || items.length === 0 || uploading) return;

    setUploading(true);
    setSummary('');

    let succeeded = 0;
    let failed = 0;
    const baseOrder = Math.floor(Date.now() / 1000);

    for (const [index, item] of items.entries()) {
      if (item.done) {
        succeeded += 1;
        continue;
      }

      updateItem(item.id, { error: '', progress: 0 });
      let uploaded = null;

      try {
        uploaded = await uploadImage(GALLERY_BUCKET, item.file, (progress) => {
          updateItem(item.id, { progress });
        });

        const { error } = await supabase.from('gallery_items').insert({
          image_url: uploaded.url,
          caption: item.caption.trim() || item.file.name,
          category: category.trim() || null,
          album_id: albumId || null,
          event_id: eventId || null,
          status,
          display_order: baseOrder + index,
        });

        if (error) throw error;

        succeeded += 1;
        updateItem(item.id, { done: true, progress: 100 });
      } catch (uploadError) {
        failed += 1;
        // Remove the uploaded file if the database insert failed.
        if (uploaded?.url) await deleteStoredImage(uploaded.url);
        updateItem(item.id, { error: uploadError.message });
      }
    }

    setUploading(false);
    invalidateContentCache();
    onUploaded?.();

    if (failed === 0) {
      notify(`${succeeded} image${succeeded === 1 ? '' : 's'} uploaded and published.`);
      resetAndClose();
      return;
    }

    setSummary(`${succeeded} uploaded, ${failed} failed. Fix the errors below and retry.`);
    notify(`${failed} image${failed === 1 ? '' : 's'} could not be uploaded.`, 'error');
  };

  return (
    <Modal
      open={open}
      title="Bulk upload gallery images"
      description="Select multiple photos, add captions and publish them together."
      onClose={resetAndClose}
      size="xl"
      footer={(
        <>
          <button
            type="button"
            onClick={resetAndClose}
            disabled={uploading}
            className="rounded-xl border border-[#ECECEC] px-5 py-2.5 text-sm font-semibold text-[#222] transition hover:bg-[#f7f9f5] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || items.length === 0}
            className="rounded-xl bg-[#3FAE5C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#359a4f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : `Upload ${items.length} image${items.length === 1 ? '' : 's'}`}
          </button>
        </>
      )}
    >
      <div className="space-y-5">
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          onChange={addFiles}
          className="sr-only"
          aria-label="Choose gallery images"
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d6e2d1] bg-[#fbfdf9] px-4 py-8 text-center transition hover:border-[#3FAE5C] disabled:opacity-60"
        >
          <FiUploadCloud className="h-7 w-7 text-[#3FAE5C]" aria-hidden="true" />
          <span className="text-sm font-semibold text-[#31523a]">Choose images from your device</span>
          <span className="text-xs text-muted">
            JPG, PNG, WebP, GIF or AVIF · up to {formatBytes(maxBytes)} each
          </span>
        </button>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[#222]">Album</span>
            <select
              value={albumId}
              onChange={(event) => setAlbumId(event.target.value)}
              className="w-full rounded-xl border border-[#ECECEC] bg-white px-3.5 py-2.5 text-sm text-[#222] outline-none focus:border-[#3FAE5C]"
            >
              <option value="">No album</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>{album.title}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[#222]">Linked event</span>
            <select
              value={eventId}
              onChange={(event) => setEventId(event.target.value)}
              className="w-full rounded-xl border border-[#ECECEC] bg-white px-3.5 py-2.5 text-sm text-[#222] outline-none focus:border-[#3FAE5C]"
            >
              <option value="">No event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[#222]">Category</span>
            <input
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Competitions, Celebrations…"
              className="w-full rounded-xl border border-[#ECECEC] bg-white px-3.5 py-2.5 text-sm text-[#222] outline-none focus:border-[#3FAE5C]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[#222]">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-[#ECECEC] bg-white px-3.5 py-2.5 text-sm text-[#222] outline-none focus:border-[#3FAE5C]"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>

        {summary && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {summary}
          </p>
        )}

        {items.length > 0 && (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3 rounded-xl border border-[#eef2ec] bg-white p-3">
                <img
                  src={item.preview}
                  alt=""
                  className="h-16 w-16 flex-none rounded-lg border border-[#ECECEC] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium text-[#222]">{item.file.name}</p>
                    <button
                      type="button"
                      onClick={() => removeItem(item)}
                      disabled={uploading}
                      aria-label={`Remove ${item.file.name}`}
                      className="rounded-lg p-1 text-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.caption}
                    onChange={(event) => updateItem(item.id, { caption: event.target.value })}
                    disabled={uploading || item.done}
                    placeholder="Caption"
                    aria-label={`Caption for ${item.file.name}`}
                    className="mt-1.5 w-full rounded-lg border border-[#ECECEC] px-2.5 py-1.5 text-sm outline-none focus:border-[#3FAE5C] disabled:bg-[#f7f9f5]"
                  />
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    <span className={item.error ? 'text-red-600' : 'text-muted'}>
                      {item.error || (item.done ? 'Uploaded' : formatBytes(item.file.size))}
                    </span>
                    {item.progress > 0 && !item.done && !item.error && (
                      <span className="text-[#45634c]">{item.progress}%</span>
                    )}
                  </div>
                  {item.progress > 0 && !item.done && (
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#e4ebdf]">
                      <div
                        className="h-full rounded-full bg-[#3FAE5C]"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {items.length === 0 && (
          <p className="flex items-center justify-center gap-2 text-sm text-muted">
            <FiImage className="h-4 w-4" aria-hidden="true" />
            No images selected yet.
          </p>
        )}
      </div>
    </Modal>
  );
}
