import test from 'node:test';
import assert from 'node:assert/strict';
import { getNavigationTarget } from '../components/motion/navigation.ts';

const current = 'https://duc.dev/blog?tag=web';

test('section links and the current URL use native navigation', () => {
  assert.equal(getNavigationTarget('#skills', current), null);
  assert.equal(getNavigationTarget('/blog?tag=web#top', current), null);
  assert.equal(getNavigationTarget(current, current), null);
});

test('query-only changes and another local route can transition', () => {
  assert.equal(getNavigationTarget('?tag=mobile', current), '/blog?tag=mobile');
  assert.equal(getNavigationTarget('/#projects', current), '/#projects');
  assert.equal(getNavigationTarget('https://duc.dev/contact', current), '/contact');
});

test('external URLs, downloads schemes and malformed links stay with the browser', () => {
  for (const href of ['https://github.com/TonyDak', 'mailto:duc@example.com', 'tel:123', 'javascript:alert(1)', 'http://[']) {
    assert.equal(getNavigationTarget(href, current), null);
  }
});
