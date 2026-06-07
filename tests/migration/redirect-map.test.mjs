import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildRedirectRecords,
  formatApacheRedirects,
  formatRedirectCsv,
} from '../../tools/migration/redirect-map.mjs';

describe('legacy redirect map export', () => {
  it('keeps only imported public board posts in redirect records', () => {
    const records = buildRedirectRecords([
      { legacyBoard: 'z1_1', legacyPostId: '579', targetBoard: 'news', targetPostId: '42' },
      { legacyBoard: 'z6_2', legacyPostId: '10', targetBoard: 'exclude', targetPostId: '' },
      { legacyBoard: 'z2_1', legacyPostId: '1', targetBoard: 'intro', targetPostId: '' },
    ]);

    assert.deepEqual(records, [
      {
        legacyPath: '/renewal/bbs/board.php?bo_table=z1_1&wr_id=579',
        targetPath: '/bbs/board.php?bo_table=news&wr_id=42',
        legacyBoard: 'z1_1',
        legacyPostId: 579,
        targetBoard: 'news',
        targetPostId: 42,
      },
    ]);
  });

  it('excludes migrated posts that still require operator review from redirects', () => {
    const records = buildRedirectRecords([
      { legacyBoard: 'z5_4', legacyPostId: '77', targetBoard: 'news', targetPostId: '177', wr_7: 'review_required' },
      { legacyBoard: 'z1_1', legacyPostId: '579', targetBoard: 'news', targetPostId: '42', wr_7: '' },
    ]);

    assert.deepEqual(records, [
      {
        legacyPath: '/renewal/bbs/board.php?bo_table=z1_1&wr_id=579',
        targetPath: '/bbs/board.php?bo_table=news&wr_id=42',
        legacyBoard: 'z1_1',
        legacyPostId: 579,
        targetBoard: 'news',
        targetPostId: 42,
      },
    ]);
  });

  it('excludes review-required posts when the flag is nested in transformed fields', () => {
    const records = buildRedirectRecords([
      {
        legacyBoard: 'z5_4',
        legacyPostId: '77',
        targetBoard: 'news',
        targetPostId: '177',
        fields: { wr_7: 'review_required' },
      },
    ]);

    assert.deepEqual(records, []);
  });

  it('exports redirect records as auditable CSV', () => {
    const csv = formatRedirectCsv([
      {
        legacyPath: '/renewal/bbs/board.php?bo_table=z1_1&wr_id=579',
        targetPath: '/bbs/board.php?bo_table=news&wr_id=42',
        legacyBoard: 'z1_1',
        legacyPostId: 579,
        targetBoard: 'news',
        targetPostId: 42,
      },
    ]);

    assert.equal(
      csv,
      [
        'legacyPath,targetPath,legacyBoard,legacyPostId,targetBoard,targetPostId',
        '"/renewal/bbs/board.php?bo_table=z1_1&wr_id=579","/bbs/board.php?bo_table=news&wr_id=42",z1_1,579,news,42',
      ].join('\n'),
    );
  });

  it('exports Apache rewrite rules that match legacy board query strings', () => {
    const rules = formatApacheRedirects([
      {
        legacyPath: '/renewal/bbs/board.php?bo_table=z1_1&wr_id=579',
        targetPath: '/bbs/board.php?bo_table=news&wr_id=42',
      },
    ]);

    assert.equal(
      rules,
      [
        'RewriteEngine On',
        'RewriteCond %{QUERY_STRING} (^|&)bo_table=z1_1(&|$)',
        'RewriteCond %{QUERY_STRING} (^|&)wr_id=579(&|$)',
        'RewriteRule ^renewal/bbs/board\\.php$ /bbs/board.php?bo_table=news&wr_id=42 [R=301,L,NE]',
      ].join('\n'),
    );
  });
});
