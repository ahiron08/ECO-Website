import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_MAX_BYTES,
  IMAGE_ACCEPT,
  formatBytes,
  validateImageFile,
} from '../src/lib/imageValidation.js';

const file = (type, size) => ({ name: 'photo.png', type, size });

test('accepts supported image types within the size limit', () => {
  assert.equal(validateImageFile(file('image/webp', 1024)).valid, true);
  assert.ok(IMAGE_ACCEPT.includes('image/png'));
});

test('rejects unsupported types and oversized files', () => {
  assert.equal(validateImageFile(file('application/pdf', 1024)).valid, false);
  assert.equal(validateImageFile(file('image/png', DEFAULT_MAX_BYTES + 1)).valid, false);
  assert.match(validateImageFile(file('image/png', DEFAULT_MAX_BYTES + 1)).error, /too large/);
});

test('rejects a missing file', () => {
  assert.equal(validateImageFile(null).valid, false);
});

test('formats upload sizes for the UI', () => {
  assert.equal(formatBytes(0), '0 KB');
  assert.equal(formatBytes(2048), '2 KB');
  assert.equal(formatBytes(5 * 1024 * 1024), '5.0 MB');
});
