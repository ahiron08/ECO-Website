import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFormValues,
  friendlyDatabaseError,
  normaliseFieldValue,
  preparePayload,
  toDatetimeLocal,
  validateFields,
} from '../src/admin/formUtils.js';

test('normaliseFieldValue converts form inputs for PostgREST', () => {
  assert.equal(normaliseFieldValue({ type: 'text' }, '  hello  '), 'hello');
  assert.equal(normaliseFieldValue({ type: 'text' }, '   '), null);
  assert.equal(normaliseFieldValue({ type: 'number' }, ''), null);
  assert.equal(normaliseFieldValue({ type: 'number' }, '4'), 4);
  assert.equal(normaliseFieldValue({ type: 'date' }, ''), null);
  assert.equal(normaliseFieldValue({ type: 'checkbox' }, 'yes'), true);
  assert.equal(
    normaliseFieldValue({ type: 'datetime' }, '2026-10-27T18:30'),
    new Date('2026-10-27T18:30').toISOString(),
  );
});

test('buildFormValues prepares datetime and checkbox values for editing', () => {
  const values = buildFormValues(
    [
      { name: 'published_at', type: 'datetime' },
      { name: 'featured', type: 'checkbox' },
      { name: 'title', type: 'text' },
    ],
    { published_at: '2026-10-27T12:30:00.000Z', featured: true, title: 'Hello' },
  );

  assert.equal(values.featured, true);
  assert.equal(values.title, 'Hello');
  assert.equal(values.published_at, toDatetimeLocal('2026-10-27T12:30:00.000Z'));
});

test('validateFields enforces required and custom rules', () => {
  const fields = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    {
      name: 'end_date',
      label: 'End date',
      type: 'date',
      validate: (value, values) => (
        value && values.start_date && value < values.start_date ? 'End before start' : ''
      ),
    },
  ];

  assert.deepEqual(validateFields(fields, { title: '', start_date: '2026-10-10' }), {
    title: 'Title is required.',
  });

  assert.deepEqual(
    validateFields(fields, { title: 'Event', start_date: '2026-10-10', end_date: '2026-10-09' }),
    { end_date: 'End before start' },
  );
});

test('preparePayload fills a missing slug and preserves explicit values', () => {
  const fields = [
    { name: 'title', type: 'text' },
    { name: 'slug', type: 'text', slugSource: 'title' },
    { name: 'venue', type: 'text' },
  ];

  const payload = preparePayload(fields, { title: 'Waste To Product', slug: '', venue: '' });
  assert.equal(payload.slug, 'waste-to-product');
  assert.equal(payload.venue, null);

  const explicit = preparePayload(fields, { title: 'New', slug: 'custom-slug', venue: 'Hall' });
  assert.equal(explicit.slug, 'custom-slug');
});

test('friendlyDatabaseError explains common constraint failures', () => {
  assert.match(friendlyDatabaseError({ code: '23505' }), /already exists/);
  assert.match(friendlyDatabaseError({ code: '42501' }), /rejected/);
  assert.match(friendlyDatabaseError({ code: '23514' }), /not allowed/);
  assert.equal(friendlyDatabaseError({ message: 'Network down' }), 'Network down');
});
