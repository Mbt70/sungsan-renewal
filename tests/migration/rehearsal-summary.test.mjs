import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { describe, it } from 'node:test';

import { buildRehearsalSummary } from '../../tools/migration/rehearsal-summary.mjs';

const execFileAsync = promisify(execFile);

describe('migration rehearsal summary', () => {
  it('summarizes posts, members, attachments, redirects, and manual review counts', () => {
    const summary = buildRehearsalSummary({
      posts: [
        { targetBoard: 'news', fields: { wr_7: '' } },
        { legacyBoard: 'z5_4', targetBoard: 'news', fields: { wr_7: 'review_required', wr_8: 'possible-member-directory' } },
        { targetBoard: 'free', fields: { wr_7: '' } },
        { legacyBoard: 'z6_2', targetBoard: 'exclude', fields: null },
        { legacyBoard: 'z6_3', targetBoard: 'exclude', fields: null },
      ],
      members: [
        { fields: { mb_id: 'a', mb_level: '2', mb_3: 'password_reset_required' } },
        { fields: { mb_id: 'b', mb_level: '6', mb_3: 'password_reset_required' } },
        { fields: { mb_id: 'c', mb_level: '10', mb_3: '' } },
      ],
      attachmentPlan: {
        copyRecords: [{}, {}],
        fileRows: [{}, {}],
        blockedRecords: [
          { legacyBoard: 'z5_4', reason: 'blocked-extension' },
          { legacyBoard: 'z6_2', reason: 'excluded-target' },
        ],
      },
      redirectRecords: [{}, {}, {}],
    });

    assert.deepEqual(summary, {
      posts: {
        total: 5,
        news: 2,
        free: 1,
        excluded: 2,
        excludedByLegacyBoard: {
          z6_2: 1,
          z6_3: 1,
        },
        reviewRequired: 1,
        reviewReasons: {
          'possible-member-directory': 1,
        },
      },
      members: {
        total: 3,
        passwordResetRequired: 2,
        passwordResetMissing: 1,
        byLevel: {
          member: 1,
          officer: 1,
          admin: 1,
          pending: 0,
          unknown: 0,
        },
      },
      attachments: {
        copyRecords: 2,
        fileRows: 2,
        blockedRecords: 2,
        blockedByReason: {
          'blocked-extension': 1,
          'excluded-target': 1,
        },
        blockedByLegacyBoard: {
          z5_4: 1,
          z6_2: 1,
        },
      },
      redirects: {
        total: 3,
      },
    });
  });

  it('accepts UTF-8 BOM JSON from Windows PowerShell files', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'sungsan-rehearsal-'));
    const inputPath = join(dir, 'bundle.json');
    const outputPath = join(dir, 'summary.json');

    try {
      await writeFile(
        inputPath,
        '\uFEFF{"posts":[],"members":[],"attachmentPlan":{"copyRecords":[],"fileRows":[]},"redirectRecords":[]}',
        'utf8',
      );

      await execFileAsync('node', [
        'tools/migration/rehearsal-summary.mjs',
        inputPath,
        outputPath,
      ]);

      const summary = JSON.parse(await readFile(outputPath, 'utf8'));

      assert.equal(summary.posts.total, 0);
      assert.equal(summary.redirects.total, 0);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
