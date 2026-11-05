import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiChevronDown,
  FiChevronUp,
  FiEdit3,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi';
import { supabase } from '../../lib/supabase';
import { CONTENT_STATUS_OPTIONS, slugify } from '../../lib/contentMapper';
import { deleteStoredImage } from '../../lib/storage';
import { invalidateContentCache } from '../../hooks/useContent';
import { friendlyDatabaseError, buildFormValues, preparePayload, validateFields } from '../formUtils';
import { useToast } from '../useToast';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import FormField from './FormField';

function StatusBadge({ status }) {
  const styles = {
    published: 'bg-[#e8f5e3] text-[#2f7a3d]',
    draft: 'bg-amber-100 text-amber-700',
    archived: 'bg-gray-100 text-gray-600',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[status] ?? styles.draft}`}>
      {status ?? 'draft'}
    </span>
  );
}

function recordLabelOf(row) {
  return row?.title || row?.name || row?.caption || row?.slug || 'this record';
}

function compareValues(left, right) {
  if (left == null && right == null) return 0;
  if (left == null) return -1;
  if (right == null) return 1;

  if (typeof left === 'number' && typeof right === 'number') return left - right;
  if (typeof left === 'boolean') return left === right ? 0 : (left ? 1 : -1);

  return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
}

export default function CrudPage({
  table,
  singular = 'record',
  fields,
  columns,
  orderBy = 'created_at',
  ascending = false,
  searchFields = ['title'],
  searchPlaceholder,
  statusFilter = true,
  defaultValues = {},
  description,
  storageFields = [],
  emptyMessage,
  extraHeaderActions = null,
  refreshToken = 0,
}) {
  const { notify } = useToast();
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState({ key: null, direction: 'asc' });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState(() => ({ ...defaultValues }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [confirming, setConfirming] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;

    setLoading(true);
    setLoadError(null);

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending, nullsFirst: false });

    if (error) setLoadError(error);
    else setRows(data ?? []);

    setLoading(false);
  }, [ascending, orderBy, table]);

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setValues({ ...defaultValues });
    setErrors({});
    setFormError('');
    setShowForm(true);
  }, [defaultValues]);

  // Quick actions on the dashboard link here with ?new=1.
  const [autoOpened, setAutoOpened] = useState(false);
  useEffect(() => {
    if (searchParams.get('new') === '1' && !autoOpened) {
      setAutoOpened(true);
      openCreate();
    }
  }, [autoOpened, openCreate, searchParams]);

  const openEdit = (row) => {
    setEditing(row);
    setValues(buildFormValues(fields, row));
    setErrors({});
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditing(null);
    setFormError('');
  };

  const handleFieldChange = (field) => (nextValue) => {
    setValues((previous) => {
      const next = { ...previous, [field.name]: nextValue };
      const slugField = fields.find((candidate) => candidate.name === 'slug');
      const source = slugField?.slugSource ?? 'title';

      if (slugField && !editing && field.name === source) {
        const previousAutoSlug = slugify(previous[source] ?? '');
        if (!previous.slug || previous.slug === previousAutoSlug) {
          next.slug = slugify(nextValue);
        }
      }

      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const validationErrors = validateFields(fields, values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = preparePayload(fields, values);
    setSaving(true);

    try {
      if (editing) {
        const { error } = await supabase.from(table).update(payload).eq('id', editing.id);
        if (error) throw error;

        await Promise.all(storageFields.map(async (name) => {
          const previousUrl = editing[name];
          if (previousUrl && previousUrl !== payload[name]) {
            await deleteStoredImage(previousUrl);
          }
        }));

        notify(`${singular} updated.`);
      } else {
        const { error } = await supabase.from(table).insert(payload);
        if (error) throw error;
        notify(`${singular} created.`);
      }

      invalidateContentCache();
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (saveError) {
      setFormError(friendlyDatabaseError(saveError));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirming) return;
    setDeleting(true);

    try {
      const { error } = await supabase.from(table).delete().eq('id', confirming.id);
      if (error) throw error;

      await Promise.all(storageFields.map((name) => deleteStoredImage(confirming[name])));

      notify(`${singular} deleted.`);
      invalidateContentCache();
      setConfirming(null);
      await load();
    } catch (deleteError) {
      notify(friendlyDatabaseError(deleteError), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = rows.filter((row) => {
      const matchesStatus = statusFilter && status !== 'all' ? row.status === status : true;
      const matchesSearch = !query
        || searchFields.some((field) => String(row[field] ?? '').toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });

    if (!sort.key) return result;

    const direction = sort.direction === 'asc' ? 1 : -1;
    return [...result].sort((left, right) => (
      compareValues(left[sort.key], right[sort.key]) * direction
    ));
  }, [rows, search, searchFields, sort, status, statusFilter]);

  const toggleSort = (key) => {
    setSort((current) => (
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    ));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-muted">
          {description}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {extraHeaderActions}
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#3FAE5C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#359a4f]"
          >
            <FiPlus className="h-4 w-4" aria-hidden="true" />
            New {singular}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e3e9e0] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#eef2ec] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder ?? `Search ${table.replaceAll('_', ' ')}…`}
                className="w-full rounded-xl border border-[#ECECEC] bg-white py-2.5 pl-9 pr-3 text-sm text-[#222] outline-none transition focus:border-[#3FAE5C] focus:ring-2 focus:ring-[#3FAE5C]/25"
              />
            </div>

            {statusFilter && (
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                aria-label="Filter by status"
                className="rounded-xl border border-[#ECECEC] bg-white px-3 py-2.5 text-sm text-[#222] outline-none focus:border-[#3FAE5C]"
              >
                <option value="all">All statuses</option>
                {CONTENT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted">
              {filteredRows.length} of {rows.length}
            </span>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              aria-label="Refresh list"
              className="rounded-xl border border-[#ECECEC] p-2 text-[#222] transition hover:border-[#3FAE5C] disabled:opacity-50"
            >
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loadError && (
          <div className="flex flex-col gap-2 border-b border-red-100 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-700">{loadError.message}</p>
            <button
              type="button"
              onClick={load}
              className="self-start rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 sm:self-auto"
            >
              Retry
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f8faf6] text-xs font-semibold uppercase tracking-wide text-[#718074]">
              <tr>
                {columns.map((column) => {
                  const sortable = Boolean(column.key) && column.sortable !== false;
                  return (
                    <th key={column.key ?? column.label} scope="col" className="whitespace-nowrap px-4 py-3">
                      {sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(column.key)}
                          className="inline-flex items-center gap-1 hover:text-[#2f7a3d]"
                        >
                          {column.label}
                          {sort.key === column.key && (
                            sort.direction === 'asc'
                              ? <FiChevronUp className="h-3.5 w-3.5" />
                              : <FiChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      ) : column.label}
                    </th>
                  );
                })}
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2ec]">
              {loading && rows.length === 0 ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td key={column.key ?? column.label} className="px-4 py-4">
                        <div className="h-3 w-24 animate-pulse rounded bg-[#e8eee4]" />
                      </td>
                    ))}
                    <td className="px-4 py-4">
                      <div className="ml-auto h-3 w-16 animate-pulse rounded bg-[#e8eee4]" />
                    </td>
                  </tr>
                ))
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-[#fbfdf9]">
                    {columns.map((column) => (
                      <td key={column.key ?? column.label} className={`px-4 py-3 align-top ${column.className ?? ''}`}>
                        {column.render ? column.render(row) : (row[column.key] ?? '—')}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          aria-label={`Edit ${recordLabelOf(row)}`}
                          className="rounded-lg p-2 text-[#45634c] transition hover:bg-[#eef7ea] hover:text-[#2f7a3d]"
                        >
                          <FiEdit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirming(row)}
                          aria-label={`Delete ${recordLabelOf(row)}`}
                          className="rounded-lg p-2 text-[#8a3b3b] transition hover:bg-red-50"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredRows.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="text-base font-semibold text-[#222]">
              {rows.length === 0 ? `No ${singular}s yet` : 'No records match your filters'}
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">
              {rows.length === 0
                ? (emptyMessage ?? `Create the first ${singular} and it will appear on the public website.`)
                : 'Try a different search term or status.'}
            </p>
            {rows.length === 0 && (
              <button
                type="button"
                onClick={openCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#3FAE5C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#359a4f]"
              >
                <FiPlus className="h-4 w-4" />
                New {singular}
              </button>
            )}
          </div>
        )}
      </div>

      <Modal
        open={showForm}
        title={`${editing ? 'Edit' : 'New'} ${singular}`}
        onClose={closeForm}
        size="lg"
        footer={(
          <>
            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="rounded-xl border border-[#ECECEC] px-5 py-2.5 text-sm font-semibold text-[#222] transition hover:bg-[#f7f9f5] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="crud-form"
              disabled={saving}
              className="rounded-xl bg-[#3FAE5C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#359a4f] disabled:opacity-60"
            >
              {saving ? 'Saving…' : (editing ? 'Save changes' : `Create ${singular}`)}
            </button>
          </>
        )}
      >
        <form id="crud-form" onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {formError && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 sm:col-span-2">
              {formError}
            </p>
          )}

          {fields.map((field) => (
            <div key={field.name} className={field.fullWidth ? 'sm:col-span-2' : ''}>
              <FormField
                field={field}
                value={values[field.name]}
                error={errors[field.name]}
                onChange={handleFieldChange(field)}
                idPrefix={`${table}-form`}
              />
            </div>
          ))}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirming)}
        title={`Delete ${singular}?`}
        message={confirming
          ? `“${recordLabelOf(confirming)}” will be removed from the website. This cannot be undone.`
          : ''}
        onCancel={() => setConfirming(null)}
        onConfirm={handleDelete}
        busy={deleting}
      />
    </div>
  );
}

export { StatusBadge };
