import CrudPage, { StatusBadge } from './components/CrudPage';
import { CONTENT_STATUS_OPTIONS } from '../lib/contentMapper';
import { STORAGE_BUCKETS } from '../lib/supabase';

const fields = [
  {
    name: 'title',
    label: 'Achievement',
    type: 'text',
    required: true,
    fullWidth: true,
    placeholder: '166th in UI GreenMetric World University Rankings',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    rows: 4,
    fullWidth: true,
  },
  {
    name: 'image_url',
    label: 'Image',
    type: 'image',
    bucket: STORAGE_BUCKETS.achievements,
    fullWidth: true,
  },
  {
    name: 'achievement_date',
    label: 'Date achieved',
    type: 'date',
  },
  {
    name: 'category',
    label: 'Category',
    type: 'text',
    placeholder: 'Ranking, Award, Milestone…',
  },
  {
    name: 'featured',
    label: 'Feature on homepage',
    type: 'checkbox',
    help: 'Featured achievements are prioritised in the homepage carousel.',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: CONTENT_STATUS_OPTIONS,
  },
];

const columns = [
  {
    key: 'image_url',
    label: 'Image',
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
    key: 'title',
    label: 'Achievement',
    render: (row) => (
      <div className="min-w-52">
        <p className="font-semibold text-[#222]">{row.title}</p>
        {row.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">{row.description}</p>
        )}
      </div>
    ),
  },
  { key: 'category', label: 'Category', render: (row) => row.category || '—' },
  { key: 'achievement_date', label: 'Date', render: (row) => row.achievement_date || '—' },
  {
    key: 'featured',
    label: 'Featured',
    render: (row) => (row.featured ? 'Yes' : '—'),
  },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];

const defaultValues = {
  title: '',
  description: '',
  image_url: '',
  achievement_date: '',
  category: '',
  featured: false,
  status: 'published',
};

export default function AchievementsAdmin() {
  return (
    <CrudPage
      table="achievements"
      singular="achievement"
      description="Celebrate rankings, awards and milestones. Published achievements appear on the homepage carousel."
      fields={fields}
      columns={columns}
      defaultValues={defaultValues}
      orderBy="created_at"
      ascending={false}
      searchFields={['title', 'description', 'category']}
      searchPlaceholder="Search achievements…"
      storageFields={['image_url']}
      emptyMessage="Add the club’s first achievement with an image to showcase it on the homepage."
    />
  );
}
