import CrudPage, { StatusBadge } from './components/CrudPage';
import { CONTENT_STATUS_OPTIONS } from '../lib/contentMapper';
import { STORAGE_BUCKETS } from '../lib/supabase';
import { useAdminList } from './useAdminList';

const columns = [
  {
    key: 'cover_image_url',
    label: 'Cover',
    sortable: false,
    render: (row) => (row.cover_image_url ? (
      <img
        src={row.cover_image_url}
        alt=""
        className="h-12 w-16 rounded-lg border border-[#ECECEC] object-cover"
      />
    ) : '—'),
  },
  {
    key: 'title',
    label: 'Album',
    render: (row) => (
      <div className="min-w-44">
        <p className="font-semibold text-[#222]">{row.title}</p>
        <p className="mt-0.5 text-xs text-muted">/{row.slug}</p>
      </div>
    ),
  },
  { key: 'category', label: 'Category', render: (row) => row.category || '—' },
  {
    key: 'display_order',
    label: 'Order',
  },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];

const defaultValues = {
  title: '',
  slug: '',
  description: '',
  cover_image_url: '',
  category: '',
  event_id: '',
  display_order: 0,
  status: 'published',
};

export default function AlbumsAdmin() {
  const events = useAdminList('events', 'start_date', false);
  const eventNames = new Map(events.map((event) => [event.id, event.title]));

  const fields = [
    {
      name: 'title',
      label: 'Album title',
      type: 'text',
      required: true,
      fullWidth: true,
      placeholder: 'Prokriti 6.0',
    },
    {
      name: 'slug',
      label: 'URL slug',
      type: 'text',
      placeholder: 'prokriti-6-0',
      help: 'Generated from the title when left empty.',
    },
    {
      name: 'category',
      label: 'Category',
      type: 'text',
      placeholder: 'Competitions, Celebrations…',
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: CONTENT_STATUS_OPTIONS,
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
      name: 'cover_image_url',
      label: 'Cover image',
      type: 'image',
      bucket: STORAGE_BUCKETS.gallery,
      fullWidth: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 3,
      fullWidth: true,
    },
  ];

  return (
    <CrudPage
      table="gallery_albums"
      singular="album"
      description="Group gallery images into albums and link them to events. Albums are optional — images can also be uploaded directly to the gallery."
      fields={fields}
      columns={[
        ...columns,
        {
          key: 'event_id',
          label: 'Event',
          render: (row) => eventNames.get(row.event_id) ?? '—',
        },
      ]}
      defaultValues={defaultValues}
      orderBy="display_order"
      ascending={true}
      searchFields={['title', 'category']}
      searchPlaceholder="Search albums…"
      storageFields={['cover_image_url']}
      emptyMessage="Create an album to organise photos from an event or category."
    />
  );
}
