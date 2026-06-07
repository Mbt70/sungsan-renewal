import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildBoardFileInsertSql,
  buildAttachmentCopyPlan,
} from '../../tools/migration/file-plan.mjs';

describe('legacy attachment migration plan', () => {
  it('plans copy records and board_file inserts for imported posts', () => {
    const plan = buildAttachmentCopyPlan({
      legacyBoard: 'z1_1',
      legacyPostId: '579',
      targetBoard: 'news',
      targetPostId: '42',
      files: [
        {
          bf_no: '0',
          bf_source: "총회 자료's.pdf",
          bf_file: '../danger.pdf',
          bf_filesize: '12345',
          bf_width: '0',
          bf_height: '0',
          bf_type: '0',
          bf_datetime: '2024-01-02 03:04:05',
        },
      ],
    });

    assert.deepEqual(plan.copyRecords, [
      {
        sourcePath: '/renewal/data/file/z1_1/danger.pdf',
        targetPath: 'data/file/news/z1_1_579_danger.pdf',
        legacyBoard: 'z1_1',
        legacyPostId: 579,
        targetBoard: 'news',
        targetPostId: 42,
        sourceFile: 'danger.pdf',
        targetFile: 'z1_1_579_danger.pdf',
      },
    ]);

    assert.equal(plan.fileRows[0].bo_table, 'news');
    assert.equal(plan.fileRows[0].wr_id, 42);
    assert.equal(plan.fileRows[0].bf_source, "총회 자료's.pdf");
    assert.equal(plan.fileRows[0].bf_file, 'z1_1_579_danger.pdf');
  });

  it('skips excluded and intro targets', () => {
    const plan = buildAttachmentCopyPlan({
      legacyBoard: 'z6_2',
      legacyPostId: '1',
      targetBoard: 'exclude',
      targetPostId: '',
      files: [{ bf_no: '0', bf_file: 'member.xls' }],
    });

    assert.deepEqual(plan.copyRecords, []);
    assert.deepEqual(plan.fileRows, []);
  });

  it('builds SQL insert rows for the GnuBoard board file table', () => {
    const plan = buildAttachmentCopyPlan({
      legacyBoard: 'z1_1',
      legacyPostId: '579',
      targetBoard: 'news',
      targetPostId: '42',
      files: [{ bf_no: '0', bf_source: '공지.pdf', bf_file: 'notice.pdf' }],
    });
    const sql = buildBoardFileInsertSql(plan.fileRows[0], { tablePrefix: 'g5_' });

    assert.match(sql, /INSERT INTO `g5_board_file`/);
    assert.match(sql, /'news'/);
    assert.match(sql, /'z1_1_579_notice.pdf'/);
    assert.match(sql, /ON DUPLICATE KEY UPDATE/);
  });
});
