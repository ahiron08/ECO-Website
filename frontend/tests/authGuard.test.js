import test from 'node:test';
import assert from 'node:assert/strict';
import { decideAdminAccess } from '../src/admin/authGuard.js';

const session = { user: { id: 'user-1' } };

test('setup wins when Supabase is not configured', () => {
  assert.equal(decideAdminAccess({ configured: false, loading: true, session }), 'setup');
});

test('loading blocks rendering until the admin lookup finishes', () => {
  assert.equal(decideAdminAccess({ configured: true, loading: true, session, adminRecord: null }), 'loading');
});

test('an unfinished admin lookup is treated as loading', () => {
  assert.equal(
    decideAdminAccess({ configured: true, loading: false, session, adminRecord: undefined }),
    'loading',
  );
});

test('missing session redirects to login', () => {
  assert.equal(decideAdminAccess({ configured: true, loading: false, session: null }), 'login');
});

test('signed-in users without an admin record are denied', () => {
  assert.equal(decideAdminAccess({ configured: true, loading: false, session, adminRecord: null }), 'denied');
});

test('inactive administrators are denied', () => {
  assert.equal(
    decideAdminAccess({ configured: true, loading: false, session, adminRecord: { is_active: false } }),
    'denied',
  );
});

test('active administrators are allowed', () => {
  assert.equal(
    decideAdminAccess({ configured: true, loading: false, session, adminRecord: { is_active: true } }),
    'ok',
  );
});
