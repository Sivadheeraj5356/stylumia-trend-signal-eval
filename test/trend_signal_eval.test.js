import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreSignal, validateSignal } from '../src/trend_signal_eval.js';

const signal = {
  trend: 'quiet-luxury-accessories',
  observations: [
    { channel: 'search', deltaPct: 24, windowDays: 14 },
    { channel: 'social', deltaPct: 18, windowDays: 14 },
    { channel: 'commerce', deltaPct: 11, windowDays: 14 }
  ]
};

test('scores multi-channel trend evidence', () => {
  const result = scoreSignal(signal);
  assert.equal(result.ready, true);
  assert.equal(result.confidence, 'medium');
  assert.equal(result.metrics.channels, 3);
});

test('rejects one-channel trend evidence', () => {
  const weak = { trend: 'single-source', observations: [{ channel: 'search', deltaPct: 90, windowDays: 7 }] };
  assert.deepEqual(validateSignal(weak), ['at least two evidence channels are required']);
});

test('rejects invalid observations', () => {
  const broken = { trend: 'bad-window', observations: [{ channel: 'image', deltaPct: 'up', windowDays: 0 }] };
  const result = scoreSignal(broken);
  assert.equal(result.ready, false);
  assert.equal(result.confidence, 'reject');
});
