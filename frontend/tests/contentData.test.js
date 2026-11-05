import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = fileURLToPath(new URL('..', import.meta.url));
const dataDir = join(frontendRoot, 'src', 'data');
const publicDir = join(frontendRoot, 'public');

const readJson = (name) => JSON.parse(readFileSync(join(dataDir, name), 'utf8'));

test('event content has unique ids, titles and usable dates', () => {
  const events = readJson('events.json');

  assert.ok(events.length > 0);
  assert.equal(new Set(events.map((event) => event.id)).size, events.length);

  events.forEach((event) => {
    assert.ok(event.title, `event ${event.id} needs a title`);
    assert.match(event.startDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(event.description);
  });
});

test('team content keeps every committee year and category', () => {
  const { committees } = readJson('team.json');
  const years = Object.keys(committees);

  assert.ok(years.includes('2026'));
  assert.ok(committees['2026'].facultyAdvisor.length > 0);
  assert.ok(committees['2026'].secretary.length > 0);
  assert.ok(committees['2026'].seniorExecutives.length > 0);
  assert.ok(committees['2026'].juniorExecutives.length > 0);

  Object.values(committees).forEach((committee) => {
    Object.values(committee).flat().forEach((member) => {
      assert.ok(member.name, 'every member needs a name');
    });
  });
});

test('gallery, achievements and blogs are not empty', () => {
  assert.ok(readJson('gallery.json').length > 0);
  assert.ok(readJson('achievements.json').length > 0);
  assert.ok(readJson('blogs.json').length > 0);
});

test('every bundled image referenced by JSON exists in public/', () => {
  const paths = [];
  const collect = (value) => {
    if (typeof value === 'string' && value.startsWith('/')) paths.push(value);
  };

  readJson('events.json').forEach((event) => {
    collect(event.image);
    collect(event.resultsImage);
  });
  readJson('gallery.json').forEach((image) => collect(image.src));
  readJson('achievements.json').forEach((achievement) => collect(achievement.image));
  readJson('blogs.json').forEach((blog) => collect(blog.image));

  const { committees } = readJson('team.json');
  Object.values(committees).forEach((committee) => {
    Object.values(committee).flat().forEach((member) => collect(member.image));
  });

  paths.forEach((path) => {
    assert.ok(
      existsSync(join(publicDir, path.replace(/^\//, ''))),
      `missing public asset: ${path}`,
    );
  });
});
