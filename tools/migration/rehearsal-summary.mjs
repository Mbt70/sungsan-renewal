import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

function countBy(items, predicate) {
  return items.filter(predicate).length;
}

function countsBy(items, keySelector) {
  return items.reduce((counts, item) => {
    const key = keySelector(item);

    if (!key) {
      return counts;
    }

    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function memberLevelBucket(member) {
  const level = Number(member.fields?.mb_level);

  if (!Number.isFinite(level)) {
    return 'unknown';
  }

  if (level >= 10) {
    return 'admin';
  }

  if (level >= 6) {
    return 'officer';
  }

  if (level >= 2) {
    return 'member';
  }

  return 'pending';
}

function memberLevelCounts(members) {
  return {
    member: countBy(members, (member) => memberLevelBucket(member) === 'member'),
    officer: countBy(members, (member) => memberLevelBucket(member) === 'officer'),
    admin: countBy(members, (member) => memberLevelBucket(member) === 'admin'),
    pending: countBy(members, (member) => memberLevelBucket(member) === 'pending'),
    unknown: countBy(members, (member) => memberLevelBucket(member) === 'unknown'),
  };
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
      excludedByLegacyBoard: countsBy(
        posts.filter((post) => post.targetBoard === 'exclude'),
        (post) => post.legacyBoard || post.fields?.wr_5,
      ),
      reviewRequired: countBy(posts, (post) => post.fields?.wr_7 === 'review_required'),
      reviewReasons: countsBy(
        posts.filter((post) => post.fields?.wr_7 === 'review_required'),
        (post) => post.fields?.wr_8,
      ),
    },
    members: {
      total: members.length,
      passwordResetRequired: countBy(
        members,
        (member) => member.fields?.mb_3 === 'password_reset_required',
      ),
      passwordResetMissing: countBy(
        members,
        (member) => member.fields?.mb_3 !== 'password_reset_required',
      ),
      byLevel: memberLevelCounts(members),
    },
    attachments: {
      copyRecords: attachmentPlan.copyRecords?.length ?? 0,
      fileRows: attachmentPlan.fileRows?.length ?? 0,
      blockedRecords: attachmentPlan.blockedRecords?.length ?? 0,
      blockedByReason: countsBy(attachmentPlan.blockedRecords ?? [], (record) => record.reason),
      blockedByLegacyBoard: countsBy(attachmentPlan.blockedRecords ?? [], (record) => record.legacyBoard),
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
