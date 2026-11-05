import CrudPage, { StatusBadge } from './components/CrudPage';
import {
  CONTENT_STATUS_OPTIONS,
  TEAM_CATEGORIES,
  TEAM_CATEGORY_OPTIONS,
} from '../lib/contentMapper';
import { STORAGE_BUCKETS } from '../lib/supabase';

const fields = [
  {
    name: 'name',
    label: 'Full name',
    type: 'text',
    required: true,
    fullWidth: true,
    placeholder: 'Bishal Thakuria',
  },
  {
    name: 'designation',
    label: 'Designation',
    type: 'text',
    placeholder: 'Secretary',
    help: 'Displayed under the member’s name when provided.',
  },
  {
    name: 'category',
    label: 'Team category',
    type: 'select',
    required: true,
    options: TEAM_CATEGORY_OPTIONS,
  },
  {
    name: 'academic_year',
    label: 'Committee year',
    type: 'text',
    required: true,
    placeholder: '2026',
    help: 'Drives the year selector on the public Team page.',
  },
  {
    name: 'batch',
    label: 'Batch',
    type: 'text',
    placeholder: 'Batch 28',
  },
  {
    name: 'department',
    label: 'Department',
    type: 'text',
    placeholder: 'Computer Science & Engineering',
  },
  {
    name: 'email',
    label: 'Email (optional)',
    type: 'email',
    placeholder: 'member@example.com',
  },
  {
    name: 'display_order',
    label: 'Display order',
    type: 'number',
    min: 0,
    step: 1,
    help: 'Lower numbers appear first inside a category.',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: CONTENT_STATUS_OPTIONS,
  },
  {
    name: 'photo_url',
    label: 'Profile photo',
    type: 'image',
    bucket: STORAGE_BUCKETS.team,
    fullWidth: true,
    help: 'A square portrait works best. Junior executives without a photo show a name card.',
  },
  {
    name: 'bio',
    label: 'Short bio (optional)',
    type: 'textarea',
    rows: 3,
    fullWidth: true,
  },
];

const categoryLabels = Object.fromEntries(
  TEAM_CATEGORIES.map(({ key, label }) => [key, label]),
);

const columns = [
  {
    key: 'name',
    label: 'Member',
    render: (row) => (
      <div className="flex min-w-44 items-center gap-3">
        {row.photo_url ? (
          <img
            src={row.photo_url}
            alt=""
            className="h-10 w-10 rounded-full border border-[#ECECEC] object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef7ea] text-xs font-bold text-[#2f7a3d]">
            {(row.name || '?').slice(0, 1).toUpperCase()}
          </span>
        )}
        <div>
          <p className="font-semibold text-[#222]">{row.name}</p>
          {row.designation && <p className="text-xs text-muted">{row.designation}</p>}
        </div>
      </div>
    ),
  },
  {
    key: 'category',
    label: 'Category',
    render: (row) => categoryLabels[row.category] ?? row.category ?? '—',
  },
  { key: 'academic_year', label: 'Year' },
  { key: 'display_order', label: 'Order' },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];

const defaultValues = {
  name: '',
  designation: '',
  category: 'seniorExecutives',
  academic_year: String(new Date().getFullYear()),
  batch: '',
  department: '',
  email: '',
  display_order: 0,
  status: 'published',
  photo_url: '',
  bio: '',
};

export default function TeamAdmin() {
  return (
    <CrudPage
      table="team_members"
      singular="team member"
      description="Add club executives, upload their photos and control the order they appear in each committee year."
      fields={fields}
      columns={columns}
      defaultValues={defaultValues}
      orderBy="academic_year"
      ascending={false}
      searchFields={['name', 'designation', 'academic_year', 'batch']}
      searchPlaceholder="Search team members…"
      storageFields={['photo_url']}
      emptyMessage="Add the first team member and they will appear on the public Team page."
    />
  );
}
