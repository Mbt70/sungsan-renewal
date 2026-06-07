import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { decodeLegacyDump, normalizeSqlDump } from '../../tools/migration/dump-normalizer.mjs';

describe('legacy dump normalizer', () => {
  it('decodes euc-kr buffers into utf-8 strings', () => {
    const bytes = Uint8Array.from([0xbc, 0xba, 0xbb, 0xea]);
    assert.equal(decodeLegacyDump(bytes), '성산');
  });

  it('normalizes common mysql charset clauses to utf8mb4', () => {
    const input = [
      'CREATE TABLE `g4_write_z1_1` (`wr_subject` varchar(255)) ENGINE=MyISAM DEFAULT CHARSET=euckr;',
      '/*!40101 SET NAMES euckr */;',
    ].join('\n');

    assert.equal(
      normalizeSqlDump(input),
      [
        'CREATE TABLE `g4_write_z1_1` (`wr_subject` varchar(255)) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;',
        '/*!40101 SET NAMES utf8mb4 */;',
      ].join('\n'),
    );
  });
});
