import { useState } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import CrudPage, { StatusBadge } from './components/CrudPage';
import BulkUploadDialog from './components/BulkUploadDialog';
import { CONTENT_STATUS_OPTIONS } from '../lib/contentMapper';
import { STORAGE_BUCKETS } from '../lib/supabase';
import { useAdminList } from './useAdminList';

const defaultValues = {
  image_url: '',
  caption: '',
  description: '',
  category: '',
  album_id: '',
  event_id: '',
  display_order: 0,
  status: 'published',
};

export default function GalleryAdmin() {
  const albums = useAdminList('gallery_albums', 'display_order', true);
  const events = useAdminList('events', 'start_date', false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const albumNames = new Map(albums.map((album) => [album.id, album.title]));

  const fields = [
    {
      name: 'image_url',
      label: 'Image',
      type: 'image',
      bucket: STORAGE_BUCKETS.gallery,
      required: true,
      fullWidth: true,
    },
    {
      name: 'caption',
      label: 'Caption',
      type: 'text',
      placeholder: 'Tree plantation drive',
      help: 'Used as the image alt text for accessibility and in the lightbox.',
    },
    {
      name: 'category',
      label: 'Category',
      type: 'text',
      placeholder: 'Green Care, Discussions…',
    },
    {
      name: 'album_id',
      label: 'Album',
      type: 'select',
      placeholder: 'No album',
      options: albums.map((album) => ({ value: album.id, label: album.title })),
    },
    {
      name: 'event_id',
      label: 'Linked event',
      type: 'select',
      placeholder: 'No linked event',
      options: events.map((event) => ({ value: event.id, label: event.title })),
    },
    {
      name: 'display_order',
      label: 'Display order',
      type: 'number',
      min: 0,
      step: 1,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: CONTENT_STATUS_OPTIONS,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 3,
      fullWidth: true,
    },
  ];

  const columns = [
    {
      key: 'image_url',
      label: 'Photo',
      sortable: false,
      render: (row) => (row.image_url ? (
        <img
          src={row.image_url}
          alt=""
          className="h-12 w-16 rounded-lg border border-[#ECECEC] object-cover"
        />
      ) : '—'),
    },
    {
      key: 'caption',
      label: 'Caption',
      render: (row) => (
        <div className="min-w-44">
          <p className="font-semibold text-[#222]">{row.caption || 'Untitled photo'}</p>
          {row.description && <p className="mt-0.5 line-clamp-1 text-xs text-muted">{row.description}</p>}
        </div>
      ),
    },
    { key: 'category', label: 'Category', render: (row) => row.category || '—' },
    {
      key: 'album_id',
      label: 'Album',
      render: (row) => albumNames.get(row.album_id) ?? '—',
    },
    { key: 'display_order', label: 'Order' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <>
      <CrudPage
        table="gallery_items"
        singular="gallery image"
        description="Upload one image at a time with a caption, or select several photos at once with bulk upload. Published photos appear in the public gallery and lightbox."
        fields={fields}
        columns={columns}
        defaultValues={defaultValues}
        orderBy="display_order"
        ascending={true}
        searchFields={['caption', 'description', 'category']}
        searchPlaceholder="Search gallery…"
        storageFields={['image_url']}
        extraHeaderActions={(
          <button
            type="button"
            onClick={() => setBulkOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#cfdcc9] bg-white px-4 py-2.5 text-sm font-semibold text-[#31523a] transition hover:border-[#3FAE5C]"
          >
            <FiUploadCloud className="h-4 w-4" aria-hidden="true" />
            Bulk upload
          </button>
        )}
        emptyMessage="Upload photos of club activities; they will appear in the public gallery."
        refreshToken={refreshToken}
      />

      <BulkUploadDialog
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onUploaded={() => setRefreshToken((token) => token + 1)}
        albums={albums}
        events={events}
      />
    </>
  );
}
