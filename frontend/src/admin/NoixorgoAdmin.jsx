import CrudPage, { StatusBadge } from './components/CrudPage';
import { CONTENT_STATUS_OPTIONS } from '../lib/contentMapper';
import { STORAGE_BUCKETS } from '../lib/supabase';

const defaultValues = {
  week: '',
  issue_date: '',
  date_label: '',
  cover_image_url: '',
  quote_image_url: '',
  featured: false,
  status: 'published',
};

const fields = [
  { name: 'week', label: 'Week', type: 'number', required: true, min: 1, step: 1 },
  { name: 'issue_date', label: 'Issue date', type: 'date' },
  {
    name: 'date_label',
    label: 'Display date',
    type: 'text',
    placeholder: '12th July, 2026',
    help: 'Preserves the original date label shown on the public page.',
  },
  {
    name: 'cover_image_url',
    label: 'Cover image',
    type: 'image',
    bucket: STORAGE_BUCKETS.noixorgo,
    required: true,
  },
  {
    name: 'quote_image_url',
    label: 'Environmental tip image',
    type: 'image',
    bucket: STORAGE_BUCKETS.noixorgo,
    required: true,
  },
  { name: 'featured', label: 'Featured issue', type: 'checkbox' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: CONTENT_STATUS_OPTIONS,
  },
];

const columns = [
  { key: 'week', label: 'Week' },
  {
    key: 'cover_image_url',
    label: 'Cover',
    sortable: false,
    render: (row) => (
      <img src={row.cover_image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
    ),
  },
  { key: 'date_label', label: 'Date' },
  {
    key: 'featured',
    label: 'Featured',
    render: (row) => (row.featured ? 'Yes' : 'No'),
  },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];

export default function NoixorgoAdmin() {
  return (
    <CrudPage
      table="noixorgo_issues"
      singular="Noixorgo issue"
      description="Manage magazine covers and environmental-tip images shown on the Noixorgo page."
      fields={fields}
      columns={columns}
      defaultValues={defaultValues}
      orderBy="issue_date"
      ascending={false}
      searchFields={['date_label']}
      searchPlaceholder="Search Noixorgo issues…"
      storageFields={['cover_image_url', 'quote_image_url']}
      emptyMessage="Add a Noixorgo issue to publish it on the public page."
    />
  );
}
