import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('overlay script', () => {
  it('copies custom skins to pc and mobile GnuBoard skin paths', () => {
    const source = readFileSync(path.join(process.cwd(), 'scripts', 'overlay.ps1'), 'utf8');

    assert.match(source, /From = "skin"; To = "skin"/);
    assert.match(source, /From = "skin\\board"; To = "mobile\\skin\\board"/);
    assert.match(source, /From = "skin\\member"; To = "mobile\\skin\\member"/);
    assert.match(source, /From = "skin\\latest"; To = "mobile\\skin\\latest"/);
  });
});
