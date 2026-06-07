import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildPostInsertSql,
  mapLegacyPostRow,
} from '../../tools/migration/post-transform.mjs';

const legacyRow = Object.freeze({
  wr_id: '579',
  wr_num: '-579',
  wr_reply: '',
  wr_parent: '579',
  wr_is_comment: '0',
  wr_comment: '0',
  wr_comment_reply: '',
  ca_name: '',
  wr_option: 'html1',
  wr_subject: "[부고] 8기 이웅표 성산회원's notice",
  wr_content: '<p>본문</p>',
  wr_link1: '',
  wr_link2: '',
  wr_hit: '12',
  mb_id: 'member01',
  wr_password: '',
  wr_name: '홍길동',
  wr_email: '',
  wr_homepage: '',
  wr_datetime: '2024-01-02 03:04:05',
  wr_file: '1',
  wr_last: '2024-01-02 03:04:05',
  wr_ip: '127.0.0.1',
});

describe('legacy post transform', () => {
  it('maps a legacy announcement row into news fields with audit ids', () => {
    const mapped = mapLegacyPostRow('z1_1', legacyRow);

    assert.equal(mapped.targetBoard, 'news');
    assert.equal(mapped.fields.ca_name, '공지');
    assert.equal(mapped.fields.wr_subject, legacyRow.wr_subject);
    assert.equal(mapped.fields.wr_1, 'notice');
    assert.equal(mapped.fields.wr_2, 'public');
    assert.equal(mapped.fields.wr_5, 'z1_1');
    assert.equal(mapped.fields.wr_6, '579');
  });

  it('maps schedule rows into event category and date fields', () => {
    const mapped = mapLegacyPostRow('schedule', {
      ...legacyRow,
      wr_id: '150',
      wr_subject: '[20251108] 성산회 25년도 연탄봉사',
    });

    assert.equal(mapped.targetBoard, 'news');
    assert.equal(mapped.fields.ca_name, '행사');
    assert.equal(mapped.fields.wr_1, 'event');
    assert.equal(mapped.fields.wr_3, '2025-11-08');
    assert.equal(mapped.fields.wr_4, '2025-11-08');
  });

  it('keeps excluded member-sensitive boards out of public imports', () => {
    const mapped = mapLegacyPostRow('z6_2', legacyRow);

    assert.equal(mapped.targetBoard, 'exclude');
    assert.equal(mapped.fields, null);
    assert.equal(mapped.reason, 'member-personal-data');
  });

  it('marks possible member directory posts for manual visibility review', () => {
    const mapped = mapLegacyPostRow('z5_4', {
      ...legacyRow,
      wr_subject: '2024년 총회 참석 회원명부',
    });

    assert.equal(mapped.targetBoard, 'news');
    assert.equal(mapped.fields.wr_1, 'general-meeting');
    assert.equal(mapped.fields.wr_7, 'review_required');
    assert.equal(mapped.fields.wr_8, 'possible-member-directory');
  });

  it('builds SQL insert for transformed posts', () => {
    const mapped = mapLegacyPostRow('z1_1', legacyRow);
    const sql = buildPostInsertSql(mapped, { tablePrefix: 'g5_' });

    assert.match(sql, /INSERT INTO `g5_write_news`/);
    assert.match(sql, /wr_subject/);
    assert.match(sql, /wr_facebook_user/);
    assert.match(sql, /wr_twitter_user/);
    assert.match(sql, /성산회원''s notice/);
    assert.match(sql, /wr_5/);
    assert.match(sql, /'z1_1'/);
  });
});
