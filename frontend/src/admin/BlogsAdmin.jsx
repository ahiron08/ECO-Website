import CrudPage, { StatusBadge } from './components/CrudPage';
import { CONTENT_STATUS_OPTIONS, formatBlogDate } from '../lib/contentMapper';
import { STORAGE_BUCKETS } from '../lib/supabase';

const fields = [
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    required: true,
    fullWidth: true,
    placeholder: 'Towards a Greener Tomorrow',
  },
  {
    name: 'slug',
    label: 'URL slug',
    type: 'text',
    placeholder: 'towards-a-greener-tomorrow',
    help: 'Used in the article URL. Generated from the title when left empty.',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: CONTENT_STATUS_OPTIONS,
  },
  {
    name: 'author',
    label: 'Author',
    type: 'text',
    required: true,
    placeholder: 'Eco Club',
  },
  {
    name: 'category',
    label: 'Category',
    type: 'text',
    placeholder: 'Sustainability',
  },
  {
    name: 'published_at',
    label: 'Publish date',
    type: 'datetime',
    help: 'Required before an article can be published.',
    validate: (value, values) => (
      values.status === 'published' && !value
        ? 'Set a publish date before publishing.'
        : ''
    ),
  },
  {
    name: 'excerpt',
    label: 'Excerpt',
    type: 'textarea',
    rows: 3,
    fullWidth: true,
    help: 'Shown on the blog listing and cards.',
  },
  {
    name: 'cover_image_url',
    label: 'Cover image',
    type: 'image',
    bucket: STORAGE_BUCKETS.blogs,
    fullWidth: true,
  },
  {
    name: 'content',
    label: 'Article content',
    type: 'markdown',
    bucket: STORAGE_BUCKETS.blogs,
    rows: 16,
    fullWidth: true,
    placeholder: 'Write the article here. Separate paragraphs with a blank line.',
  },
];

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
    label: 'Article',
    render: (row) => (
      <div className="min-w-52">
        <p className="font-semibold text-[#222]">{row.title}</p>
        <p className="mt-0.5 text-xs text-muted">/{row.slug}</p>
      </div>
    ),
  },
  { key: 'author', label: 'Author' },
  { key: 'category', label: 'Category', render: (row) => row.category || '—' },
  {
    key: 'published_at',
    label: 'Published',
    render: (row) => formatBlogDate(row.published_at) || 'Not published',
  },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];

const defaultValues = {
  title: '',
  slug: '',
  status: 'draft',
  author: 'Eco Club',
  category: 'Sustainability',
  published_at: '',
  excerpt: '',
  cover_image_url: '',
  content: '',
};

export default function BlogsAdmin() {
  return (
    <CrudPage
      table="blogs"
      singular="blog post"
      description="Write articles with the markdown editor, upload cover and inline images, then publish them to the blog."
      fields={fields}
      columns={columns}
      defaultValues={defaultValues}
      orderBy="published_at"
      ascending={false}
      searchFields={['title', 'author', 'category']}
      searchPlaceholder="Search blog posts…"
      storageFields={['cover_image_url']}
      emptyMessage="Write the first article and publish it to the public blog."
    />
  );
}
