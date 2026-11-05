import { slugify } from '../lib/contentMapper.js';

export function toDatetimeLocal(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function buildFormValues(fields, record = {}) {
  const values = {};

  fields.forEach((field) => {
    const raw = record[field.name];

    if (field.type === 'datetime') {
      values[field.name] = toDatetimeLocal(raw);
    } else if (field.type === 'checkbox') {
      values[field.name] = Boolean(raw);
    } else {
      values[field.name] = raw ?? '';
    }
  });

  return values;
}

/** Convert a form value into what PostgREST/Postgres should receive. */
export function normaliseFieldValue(field, value) {
  if (field.type === 'checkbox') return Boolean(value);

  if (field.type === 'number') {
    if (value === '' || value == null) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  if (field.type === 'datetime') {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  if (field.type === 'date') {
    return value || null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  return value ?? null;
}

export function validateFields(fields, values) {
  const errors = {};

  fields.forEach((field) => {
    if (field.type !== 'checkbox' && field.required) {
      const value = values[field.name];
      if (value == null || String(value).trim() === '') {
        errors[field.name] = `${field.label} is required.`;
      }
    }

    if (typeof field.validate === 'function') {
      const message = field.validate(values[field.name], values);
      if (message) errors[field.name] = message;
    }
  });

  return errors;
}

/** Build an insert/update payload; auto-fill a missing slug from the title. */
export function preparePayload(fields, values) {
  const payload = {};

  fields.forEach((field) => {
    if (field.readOnly) return;
    payload[field.name] = normaliseFieldValue(field, values[field.name]);
  });

  const slugField = fields.find((field) => field.name === 'slug');
  if (slugField && !payload.slug) {
    const source = slugField.slugSource ?? 'title';
    payload.slug = slugify(values[source] ?? values.title ?? values.name ?? 'content');
  }

  return payload;
}

export function friendlyDatabaseError(error) {
  const code = error?.code;

  if (code === '23505') {
    return 'A record with that slug or unique value already exists. Adjust the slug and try again.';
  }

  if (code === '23503') {
    return 'A linked record is missing or still in use. Refresh and try again.';
  }

  if (code === '42501' || /row-level security|permission denied/i.test(error?.message ?? '')) {
    return 'The database rejected this change. Your admin session may have expired or you may not have permission.';
  }

  if (code === '23514') {
    return 'Some values are not allowed (check categories, statuses and date ranges).';
  }

  return error?.message || 'Something went wrong. Please try again.';
}
