import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  LEGACY_BOARD_MAP,
  getLegacyBoardMapping,
  mapLegacyMemberLevel,
  toRedirectRecord,
} from '../../tools/migration/legacy-map.mjs';

describe('legacy board mapping', () => {
  it('maps announcement boards into news categories', () => {
    assert.deepEqual(getLegacyBoardMapping('z1_1'), {
      legacyBoard: 'z1_1',
      legacyName: '공지사항',
      target: 'news',
      category: '공지',
      groupSlug: 'notice',
      visibility: 'public',
    });
  });

  it('maps activity boards into news with department slugs', () => {
    assert.equal(getLegacyBoardMapping('z3_3').target, 'news');
    assert.equal(getLegacyBoardMapping('z3_3').category, '활동소식');
    assert.equal(getLegacyBoardMapping('z3_3').groupSlug, 'welfare');
    assert.equal(getLegacyBoardMapping('z4_2').groupSlug, 'leaders-club');
  });

  it('maps static introduction boards to intro sections', () => {
    assert.deepEqual(getLegacyBoardMapping('z2_5'), {
      legacyBoard: 'z2_5',
      legacyName: '조직도',
      target: 'intro',
      introSection: 'organization',
      visibility: 'public',
    });
  });

  it('keeps member-sensitive boards excluded from public migration', () => {
    assert.deepEqual(getLegacyBoardMapping('z6_2'), {
      legacyBoard: 'z6_2',
      legacyName: '회원정보',
      target: 'exclude',
      reason: 'member-personal-data',
      visibility: 'admin',
    });
  });

  it('contains every public legacy board discovered from the current site', () => {
    const expected = [
      'schedule',
      'z1_1',
      'z1_2',
      'z1_3',
      'z2_1',
      'z2_2',
      'z2_3',
      'z2_4',
      'z2_5',
      'z3_1',
      'z3_2',
      'z3_3',
      'z3_4',
      'z3_5',
      'z3_6',
      'z3_7',
      'z3_9',
      'z4_1',
      'z4_2',
      'z4_3',
      'z5_1',
      'z5_2',
      'z5_3',
      'z5_4',
      'z5_5',
      'z5_6',
      'z6_1',
      'z6_2',
      'z6_3',
    ];

    assert.deepEqual(Object.keys(LEGACY_BOARD_MAP).sort(), expected.sort());
  });
});

describe('legacy member level mapping', () => {
  it('resets regular users and preserves elevated operators', () => {
    assert.equal(mapLegacyMemberLevel(1), 2);
    assert.equal(mapLegacyMemberLevel(2), 2);
    assert.equal(mapLegacyMemberLevel(6), 6);
    assert.equal(mapLegacyMemberLevel(10), 10);
  });
});

describe('redirect records', () => {
  it('records legacy board and post ids for audit redirects', () => {
    assert.deepEqual(toRedirectRecord({ boTable: 'z1_1', wrId: 579, newBoard: 'news', newWrId: 42 }), {
      legacyPath: '/renewal/bbs/board.php?bo_table=z1_1&wr_id=579',
      targetPath: '/bbs/board.php?bo_table=news&wr_id=42',
      legacyBoard: 'z1_1',
      legacyPostId: 579,
      targetBoard: 'news',
      targetPostId: 42,
    });
  });
});
