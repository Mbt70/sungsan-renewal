import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

describe('review-required redirect documentation', () => {
  it('documents that review-required migrated posts stay out of redirect handoff output', () => {
    const source = readFileSync('docs/migration/legacy-board-map.md', 'utf8');

    assert.match(source, /wr_7=review_required/);
    assert.match(source, /redirect CSV\/Apache output/);
    assert.match(source, /operator review clears them/);
  });
});
