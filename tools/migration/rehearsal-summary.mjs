import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

function countBy(items, predicate) {
  return items.filter(predicate).length;
}

function parseBundleText(text) {
  return JSON.parse(String(text).replace(/^\uFEFF/, '').trim());
}

export function buildRehearsalSummary({
  posts = [],
  members = [],
  attachmentPlan = {},
  redirectRecords = [],
} = {}) {
  return {
    posts: {
      total: posts.length,
      news: countBy(posts, (post) => post.targetBoard === 'news'),
      free: countBy(posts, (post) => post.targetBoard === 'free'),
      excluded: countBy(posts, (post) => post.targetBoard === 'exclude'),
      reviewRequired: countBy(posts, (post) => post.fields?.wr_7 === 'review_required'),
    },
    members: {
      total: members.length,
      passwordResetRequired: countBy(
        members,
        (member) => member.fields?.mb_3 !== 'password_migrated',
      ),
    },
    attachments: {
      copyRecords: attachmentPlan.copyRecords?.length ?? 0,
      fileRows: attachmentPlan.fileRows?.length ?? 0,
      blockedRecords: attachmentPlan.blockedRecords?.length ?? 0,
    },
    redirects: {
      total: redirectRecords.length,
    },
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [, , inputPath, outputPath] = process.argv;

  if (!inputPath || !outputPath) {
    console.error('Usage: node tools/migration/rehearsal-summary.mjs <bundle.json> <summary.json>');
    process.exit(1);
  }

  const bundle = parseBundleText(await readFile(inputPath, 'utf8'));
  const summary = buildRehearsalSummary(bundle);

  await writeFile(outputPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(`Wrote migration rehearsal summary to ${outputPath}`);
}
