import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildMemberInsertSql,
  mapLegacyMemberRow,
} from '../../tools/migration/member-transform.mjs';

const legacyMember = Object.freeze({
  mb_no: '77',
  mb_id: 'Hong.Member',
  mb_password: 'legacy-hash-should-not-move',
  mb_name: "홍길동's",
  mb_nick: '',
  mb_email: 'hong@example.com',
  mb_level: '6',
  mb_tel: '02-123-4567',
  mb_hp: '010-1234-5678',
  mb_datetime: '2018-02-03 04:05:06',
  mb_ip: '192.0.2.10',
});

describe('legacy member transform', () => {
  it('maps members without carrying legacy password hashes', () => {
    const mapped = mapLegacyMemberRow(legacyMember);

    assert.equal(mapped.legacyMemberId, 'Hong.Member');
    assert.equal(mapped.fields.mb_id, 'hong_member');
    assert.equal(mapped.fields.mb_password, '');
    assert.equal(mapped.fields.mb_name, "홍길동's");
    assert.equal(mapped.fields.mb_nick, "홍길동's");
    assert.equal(mapped.fields.mb_email, 'hong@example.com');
    assert.equal(mapped.fields.mb_level, '6');
    assert.equal(mapped.fields.mb_1, 'legacy_member');
    assert.equal(mapped.fields.mb_2, '77');
    assert.equal(mapped.fields.mb_3, 'password_reset_required');
  });

  it('downgrades regular members to approval-safe level and blocks invalid ids', () => {
    const mapped = mapLegacyMemberRow({
      ...legacyMember,
      mb_id: '../bad id',
      mb_level: '1',
    });

    assert.equal(mapped.fields.mb_id, 'bad_id');
    assert.equal(mapped.fields.mb_level, '2');
  });

  it('builds idempotent member SQL for rehearsal imports', () => {
    const mapped = mapLegacyMemberRow(legacyMember);
    const sql = buildMemberInsertSql(mapped, { tablePrefix: 'g5_' });

    assert.match(sql, /INSERT INTO `g5_member`/);
    assert.match(sql, /mb_password/);
    assert.match(sql, /'hong_member'/);
    assert.match(sql, /'홍길동''s'/);
    assert.match(sql, /'password_reset_required'/);
    assert.match(sql, /ON DUPLICATE KEY UPDATE/);
    assert.doesNotMatch(sql, /legacy-hash-should-not-move/);
  });
});
