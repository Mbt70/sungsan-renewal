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

  it('exports Apache redirect rules for Cafe24 handoff', () => {
    const rules = formatApacheRedirects([
      {
        legacyPath: '/renewal/bbs/board.php?bo_table=z1_1&wr_id=579',
        targetPath: '/bbs/board.php?bo_table=news&wr_id=42',
      },
    ]);

    assert.equal(
      rules,
      'RedirectMatch 301 ^/renewal/bbs/board\\.php\\?bo_table=z1_1&wr_id=579$ /bbs/board.php?bo_table=news&wr_id=42',
    );
  });
});
