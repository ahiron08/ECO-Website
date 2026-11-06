import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBlogDate,
  formatEventDate,
  makeUniqueSlug,
  mapBlogRow,
  mapEventRow,
  mapGalleryRow,
  mapTeamRows,
  parseContentBlocks,
  slugify,
} from '../src/lib/contentMapper.js';

test('slugify creates URL-safe unique slugs', () => {
  assert.equal(slugify('Waste To Product'), 'waste-to-product');
  assert.equal(slugify('  NIT Silchar — Eco Club!  '), 'nit-silchar-eco-club');
  assert.equal(slugify(''), 'content');
  assert.equal(makeUniqueSlug('waste-to-product', ['waste-to-product']), 'waste-to-product-2');
  assert.equal(
    makeUniqueSlug('waste-to-product', ['waste-to-product', 'waste-to-product-2']),
    'waste-to-product-3',
  );
});

test('formatEventDate renders single and multi-day events', () => {
  assert.equal(formatEventDate('2026-10-27', '2026-10-27'), '27 October, 2026');
  assert.equal(formatEventDate('2026-10-29', null), '29 October, 2026');
  assert.equal(
    formatEventDate('2026-06-03', '2026-06-09'),
    '3 June, 2026 - 9 June, 2026',
  );
  assert.equal(formatEventDate('', null), '');
});

test('mapEventRow produces the shape used by the public event cards', () => {
  const mapped = mapEventRow({
    id: 'uuid-1',
    slug: 'quiz-competition',
    title: 'Quiz Competition',
    organiser: 'Eco Club NITS',
    start_date: '2026-10-27',
    end_date: '2026-10-27',
    time_label: '6:00 PM',
    venue: 'New Gallery (G301)',
    description: 'Test your knowledge.',
    poster_url: 'https://example.com/poster.webp',
    results_image_url: 'https://example.com/results.webp',
    registration_url: 'https://example.com/register',
    featured: true,
    status: 'published',
  });

  assert.equal(mapped.id, 'quiz-competition');
  assert.equal(mapped.organizer, 'Eco Club NITS');
  assert.equal(mapped.date, '27 October, 2026');
  assert.equal(mapped.time, '6:00 PM');
  assert.equal(mapped.location, 'New Gallery (G301)');
  assert.equal(mapped.resultsImage, 'https://example.com/results.webp');
  assert.equal(mapped.featured, true);
});

test('mapEventRow omits unset optional fields', () => {
  const mapped = mapEventRow({ id: '1', slug: 'draft', title: 'Draft' });

  assert.equal(mapped.link, undefined);
  assert.equal(mapped.resultsImage, undefined);
  assert.equal(mapped.image, '');
});

test('mapTeamRows groups members by year and category in display order', () => {
  const mapped = mapTeamRows([
    { id: '2', name: 'Second', academic_year: '2026', category: 'seniorExecutives', display_order: 2 },
    { id: '1', name: 'First', academic_year: '2026', category: 'seniorExecutives', display_order: 1 },
    { id: '3', name: 'Secretary', academic_year: '2026', category: 'secretary', display_order: 0 },
    { id: '4', name: 'Odd category', academic_year: '2025', category: 'somethingElse', display_order: 0 },
  ]);

  assert.deepEqual(Object.keys(mapped.committees).sort(), ['2025', '2026']);
  assert.deepEqual(
    mapped.committees['2026'].seniorExecutives.map((member) => member.name),
    ['First', 'Second'],
  );
  assert.deepEqual(
    mapped.committees['2025'].other.map((member) => member.name),
    ['Odd category'],
  );
  assert.ok(Array.isArray(mapped.committees['2026'].juniorExecutives));
});

test('mapBlogRow formats dates and keeps slugs as public ids', () => {
  const mapped = mapBlogRow({
    id: 'uuid',
    slug: 'a-greener-tomorrow',
    title: 'A Greener Tomorrow',
    published_at: '2026-10-27T18:30:00+00:00',
    cover_image_url: null,
    status: 'published',
  });

  assert.equal(mapped.id, 'a-greener-tomorrow');
  assert.equal(mapped.date, 'October 27, 2026');
  assert.equal(mapped.author, 'Eco Club');
  assert.equal(formatBlogDate('not-a-date'), 'not-a-date');
});

test('mapGalleryRow falls back to a useful alt and category', () => {
  const mapped = mapGalleryRow({ id: '1', image_url: '/gallery/a.webp' });

  assert.equal(mapped.src, '/gallery/a.webp');
  assert.equal(mapped.alt, 'Eco Club gallery photo');
  assert.equal(mapped.category, 'Gallery');
});

test('parseContentBlocks supports paragraphs, headings, quotes, images and arrays', () => {
  const blocks = parseContentBlocks(
    '# Title\n\nFirst line\nsecond line\n\n> A quote\n\n![Alt text](https://example.com/a.webp)',
  );

  assert.deepEqual(blocks, [
    { type: 'heading', level: 1, text: 'Title' },
    { type: 'paragraph', text: 'First line second line' },
    { type: 'quote', text: 'A quote' },
    { type: 'image', alt: 'Alt text', src: 'https://example.com/a.webp' },
  ]);

  assert.deepEqual(parseContentBlocks(['One', '', 'Two']), [
    { type: 'paragraph', text: 'One' },
    { type: 'paragraph', text: 'Two' },
  ]);
});
