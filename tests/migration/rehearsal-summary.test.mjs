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
        { targetBoard: 'news', fields: { wr_7: 'review_required' } },
        { targetBoard: 'free', fields: { wr_7: '' } },
        { targetBoard: 'exclude', fields: null },
      ],
      members: [{ fields: { mb_id: 'a' } }, { fields: { mb_id: 'b' } }],
      attachmentPlan: {
        copyRecords: [{}, {}],
        fileRows: [{}, {}],
      },
      redirectRecords: [{}, {}, {}],
    });

    assert.deepEqual(summary, {
      posts: {
        total: 4,
        news: 2,
        free: 1,
        excluded: 1,
        reviewRequired: 1,
      },
      members: {
        total: 2,
        passwordResetRequired: 2,
      },
      attachments: {
        copyRecords: 2,
        fileRows: 2,
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
