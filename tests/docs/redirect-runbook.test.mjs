import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

describe('redirect handoff documentation', () => {
  it('documents query-string aware Apache rewrite output', () => {
    const source = readFileSync('docs/migration/legacy-board-map.md', 'utf8');

    assert.match(source, /Apache `RewriteCond`\/`RewriteRule` 초안/);
    assert.match(source, /bo_table\/wr_id 쿼리스트링/);
    assert.doesNotMatch(source, /RedirectMatch/);
  });
});
