import test from 'node:test';
import assert from 'node:assert/strict';
import { getTypedText, getTypewriterFrame } from '../components/motion/typewriter.ts';

test('types the headline progressively without dropping punctuation', () => {
  const text = 'Building reliable web and mobile products end to end.';
  assert.equal(getTypedText(text, 8), 'Building');
  assert.equal(getTypedText(text, 100), text);
});

test('keeps Vietnamese combining marks and emoji together', () => {
  assert.equal(getTypedText('Đu\u0301c 🚀', 2), 'Đu\u0301');
  assert.equal(getTypedText('Hi 👨‍💻!', 4), 'Hi 👨‍💻');
});

test('starts empty and clamps negative progress', () => {
  assert.equal(getTypedText('Hello', 0), '');
  assert.equal(getTypedText('Hello', -4), '');
});

test('holds the complete sentence before erasing it', () => {
  assert.deepEqual(getTypewriterFrame('ABC', 300), { text: 'ABC', phase: 'holding' });
  assert.deepEqual(getTypewriterFrame('ABC', 2955), { text: 'AB', phase: 'deleting' });
  assert.deepEqual(getTypewriterFrame('ABC', 3065), { text: '', phase: 'waiting' });
});

test('restarts typing repeatedly without a page reload', () => {
  assert.deepEqual(getTypewriterFrame('ABC', 100), { text: 'A', phase: 'typing' });
  assert.deepEqual(getTypewriterFrame('ABC', 3965), { text: 'A', phase: 'typing' });
  assert.deepEqual(getTypewriterFrame('ABC', 7830), { text: 'A', phase: 'typing' });
});

test('deletes complete graphemes and handles empty copy', () => {
  assert.deepEqual(getTypewriterFrame('Đu\u0301c', 2955), { text: 'Đu\u0301', phase: 'deleting' });
  assert.deepEqual(getTypewriterFrame('', 9000), { text: '', phase: 'waiting' });
});
