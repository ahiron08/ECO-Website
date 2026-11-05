import CrudPage, { StatusBadge } from './components/CrudPage';
import { CONTENT_STATUS_OPTIONS } from '../lib/contentMapper';
import { STORAGE_BUCKETS } from '../lib/supabase';

const fields = [
  {
    name: 'title',
    label: 'Announcement title',
    type: 'text',
    required: true,
    fullWidth: true,
    placeholder: 'Registrations for Prokriti 6.0 are open',
  },
  {
    name: 'content',
    label: 'Message',
    type: 'textarea',
    rows: 4,
    fullWidth: true,
    help: 'Keep it short — this appears in the homepage announcement strip.',
  },
  {
    name: 'start_date',
    label: 'Show from',
    type: 'date',
    required: true,
  },
  {
    name: 'expiry_date',
    label: 'Show until',
    type: 'date',
    required: true,
    validate: (value, values) => (
      value && values.start_date && value < values.start_date
        ? 'Expiry date cannot be before the start date.'
        : ''
    ),
  },
  {
    name: 'image_url',
    label: 'Image (optional)',
    type: 'image',
    bucket: STORAGE_BUCKETS.announcements,
    fullWidth: true,
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: CONTENT_STATUS_OPTIONS,
    help: 'Announcements only appear publicly while published and inside the date window.',
  },
];

const columns = [
  {
    key: 'title',
    label: 'Announcement',
    render: (row) => (
      <div className="min-w-52">
        <p className="font-semibold text-[#222]">{row.title}</p>
        {row.content && <p className="mt-0.5 line-clamp-1 text-xs text-muted">{row.content}</p>}
      </div>
    ),
  },
  {
    key: 'start_date',
    label: 'Window',
    render: (row) => (
      <span className="whitespace-nowrap text-sm">
        {row.start_date || '—'} → {row.expiry_date || '—'}
      </span>
    ),
  },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];

const defaultValues = {
  title: '',
  content: '',
  start_date: '',
  expiry_date: '',
  image_url: '',
  status: 'draft',
};

export default function AnnouncementsAdmin() {
  return (
    <CrudPage
      table="announcements"
      singular="announcement"
      description="Share short notices on the homepage. Schedule them with a start and expiry date, then publish when ready."
      fields={fields}
      columns={columns}
      defaultValues={defaultValues}
      orderBy="start_date"
      ascending={false}
      searchFields={['title', 'content']}
      searchPlaceholder="Search announcements…"
      storageFields={['image_url']}
      emptyMessage="Create a dated announcement to show a notice on the homepage."
    />
  );
}
