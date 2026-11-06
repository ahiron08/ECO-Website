import CrudPage, { StatusBadge } from './components/CrudPage';
import {
  CONTENT_STATUS_OPTIONS,
  EVENT_CATEGORY_SUGGESTIONS,
  formatEventDate,
} from '../lib/contentMapper';
import { STORAGE_BUCKETS } from '../lib/supabase';

const fields = [
  {
    name: 'title',
    label: 'Event title',
    type: 'text',
    required: true,
    fullWidth: true,
    placeholder: 'Waste To Product',
  },
  {
    name: 'slug',
    label: 'URL slug',
    type: 'text',
    placeholder: 'waste-to-product',
    help: 'Generated from the title when left empty.',
  },
  {
    name: 'event_category',
    label: 'Category',
    type: 'select',
    options: EVENT_CATEGORY_SUGGESTIONS.map((category) => ({ value: category, label: category })),
    placeholder: 'No category',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: CONTENT_STATUS_OPTIONS,
    help: 'Draft and archived events stay hidden from the public site.',
  },
  {
    name: 'start_date',
    label: 'Start date',
    type: 'date',
    required: true,
  },
  {
    name: 'end_date',
    label: 'End date',
    type: 'date',
    help: 'Leave empty for single-day events.',
    validate: (value, values) => (
      value && values.start_date && value < values.start_date
        ? 'End date cannot be before the start date.'
        : ''
    ),
  },
  {
    name: 'time_label',
    label: 'Time',
    type: 'text',
    placeholder: '10:00 AM - 05:00 PM',
  },
  {
    name: 'venue',
    label: 'Venue',
    type: 'text',
    placeholder: 'New Gallery (G301)',
  },
  {
    name: 'organiser',
    label: 'Organiser',
    type: 'text',
    required: true,
    placeholder: 'Eco Club NITS',
  },
  {
    name: 'registration_url',
    label: 'Registration link',
    type: 'url',
    placeholder: 'https://forms.example.com/...',
    fullWidth: true,
  },
  {
    name: 'short_description',
    label: 'Short description',
    type: 'textarea',
    rows: 3,
    fullWidth: true,
    help: 'Used in compact listings.',
  },
  {
    name: 'description',
    label: 'Full description',
    type: 'textarea',
    rows: 6,
    fullWidth: true,
  },
  {
    name: 'poster_url',
    label: 'Event poster',
    type: 'image',
    bucket: STORAGE_BUCKETS.events,
    fullWidth: true,
    help: 'Recommended portrait or landscape poster containing the event details.',
  },
  {
    name: 'results_image_url',
    label: 'Results poster',
    type: 'image',
    bucket: STORAGE_BUCKETS.events,
    fullWidth: true,
    help: 'Shown on the public Events page as a Results button. Leave empty to hide the button.',
  },
  {
    name: 'featured',
    label: 'Feature on homepage',
    type: 'checkbox',
    help: 'Prefer this event for the “What’s happening next” section on the homepage.',
  },
];

const columns = [
  {
    key: 'poster_url',
    label: 'Poster',
    sortable: false,
    render: (row) => (row.poster_url ? (
      <img
        src={row.poster_url}
        alt=""
        className="h-14 w-12 rounded-lg border border-[#ECECEC] object-cover"
      />
    ) : (
      <span className="text-xs text-muted">No poster</span>
    )),
  },
  {
    key: 'title',
    label: 'Event',
    render: (row) => (
      <div className="min-w-44">
        <p className="font-semibold text-[#222]">{row.title}</p>
        <p className="mt-0.5 text-xs text-muted">/{row.slug}</p>
      </div>
    ),
  },
  {
    key: 'start_date',
    label: 'Date',
    render: (row) => formatEventDate(row.start_date, row.end_date) || '—',
  },
  {
    key: 'event_category',
    label: 'Category',
    render: (row) => row.event_category || '—',
  },
  {
    key: 'featured',
    label: 'Featured',
    render: (row) => (row.featured ? (
      <span className="inline-flex rounded-full bg-[#eef7ea] px-2.5 py-1 text-xs font-semibold text-[#2f7a3d]">
        Featured
      </span>
    ) : '—'),
  },
  {
    key: 'status',
    label: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
];

const defaultValues = {
  title: '',
  slug: '',
  event_category: '',
  status: 'draft',
  start_date: '',
  end_date: '',
  time_label: '',
  venue: '',
  organiser: 'Eco Club NITS',
  registration_url: '',
  short_description: '',
  description: '',
  poster_url: '',
  results_image_url: '',
  featured: false,
};

export default function EventsAdmin() {
  return (
    <CrudPage
      table="events"
      singular="event"
      description="Publish an event with its poster, dates, venue and registration link. Published events appear immediately on the Events page and, when featured, on the homepage."
      fields={fields}
      columns={columns}
      defaultValues={defaultValues}
      orderBy="start_date"
      ascending={false}
      searchFields={['title', 'venue', 'event_category']}
      searchPlaceholder="Search events…"
      storageFields={['poster_url', 'results_image_url']}
      emptyMessage="Create the first event, upload its poster and publish it to the public Events page."
    />
  );
}
